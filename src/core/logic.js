/**
 * Adds a new bookmark to the state.
 *
 * @param {import('./state.js').AppState} state - The current application state.
 * @param {{id: string, content: string, tags: string[]}} newBookmarkData - The data for the new bookmark.
 * @returns {import('./state.js').AppState} A new state object with the added bookmark.
 */
GeminiBookmarks.addBookmark = function (state, newBookmarkData) {
  const newBookmark = {
    id: newBookmarkData.id,
    timestamp: Date.now(),
    content: newBookmarkData.content,
    tags: newBookmarkData.tags || []
  };

  return {
    ...state,
    bookmarks: [...state.bookmarks, newBookmark]
  };
}

/**
 * Removes a bookmark from the state.
 *
 * @param {import('./state.js').AppState} state - The current application state.
 * @param {string} bookmarkId - The id of the bookmark to remove.
 * @returns {import('./state.js').AppState} A new state object with the bookmark removed.
 */
GeminiBookmarks.removeBookmark = function (state, bookmarkId) {
  const updatedBookmarks = state.bookmarks.filter(
    (bookmark) => bookmark.id !== bookmarkId
  );

  return {
    ...state,
    bookmarks: updatedBookmarks
  };
}

/**
 * Extracts a unique, sorted list of all tags from the bookmarks.
 * @param {import('./state.js').AppState} state The current application state.
 * @returns {string[]} A new array of unique tag strings.
 */
GeminiBookmarks.getUniqueTags = function (state) {
  const allTags = state.bookmarks.flatMap(bookmark => bookmark.tags);
  const uniqueTags = new Set(allTags);

  return [...uniqueTags].sort();
}

/**
 * Filters bookmarks to only include those that have a specific tag.
 * @param {import('./state.js').AppState} state The current application state.
 * @param {string} tag The tag to filter by.
 * @returns {import('./state.js').Bookmark[]} A new array of matching bookmarks.
 */
GeminiBookmarks.filterBookmarksByTags = function (state, tags) {
  if (tags.length === 0) {
    return state.bookmarks;
  }

  return state.bookmarks.filter(bookmark => tags.some(tag => bookmark.tags.includes(tag)));
}
