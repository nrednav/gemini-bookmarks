import { waitForElement } from "../helpers/wait-for-element";
import { generateContentHash } from "../helpers/generate-content-hash";
import { updateBookmarkButtonUi } from "./render-ui";
import { toggleBookmark } from "../core/actions";

/**
 * Injects a bookmark button into a model response element.
 * @param {HTMLElement} responseElement - The model response DOM element.
 * @param {import('../core/types.js').Dependencies} dependencies - The application-wide dependencies.
 */
export const injectBookmarkButton = async (responseElement, dependencies) => {
  const { window, uiElements, elementSelectors, stateManager, logger } = dependencies;

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

/**
 * Handles the logic when a bookmark button is clicked.
 * @param {HTMLElement} responseElement
 * @param {{id: string, content: string}} bookmarkData
 * @param {import('../core/types.js').Dependencies} dependencies
 */
const handleBookmarkClick = async (responseElement, { id, content }, dependencies) => {
  const { stateManager } = dependencies;
  const currentState = stateManager.getState();
  const existingBookmark = currentState.bookmarks.find(bookmark => bookmark.id === id);

  responseElement.id = id;

  if (existingBookmark) {
    await toggleBookmark(dependencies, { id, content, tags: [] });
  } else {
    createTagEditor(responseElement, async (tags) => {
      await toggleBookmark(dependencies, { id, content, tags });
    });
  }
};

/**
 * Creates and injects a temporary UI for editing tags.
 * @param {HTMLElement} responseElement - The element to anchor the editor to.
 * @param {(tags: string[]) => void} onSave - Callback executed with the tags when saved.
 */
const createTagEditor = (responseElement, onSave) => {
  if (responseElement.querySelector('.tag-editor')) {
    return;
  }

  const editorContainer = document.createElement('div');

  editorContainer.className = 'tag-editor';

  const input = document.createElement('input');

  input.type = 'text';
  input.placeholder = chrome.i18n.getMessage("tagEditorPlaceholder");
  input.className = 'tag-editor-input';

  const saveButton = document.createElement('button');

  saveButton.textContent = chrome.i18n.getMessage("tagEditorSaveButton");
  saveButton.className = 'tag-editor-save';

  const cancelButton = document.createElement('button');

  cancelButton.textContent = chrome.i18n.getMessage("tagEditorCancelButton");
  cancelButton.className = 'tag-editor-cancel';

  const cleanup = () => editorContainer.remove();
  const handleSave = () => {
    const tags = input.value
      ? input.value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    onSave(tags);
    cleanup();
  };

  saveButton.addEventListener('click', handleSave);
  cancelButton.addEventListener('click', cleanup);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      cleanup();
    }
  });

  editorContainer.appendChild(input);
  editorContainer.appendChild(saveButton);
  editorContainer.appendChild(cancelButton);
  responseElement.appendChild(editorContainer);

  input.focus();
};
