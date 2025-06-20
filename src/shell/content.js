let currentObserver = null;

async function loadState(key) {
  const data = await browser.storage.local.get(key);
  const loadedState = data[key] || GeminiBookmarks.initialState;

  return loadedState;
}

async function saveState(key, state) {
  await browser.storage.local.set({ [key]: state });
}

function injectUI() {
  const uiShellHTML = `
    <div class="gemini-bookmarks-container">
      <div class="gb-panel">
        <div class="gb-panel__header">
          <h3>Bookmarked Responses</h3>
          <button class="gb-clear-all-button" title="Remove all bookmarks for this conversation">Clear All</button>
        </div>
        <div class="gb-panel__tags" id="gb-tags-list">
          </div>
        <div class="gb-panel__bookmarks" id="gb-bookmarks-list">
          </div>
      </div>

      <button class="gb-fab" title="View Bookmarks">
        <svg viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", uiShellHTML);

  return {
    fab: document.querySelector(".gb-fab"),
    panel: document.querySelector(".gb-panel"),
    tagsContainer: document.getElementById("gb-tags-list"),
    bookmarksContainer: document.getElementById("gb-bookmarks-list"),
    clearAllButton: document.querySelector('.gb-clear-all-button'),
    get bookmarkButtons() {
      return document.querySelectorAll(".bookmark-button")
    },
    get modelResponses() {
      return document.querySelectorAll("model-response");
    }
  };
}

async function generateContentHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contentHash = hashArray.map(bytes => bytes.toString(16).padStart(2, '0')).join('');

  return contentHash;
}

async function initializeApp() {
  console.log('Gemini Bookmarks: Content script loaded.');

  if (currentObserver) {
    currentObserver.disconnect();
  }

  const oldUI = document.querySelector('.gemini-bookmarks-container');

  if (oldUI) {
    oldUI.remove();
  }

  await waitForElement(document.body, 'model-response');

  const conversationKey = `bookmarks-${window.location.pathname}`;

  let currentState = await loadState(conversationKey);
  let activeTagFilters = [];

  const ui = injectUI();

  function render() {
    if (ui.clearAllButton) {
      ui.clearAllButton.disabled = currentState.bookmarks.length === 0;
    }

    renderPanelContent();
    updateAllButtonStates();
  };

  function updateButtonState(button, responseId) {
    const isBookmarked = currentState.bookmarks.some(bookmark => bookmark.id === responseId);

    if (isBookmarked) {
      button.classList.add('active');
      button.title = 'Click to remove bookmark';
    } else {
      button.classList.remove('active');
      button.title = 'Click to add bookmark';
    }
  }

  function updateAllButtonStates() {
    for (const bookmarkButton of ui.bookmarkButtons) {
      const responseElement = bookmarkButton.closest('model-response');

      if (responseElement) {
        updateButtonState(bookmarkButton, responseElement.id);
      }
    }
  }

  function renderPanelContent() {
    const uniqueTags = GeminiBookmarks.getUniqueTags(currentState);

    ui.tagsContainer.innerHTML = uniqueTags.map(tag => {
      const isActive = activeTagFilters.includes(tag);
      return `<button class="gb-tag-filter ${isActive ? 'active' : ''}" data-tag="${tag}">${tag}</button>`;
    }).join("");

    const bookmarksToShow = activeTagFilters.length > 0
      ? GeminiBookmarks.filterBookmarksByTags(currentState, activeTagFilters)
      : currentState.bookmarks;

    if (currentState.bookmarks.length === 0) {
      ui.bookmarksContainer.innerHTML = `<p class="gb-panel__empty-message">No bookmarks yet. Click the icon on a response to bookmark it!</p>`;
      return;
    }

    const sortedBookmarks = bookmarksToShow
      .map(bookmark => {
        const element = document.getElementById(bookmark.id);

        return {
          ...bookmark,
          position: element?.offsetTop ?? Infinity
        };
      })
    .sort((a, b) => a.position - b.position);

    ui.bookmarksContainer.innerHTML = sortedBookmarks.map(bookmark => `
      <div class="gb-bookmark" data-bookmark-id="${bookmark.id}" title="Click to scroll to this response">
        <p class="gb-bookmark__content">${bookmark.content.substring(0, 120)}...</p>
        <div class="gb-bookmark__tags">
          ${bookmark.tags.map(tag => `<span class="gb-bookmark__tag">${tag}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  async function handleBookmarkClick(responseElement, content, bookmarkId) {
    responseElement.id = bookmarkId;

    const existingBookmark = currentState.bookmarks.find(bookmark => bookmark.id === bookmarkId);

    if (existingBookmark) {
      currentState = GeminiBookmarks.removeBookmark(currentState, bookmarkId);
    } else {
      const tagsString = window.prompt("Enter optional tags for this bookmark, separated by commas:", "");

      if (tagsString === null) {
        return;
      }

      const tags = tagsString
        ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const newBookmarkData = {
        id: bookmarkId,
        content: content,
        tags: tags
      };

      currentState = GeminiBookmarks.addBookmark(currentState, newBookmarkData);
    }

    saveState(conversationKey, currentState).then(render);
  }

  function startObserver() {
    const observer = new MutationObserver((mutations) => {
      const newNodes = new Set();

      for (const mutation of mutations) {
        if (mutation.type !== 'childList') {
          continue;
        }

        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType !== Node.ELEMENT_NODE) {
            continue;
          }

          if (addedNode.matches('model-response')) {
            newNodes.add(addedNode);
          }

          addedNode.querySelectorAll('model-response').forEach((modelResponseNode) => {
            newNodes.add(modelResponseNode);
          });
        }
      }

      newNodes.forEach(addBookmarkButtonTo);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    currentObserver = observer;
  }

  async function addBookmarkButtonTo(responseElement) {
    if (responseElement.dataset.processedByExtension) {
      return;
    }

    responseElement.dataset.processedByExtension = "true";

    try {
      const contentElement = await waitForElement(responseElement, "message-content");
      const content = contentElement.innerText.trim();
      const contentHash = await generateContentHash(content);

      const isBookmarked = currentState.bookmarks.some(bookmark => bookmark.id === contentHash);

      if (isBookmarked) {
        responseElement.id = contentHash;
      }

      responseElement.classList.add('bookmark-container');

      const bookmarkButton = document.createElement('button');

      bookmarkButton.className = 'bookmark-button';
      bookmarkButton.innerHTML = `<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>`;
      bookmarkButton.onclick = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        await handleBookmarkClick(responseElement, content, contentHash);
      };

      responseElement.appendChild(bookmarkButton);

      updateButtonState(bookmarkButton, isBookmarked ? contentHash : responseElement.id);
    } catch (error) {
      console.warn("Gemini Bookmarks: Could not process a response element.", error.message, responseElement);
    }
  }

  function waitForElement(parentElement, selector, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const element = parentElement.querySelector(selector);

      if (element) {
        resolve(element);
        return;
      }

      const interval = setInterval(() => {
        const element = parentElement.querySelector(selector);

        if (element) {
          clearInterval(interval);
          resolve(element);
        }
      }, 150);

      setTimeout(() => {
        clearInterval(interval);
        reject(new Error(`Element with selector "${selector} not found within ${timeout} ms."`));
      }, timeout);
    });
  }

  function setupEventListeners(ui) {
    if (ui.fab && ui.panel) {
      ui.fab.addEventListener("click", () => {
        ui.panel.classList.toggle("visible");
      });
    }

    if (ui.bookmarksContainer) {
      ui.bookmarksContainer.addEventListener("click", (e) => {
        const clickedBookmark = e.target.closest(".gb-bookmark");

        if (!clickedBookmark) {
          return;
        }

        const bookmarkId = clickedBookmark.dataset.bookmarkId;

        if (!bookmarkId) {
          return;
        }

        const responseElement = document.getElementById(bookmarkId);

        if (responseElement) {
          responseElement.scrollIntoView({ behavior: "smooth", block: "start" });
          responseElement.classList.add("bookmark-highlight");

          setTimeout(() => {
            responseElement.classList.remove("bookmark-highlight");
          }, 1500);
        }
      });
    }

    if (ui.tagsContainer) {
      ui.tagsContainer.addEventListener("click", (e) => {
        const clickedTagButton = e.target.closest(".gb-tag-filter");

        if (!clickedTagButton) {
          return;
        }

        const tag = clickedTagButton.dataset.tag;

        if (activeTagFilters.includes(tag)) {
          activeTagFilters = activeTagFilters.filter((activeTagFilter) => activeTagFilter !== tag);
        } else {
          activeTagFilters.push(tag);
        }

        render();
      });
    }

    if (ui.clearAllButton) {
      ui.clearAllButton.addEventListener("click", () => {
        if (window.confirm("Are you sure you want to remove ALL bookmarks for this conversation?")) {
          clearAllBookmarks();
        }
      });
    }
  }

  async function clearAllBookmarks() {
    currentState = GeminiBookmarks.initialState;

    await saveState(conversationKey, currentState);

    render();
  }

  for (const modelResponse of ui.modelResponses) {
    await addBookmarkButtonTo(modelResponse);
  }

  setupEventListeners(ui);
  startObserver();
  render();
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "NAVIGATION") {
    await initializeApp();
  }
});

initializeApp();
