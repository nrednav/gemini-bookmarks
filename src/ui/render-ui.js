import { filterBookmarksByTags, getUniqueTags } from '../core/logic';

export const renderUi = (dependencies) => {
  const { uiElements, stateManager, elementSelectors, window } = dependencies;

  const currentState = stateManager.getState();

  if (uiElements.clearAllButton) {
    uiElements.clearAllButton.disabled = currentState.bookmarks.length === 0;
  }

  renderPanelContent({ currentState, uiElements, window });
  updateAllBookmarkButtonUis({ uiElements, elementSelectors, currentState });
};

const renderPanelContent = (dependencies) => {
  const { currentState, uiElements, window } = dependencies;

  // Render tags
  const uniqueTags = getUniqueTags(currentState);

  uiElements.tagsContainer.replaceChildren();

  uniqueTags.forEach((tag) => {
    const tagButton = window.document.createElement("button");

    tagButton.className = "gb-panel-filter-tag";
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
    emptyMessage.textContent = "No bookmarks yet. Click the icon on a response to bookmark it!";

    uiElements.bookmarksContainer.appendChild(emptyMessage);

    return;
  }

  const sortedBookmarks = bookmarksToShow
    .map(bookmark => {
      const element = window.document.getElementById(bookmark.id);
      return { ...bookmark, position: element?.offsetTop ?? Infinity };
    })
    .sort((a, b) => a.position - b.position);

  sortedBookmarks.forEach((bookmark) => {
    const bookmarkElement = window.document.createElement("div");

    bookmarkElement.className = "gb-panel-bookmark";
    bookmarkElement.dataset.bookmarkId = bookmark.id;
    bookmarkElement.title = "Click to scroll to this response";

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

    bookmarkElement.appendChild(contentElement);
    bookmarkElement.appendChild(tagsContainer);
    uiElements.bookmarksContainer.appendChild(bookmarkElement);
  });
};

const updateAllBookmarkButtonUis = (dependencies) => {
  const { uiElements, elementSelectors, currentState } = dependencies;

  for (const bookmarkButton of uiElements.bookmarkButtons) {
    const responseElement = bookmarkButton.closest(elementSelectors.modelResponse.container);

    if (responseElement) {
      updateBookmarkButtonUi(bookmarkButton, responseElement.id, currentState);
    }
  }
}

export const updateBookmarkButtonUi = (bookmarkButton, id, currentState) => {
  const isBookmarked = currentState.bookmarks.some(bookmark => bookmark.id === id);

  if (isBookmarked) {
    bookmarkButton.classList.add('active');
    bookmarkButton.title = 'Click to remove bookmark';
  } else {
    bookmarkButton.classList.remove('active');
    bookmarkButton.title = 'Click to add bookmark';
  }
};
