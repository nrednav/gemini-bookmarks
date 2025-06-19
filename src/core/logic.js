/**
 * Adds a new bookmark to the state.
 *
 * @param {import('./state.js').AppState} state - The current application state.
 * @param {{content: string, tags: string[]}} newBookmarkData - The data for the new bookmark.
 * @returns {import('./state.js').AppState} A new state object with the added bookmark.
 */
export function addBookmark(state, newBookmarkData) {
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
