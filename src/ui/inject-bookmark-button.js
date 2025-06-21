import { waitForElement } from "../helpers/wait-for-element";
import { generateContentHash } from "../helpers/generate-content-hash";
import { updateBookmarkButtonUi } from "./render-ui";
import { toggleBookmark } from "../core/actions";
import { logger } from "../shell/logger";

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

      await handleBookmarkClick(responseElement, { id: contentHash, content: content }, dependencies);
    });

    responseElement.appendChild(bookmarkButton);

    uiElements.bookmarkButtons.push(bookmarkButton);

    updateBookmarkButtonUi(bookmarkButton, isBookmarked ? contentHash : responseElement.id, currentState);
  } catch (error) {
    logger.error(`Failed to inject bookmark button into model response. Reason = ${error.message}`);
  }
}

const handleBookmarkClick = async (responseElement, dependencies) => {
  const { window, stateManager } = dependencies;
  const currentState = stateManager.getState();
  const existingBookmark = currentState.bookmarks.find(bookmark => bookmark.id === id);

  responseElement.id = id;

  let tags = [];

  if (!existingBookmark) {
    const tagsString = window.prompt("Enter optional tags for this bookmark, separated by commas:", "");

    if (tagsString === null) {
      return;
    }

    tags = tagsString
      ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
  }

  await toggleBookmark(dependencies, { id, content, tags });
};
