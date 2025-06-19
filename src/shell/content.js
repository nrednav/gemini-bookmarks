console.log('Gemini Bookmarker: Content script loaded.');

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

  bookmarkButton.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    console.log('Bookmark button clicked!', responseElement);
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

console.log('Gemini Bookmarker: Scanning for existing response elements...');

document.querySelectorAll('model-response').forEach(processNewResponse);
