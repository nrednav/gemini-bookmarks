import { filterBookmarksByTags, getUniqueTags } from '../core/logic';
import { actionIcons } from './icons.js';

/**
 * Renders the entire UI based on the current state.
 * @param {import('../core/types.js').Dependencies} dependencies
 */
export const renderUi = (dependencies) => {
  const { uiElements, stateManager, elementSelectors, window } = dependencies;

  const currentState = stateManager.getState();

  if (uiElements.clearAllButton) {
    uiElements.clearAllButton.disabled = currentState.bookmarks.length === 0;
  }

  renderPanelContent({ currentState, uiElements, window });
  updateAllBookmarkButtonUis({ uiElements, elementSelectors, currentState });
};

/**
 * Renders the content of the bookmarks panel (tags and bookmarks list).
 * @param {object} dependencies - The dependencies for this specific render function.
 * @param {import('../core/types.js').AppState} dependencies.currentState
 * @param {import('../core/types.js').UIElements} dependencies.uiElements
 * @param {Window} dependencies.window
 */
const renderPanelContent = (dependencies) => {
  const { currentState, uiElements, window } = dependencies;

  // Render tags
  const uniqueTags = getUniqueTags(currentState);

  uiElements.tagsContainer.replaceChildren();

  uniqueTags.forEach((tag) => {
    const tagButton = window.document.createElement("button");

    tagButton.className = "gb-panel-tag-filter";
    tagButton.textContent = tag;
    tagButton.dataset.tag = tag;

    if (currentState.activeTagFilters.includes(tag)) {
      tagButton.classList.add("active");
    }

    uiElements.tagsContainer.appendChild(tagButton);
  });

  // Render bookmarks
  const bookmarksToShow = currentState.activeTagFilters.length > 0
    ? filterBookmarksByTags(currentState, currentState.activeTagFilters)
    : currentState.bookmarks;

  uiElements.bookmarksContainer.replaceChildren();

  if (currentState.bookmarks.length === 0) {
    const emptyMessage = window.document.createElement("p");

    emptyMessage.className = "gb-panel__empty-message";
    emptyMessage.textContent = chrome.i18n.getMessage("panelEmptyMessage");

    uiElements.bookmarksContainer.appendChild(emptyMessage);

    return;
  }

  const sortedBookmarks = bookmarksToShow.sort((a, b) => a.index - b.index);

  sortedBookmarks.forEach((bookmark) => {
    const bookmarkElement = window.document.createElement("div");

    bookmarkElement.className = "gb-panel-bookmark";
    bookmarkElement.dataset.bookmarkId = bookmark.id;
    bookmarkElement.title = chrome.i18n.getMessage("scrollToBookmarkTitle");

    const contentElement = window.document.createElement("p");

    contentElement.className = "gb-panel-bookmark__content";
    contentElement.textContent = `${bookmark.content.substring(0, 120)}...`;

    const tagsContainer = window.document.createElement("div");

    tagsContainer.className = "gb-panel-bookmark__tags";

    bookmark.tags.forEach(tag => {
      const tagElement = window.document.createElement("span");

      tagElement.className = "gb-panel-bookmark__tag";
      tagElement.textContent = tag;

      tagsContainer.appendChild(tagElement);
    });

    const actionsContainer = window.document.createElement("div");

    actionsContainer.className = "gb-panel-bookmark__actions";

    const copyButton = window.document.createElement("button");

    copyButton.className = "gb-panel-bookmark__action-button gb-panel-bookmark__copy-button";
    copyButton.title = chrome.i18n.getMessage("copyButtonTooltip");
    copyButton.innerHTML = actionIcons.copy;

    const viewButton = window.document.createElement("button");

    viewButton.className = "gb-panel-bookmark__action-button gb-panel-bookmark__view-button";
    viewButton.title = chrome.i18n.getMessage("viewButtonTooltip");
    viewButton.innerHTML = actionIcons.view;

    actionsContainer.appendChild(viewButton);
    actionsContainer.appendChild(copyButton);
    bookmarkElement.appendChild(contentElement);
    bookmarkElement.appendChild(tagsContainer);
    bookmarkElement.appendChild(actionsContainer);
    uiElements.bookmarksContainer.appendChild(bookmarkElement);
  });
};

/**
 * Updates the visual state of all bookmark buttons on the page.
 * @param {object} dependencies - The dependencies for this specific update function.
 * @param {import('../core/types.js').UIElements} dependencies.uiElements
 * @param {import('../data/element-selectors.js').ElementSelectors} dependencies.elementSelectors
 * @param {import('../core/types.js').AppState} dependencies.currentState
 */
const updateAllBookmarkButtonUis = (dependencies) => {
  const { uiElements, elementSelectors, currentState } = dependencies;

  for (const bookmarkButton of uiElements.bookmarkButtons) {
    const responseElement = bookmarkButton.closest(elementSelectors.modelResponse.container);

    if (responseElement) {
      updateBookmarkButtonUi(bookmarkButton, responseElement.id, currentState);
    }
  }
}

/**
 * Updates the visual state of a single bookmark button.
 * @param {HTMLButtonElement} bookmarkButton
 * @param {string} id
 * @param {import('../core/types.js').AppState} currentState
 */
export const updateBookmarkButtonUi = (bookmarkButton, id, currentState) => {
  const isBookmarked = currentState.bookmarks.some(bookmark => bookmark.id === id);

  if (isBookmarked) {
    bookmarkButton.classList.add('active');
    bookmarkButton.title = chrome.i18n.getMessage("removeBookmarkTooltip");
  } else {
    bookmarkButton.classList.remove('active');
    bookmarkButton.title = chrome.i18n.getMessage("addBookmarkTooltip");
  }
};
