async function main() {
  console.log('Gemini Bookmarker: Content script loaded.');

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

  const fabButton = document.querySelector('.gb-fab');
  const panel = document.querySelector('.gb-panel');

  if (fabButton && panel) {
    fabButton.addEventListener('click', () => {
      panel.classList.toggle('visible');
    });
  }

  const conversationKey = `bookmarks-${window.location.pathname}`;

  let currentState = await loadState(conversationKey);

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

  function processNewResponse(responseElement) {
    const responseId = responseElement.id || `gemini-bookmarked-response-${Date.now()}`;

    responseElement.id = responseId;

    if (responseElement.dataset.processedByExtension) {
      return;
    }

    responseElement.dataset.processedByExtension = 'true';

    responseElement.classList.add('bookmark-container');

    const bookmarkButton = document.createElement('button');

    bookmarkButton.className = 'bookmark-button';
    bookmarkButton.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>
  `;

    bookmarkButton.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();

      const existingBookmark = currentState.bookmarks.find(bookmark => bookmark.id === responseId);

      if (existingBookmark) {
        currentState = GeminiBookmarker.removeBookmark(currentState, responseId);
        console.log('Bookmark removed!');
      } else {
        const tagsString = window.prompt("Enter optional tags for this bookmark, separated by commas:", "");

        if (tagsString === null) {
          return;
        }

        const tags = tagsString
          ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
          : [];

        const newBookmarkData = {
          id: responseId,
          content: responseElement.innerText,
          tags: tags
        };

        const newState = GeminiBookmarker.addBookmark(currentState, newBookmarkData);

        currentState = newState;

        console.log('Bookmark added!');
      }

      await saveState(conversationKey, currentState);

      updateButtonState(bookmarkButton, responseId);
    };

    responseElement.appendChild(bookmarkButton);

    updateButtonState(bookmarkButton, responseId);
  }

  function handleDOMChanges(mutations) {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') {
        continue;
      }

      for (const addedNode of mutation.addedNodes) {
        if(addedNode.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }

        if(addedNode.matches('model-response')) {
          processNewResponse(addedNode);
        }

        const responses = addedNode.querySelectorAll('model-response');

        responses.forEach(processNewResponse);
      }
    }
  }

  const observerConfig = {
    childList: true,
    subtree: true
  };

  const observer = new MutationObserver(handleDOMChanges);

  observer.observe(document.body, observerConfig);

  document.querySelectorAll('model-response').forEach(processNewResponse);
}

async function loadState(key) {
  const data = await browser.storage.local.get(key);
  const loadedState = data[key] || GeminiBookmarker.initialState;

  console.log('State loaded for key:', key, loadedState);

  return loadedState;
}

async function saveState(key, state) {
  await browser.storage.local.set({ [key]: state });
}

main();
