import { toggleBookmark } from "../core/actions";
import { createIconElement } from "../helpers/create-icon-element.js";
import { generateContentHash } from "../helpers/generate-content-hash";
import { waitForResponseContent } from "../helpers/wait-for-response-content.js";
import { actionIcons } from "./icons.js";
import { updateBookmarkButtonUi } from "./render-ui";

/**
 * Injects a bookmark button into a model response element.
 * @param {HTMLElement} responseElement - The model response DOM element.
 * @param {import('../core/types.js').Dependencies} dependencies - The application-wide dependencies.
 */
export const injectBookmarkButton = async (responseElement, dependencies) => {
  const { window, uiElements, elementSelectors, stateManager, logger } =
    dependencies;

  if (responseElement.dataset.processedByExtension) {
    return;
  }

  responseElement.dataset.processedByExtension = "true";

  try {
    const content = await waitForResponseContent({
      responseElement: responseElement,
      contentSelector: elementSelectors.modelResponse.messageContent,
    });

    const contentHash = await generateContentHash(content);

    responseElement.id = contentHash;

    const currentState = stateManager.getState();

    responseElement.classList.add("bookmark-container");

    const bookmarkButton = window.document.createElement("button");

    bookmarkButton.className = "bookmark-button";
    bookmarkButton.append(createIconElement(actionIcons.bookmark));
    bookmarkButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();

      await handleBookmarkClick(responseElement, dependencies);
    });

    updateBookmarkButtonUi(bookmarkButton, contentHash, currentState);

    responseElement.appendChild(bookmarkButton);
    uiElements.bookmarkButtons.push(bookmarkButton);
  } catch (error) {
    logger.error(
      `Failed to inject bookmark button into model response. Reason = ${error.message}`,
    );
  }
};

/**
 * Handles the logic when a bookmark button is clicked.
 * @param {HTMLElement} responseElement
 * @param {{id: string, content: string}} bookmarkData
 * @param {import('../core/types.js').Dependencies} dependencies
 */
const handleBookmarkClick = async (responseElement, dependencies) => {
  const { stateManager, elementSelectors, logger } = dependencies;

  try {
    const contentElement = responseElement.querySelector(
      elementSelectors.modelResponse.messageContent,
    );

    if (!contentElement) {
      throw new Error("Could not find content element.");
    }

    const content = contentElement.innerText.trim();

    if (content === "") {
      throw new Error("Cannot bookmark response, content is empty.");
    }

    const contentHash = await generateContentHash(content);

    responseElement.id = contentHash;

    const currentState = stateManager.getState();

    const existingBookmark = currentState.bookmarks.find(
      (bookmark) => bookmark.id === contentHash,
    );

    if (existingBookmark) {
      await toggleBookmark(dependencies, {
        id: contentHash,
        content,
        tags: [],
        index: -1,
      });
    } else {
      const modelResponses = Array.from(
        document.querySelectorAll(elementSelectors.modelResponse.container),
      );

      const index = modelResponses.findIndex(
        (modelResponse) => responseElement.id === modelResponse.id,
      );

      createTagEditor(responseElement, async (tags) => {
        await toggleBookmark(dependencies, {
          id: contentHash,
          content,
          tags,
          index,
        });
      });
    }
  } catch (error) {
    logger.error(`Failed to handle bookmark click. Reason = ${error.message}`);
  }
};

/**
 * Creates and injects a temporary UI for editing tags.
 * @param {HTMLElement} responseElement - The element to anchor the editor to.
 * @param {(tags: string[]) => void} onSave - Callback executed with the tags when saved.
 */
const createTagEditor = (responseElement, onSave) => {
  if (responseElement.querySelector(".tag-editor")) {
    return;
  }

  const editorContainer = document.createElement("div");

  editorContainer.className = "tag-editor";

  const label = document.createElement("label");

  label.className = "tag-editor-label";
  label.textContent = chrome.i18n.getMessage("tagEditorLabel");
  label.htmlFor = "tag-editor-input-field";

  const inputContainer = document.createElement("div");

  inputContainer.className = "tag-editor-input-container";

  const input = document.createElement("input");

  input.id = "tag-editor-input-field";
  input.type = "text";
  input.placeholder = chrome.i18n.getMessage("tagEditorPlaceholder");
  input.className = "tag-editor-input";

  const saveButton = document.createElement("button");

  saveButton.textContent = chrome.i18n.getMessage("tagEditorSaveButton");
  saveButton.className = "tag-editor-save";

  const cancelButton = document.createElement("button");

  cancelButton.textContent = chrome.i18n.getMessage("tagEditorCancelButton");
  cancelButton.className = "tag-editor-cancel";

  const cleanup = () => editorContainer.remove();
  const handleSave = () => {
    const tags = input.value
      ? input.value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    onSave(tags);
    cleanup();
  };

  saveButton.addEventListener("click", handleSave);
  cancelButton.addEventListener("click", cleanup);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      cleanup();
    }
  });

  editorContainer.appendChild(label);
  inputContainer.appendChild(input);
  inputContainer.appendChild(saveButton);
  inputContainer.appendChild(cancelButton);
  editorContainer.appendChild(inputContainer);
  responseElement.appendChild(editorContainer);

  input.focus();
};
