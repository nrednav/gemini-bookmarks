import { waitForElement } from "../helpers/wait-for-element";
import { generateContentHash } from "../helpers/generate-content-hash";
import { renderUi, updateBookmarkButtonUi } from "./render-ui";
import { addBookmark, removeBookmark } from "../core/logic";

export const injectBookmarkButton = async (responseElement, dependencies) => {
  const { window, uiElements, elementSelectors, stateManager } = dependencies;

  const currentState = stateManager.getState();

  if (responseElement.dataset.processedByExtension) {
    return;
  }

  responseElement.dataset.processedByExtension = "true";

  try {
    const contentElement = await waitForElement(responseElement, elementSelectors.modelResponse.messageContent);
    const content = contentElement.innerText.trim();
    const contentHash = await generateContentHash(content);

    const isBookmarked = currentState.bookmarks.some(bookmark => bookmark.id === contentHash);

    if (isBookmarked) {
      responseElement.id = contentHash;
    }

    responseElement.classList.add('bookmark-container');

    const bookmarkButton = window.document.createElement('button');

    bookmarkButton.className = 'bookmark-button';
    bookmarkButton.innerHTML = `<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>`;
    bookmarkButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      await handleBookmarkClick(responseElement, {
        id: contentHash,
        content: content,
        window: window,
        uiElements: uiElements,
        elementSelectors: elementSelectors,
        stateManager: stateManager
      });
    });

    responseElement.appendChild(bookmarkButton);

    updateBookmarkButtonUi(bookmarkButton, isBookmarked ? contentHash : responseElement.id, currentState);
  } catch (error) {
    console.error(`Gemini Bookmarks: Failed to inject bookmark button into model response. Reason = ${error.message}`);
  }
}

const handleBookmarkClick = async (responseElement, dependencies) => {
  const { id, content, window, uiElements, elementSelectors, stateManager } = dependencies;

  const currentState = stateManager.getState();

  responseElement.id = id;

  const existingBookmark = currentState.bookmarks.find(bookmark => bookmark.id === id);

  if (existingBookmark) {
    const stateWithBookmarkRemoved = removeBookmark(currentState, id);

    stateManager.setState(stateWithBookmarkRemoved);
  } else {
    const tagsString = window.prompt("Enter optional tags for this bookmark, separated by commas:", "");

    if (tagsString === null) {
      return;
    }

    const tags = tagsString
      ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    const newBookmarkData = { id, content, tags };

    const stateWithBookmarkAdded = addBookmark(currentState, newBookmarkData);

    stateManager.setState(stateWithBookmarkAdded);
  }

  await stateManager.saveStateToStorage();

  renderUi({ window, uiElements, elementSelectors, stateManager });
};
