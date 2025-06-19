async function main() {
  console.log('Gemini Bookmarker: Content script loaded.');

  const conversationKey = `bookmarks-${window.location.pathname}`;

  let currentState = await loadState(conversationKey);

  function processNewResponse(responseElement) {
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

      const tagsString = window.prompt("Enter optional tags for this bookmark, separated by commas:", "");

      const tags = tagsString
        ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const newBookmarkData = {
        content: responseElement.innerText,
        tags: tags
      };

      const newState = GeminiBookmarker.addBookmark(currentState, newBookmarkData);

      currentState = newState;

      await saveState(conversationKey, currentState);

      console.log('Bookmark added and saved! New state:', currentState);
    };

    responseElement.appendChild(bookmarkButton);
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
