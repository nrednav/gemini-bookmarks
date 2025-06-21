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

    tagButton.className = 'gb-panel-filter-tag';
    tagButton.textContent = tag;
    tagButton.dataset.tag = tag;

    if (currentState.activeTagFilters.includes(tag)) {
      tagButton.classList.add('active');
    }

    uiElements.tagsContainer.appendChild(tagButton);
  });

  // Render bookmarks
  const bookmarksToShow = currentState.activeTagFilters.length > 0
    ? filterBookmarksByTags(currentState, currentState.activeTagFilters)
    : currentState.bookmarks;

  if (currentState.bookmarks.length === 0) {
    uiElements.bookmarksContainer.innerHTML = `<p class="gb-panel__empty-message">No bookmarks yet. Click the icon on a response to bookmark it!</p>`;
    return;
  }

  const sortedBookmarks = bookmarksToShow
    .map(bookmark => {
      const element = window.document.getElementById(bookmark.id);

      return {
        ...bookmark,
        position: element?.offsetTop ?? Infinity
      };
    })
    .sort((a, b) => a.position - b.position);

  uiElements.bookmarksContainer.innerHTML = sortedBookmarks.map(bookmark => `
    <div class="gb-panel-bookmark" data-bookmark-id="${bookmark.id}" title="Click to scroll to this response">
      <p class="gb-panel-bookmark__content">${bookmark.content.substring(0, 120)}...</p>
      <div class="gb-panel-bookmark__tags">
        ${bookmark.tags.map(tag => `<span class="gb-panel-bookmark__tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
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
