async function loadState(key) {
  const data = await browser.storage.local.get(key);
  const loadedState = data[key] || GeminiBookmarker.initialState;

  return loadedState;
}

async function saveState(key, state) {
  await browser.storage.local.set({ [key]: state });
}

async function main() {
  console.log('Gemini Bookmarker: Content script loaded.');

  await waitForElement(document.body, 'model-response');

  const conversationKey = `bookmarks-${window.location.pathname}`;

  let currentState = await loadState(conversationKey);

  const ui = injectUI();

  function render() {
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
    const uniqueTags = GeminiBookmarker.getUniqueTags(currentState);

    ui.tagsContainer.innerHTML = uniqueTags.map(tag => {
      return `<button class="gb-tag-filter" data-tag="${tag}">${tag}</button>`;
    }).join("");

    if (currentState.bookmarks.length === 0) {
      ui.bookmarksContainer.innerHTML = `<p class="gb-panel__empty-message">No bookmarks yet. Click the icon on a response to bookmark it!</p>`;
      return;
    }

    ui.bookmarksContainer.innerHTML = currentState.bookmarks.map(bookmark => `
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
      currentState = GeminiBookmarker.removeBookmark(currentState, bookmarkId);
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

      currentState = GeminiBookmarker.addBookmark(currentState, newBookmarkData);
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
      console.warn("Gemini Bookmarker: Could not process a response element.", error.message, responseElement);
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

  for (const modelResponse of ui.modelResponses) {
    await addBookmarkButtonTo(modelResponse);
  }

  setupEventListeners(ui);
  startObserver();
  render();
}

function injectUI() {
  const uiShellHTML = `
    <div class="gemini-bookmarker-container">
      <div class="gb-panel">
        <div class="gb-panel__header">
          <h3>Bookmarked Responses</h3>
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

  document.body.insertAdjacentHTML('beforeend', uiShellHTML);

  return {
    fab: document.querySelector('.gb-fab'),
    panel: document.querySelector('.gb-panel'),
    tagsContainer: document.getElementById('gb-tags-list'),
    bookmarksContainer: document.getElementById('gb-bookmarks-list'),
    get bookmarkButtons() {
      return document.querySelectorAll('.bookmark-button')
    },
    get modelResponses() {
      return document.querySelectorAll('model-response');
    }
  };
}

function setupEventListeners(ui) {
  if (ui.fab && ui.panel) {
    ui.fab.addEventListener('click', () => {
      ui.panel.classList.toggle('visible');
    });
  }

  if (ui.bookmarksContainer) {
    ui.bookmarksContainer.addEventListener('click', (e) => {
      const clickedBookmark = e.target.closest('.gb-bookmark');

      if (!clickedBookmark) {
        return;
      }

      const bookmarkId = clickedBookmark.dataset.bookmarkId;

      if (!bookmarkId) {
        return;
      }

      const responseElement = document.getElementById(bookmarkId);

      if (responseElement) {
        responseElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        responseElement.classList.add('bookmark-highlight');

        setTimeout(() => {
          responseElement.classList.remove('bookmark-highlight');
        }, 1500);
      }
    });
  }
}

async function generateContentHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const contentHash = hashArray.map(bytes => bytes.toString(16).padStart(2, '0')).join('');

  return contentHash;
}

main();
