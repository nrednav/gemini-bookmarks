/**
 * Adds a new bookmark to the state.
 *
 * @param {import('./types.js').AppState} state - The current application state.
 * @param {{id: string, content: string, tags: string[]}} newBookmarkData - The data for the new bookmark.
 * @returns {import('./types.js').AppState} A new state object with the added bookmark.
 */
export const addBookmark = (state, newBookmarkData) => {
  const newBookmark = {
    id: newBookmarkData.id,
    timestamp: Date.now(),
    content: newBookmarkData.content,
    index: newBookmarkData.index,
    tags: newBookmarkData.tags || [],
  };

  return {
    ...state,
    bookmarks: [...state.bookmarks, newBookmark],
  };
};

/**
 * Removes a bookmark from the state.
 *
 * @param {import('./types.js').AppState} state - The current application state.
 * @param {string} bookmarkId - The id of the bookmark to remove.
 * @returns {import('./types.js').AppState} A new state object with the bookmark removed.
 */
export const removeBookmark = (state, bookmarkId) => {
  const updatedBookmarks = state.bookmarks.filter(
    (bookmark) => bookmark.id !== bookmarkId,
  );

  return {
    ...state,
    bookmarks: updatedBookmarks,
  };
};

/**
 * Extracts a unique, sorted list of all tags from the bookmarks.
 * @param {import('./types.js').AppState} state The current application state.
 * @returns {string[]} A new array of unique tag strings.
 */
export const getUniqueTags = (state) => {
  const allTags = state.bookmarks.flatMap((bookmark) => bookmark.tags);
  const uniqueTags = new Set(allTags);

  return [...uniqueTags].sort();
};

/**
 * Filters bookmarks to only include those that have specific tags.
 * @param {import('./types.js').AppState} state The current application state.
 * @param {string[]} tags The tags to filter by.
 * @returns {import('./types.js').Bookmark[]} A new array of matching bookmarks.
 */
export const filterBookmarksByTags = (state, tags) => {
  if (tags.length === 0) {
    return state.bookmarks;
  }

  return state.bookmarks.filter((bookmark) =>
    tags.some((tag) => bookmark.tags.includes(tag)),
  );
};
