/**
 * Adds a new bookmark to the state.
 *
 * @param {import('./state.js').AppState} state - The current application state.
 * @param {{content: string, tags: string[]}} newBookmarkData - The data for the new bookmark.
 * @returns {import('./state.js').AppState} A new state object with the added bookmark.
 */
GeminiBookmarker.addBookmark = function (state, newBookmarkData) {
  const newBookmark = {
    id: `bookmark-${Date.now()}`,
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
 * Extracts a unique, sorted list of all tags from the bookmarks.
 * @param {import('./state.js').AppState} state The current application state.
 * @returns {string[]} A new array of unique tag strings.
 */
GeminiBookmarker.getUniqueTags = function (state) {
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
GeminiBookmarker.filterBookmarksByTag = function (state, tag) {
  if (!tag) {
    return state.bookmarks;
  }

  return state.bookmarks.filter(bookmark => bookmark.tags.includes(tag));
}
