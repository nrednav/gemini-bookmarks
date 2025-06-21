import { addBookmark, removeBookmark } from './logic';
import { renderUi } from '../ui/render-ui';

/**
 * @param {import('./types.js').Dependencies} dependencies - The application-wide dependencies.
 */
export const toggleBookmark = async (dependencies, { id, content, tags }) => {
  const { stateManager } = dependencies;
  const currentState = stateManager.getState();
  const existingBookmark = currentState.bookmarks.find(bookmark => bookmark.id === id);

  let nextState;

  if (existingBookmark) {
    nextState = removeBookmark(currentState, id);
  } else {
    const newBookmark = { id, content, tags };
    nextState = addBookmark(currentState, newBookmark);
  }

  stateManager.setState(nextState);

  await stateManager.saveStateToStorage();

  renderUi(dependencies);
}

/**
 * @param {import('./types.js').Dependencies} dependencies - The application-wide dependencies.
 */
export const toggleTagFilter = (dependencies, tag) => {
  const { stateManager } = dependencies;
  const currentState = stateManager.getState();

  let newActiveTagFilters;

  if (currentState.activeTagFilters.includes(tag)) {
    newActiveTagFilters = currentState.activeTagFilters.filter((activeTag) => activeTag !== tag);
  } else {
    newActiveTagFilters = [...currentState.activeTagFilters, tag];
  }

  stateManager.setState({ ...currentState, activeTagFilters: newActiveTagFilters });

  renderUi(dependencies);
};

/**
 * @param {import('./types.js').Dependencies} dependencies - The application-wide dependencies.
 */
export const clearAllBookmarks = async (dependencies) => {
  const { stateManager, window } = dependencies;

  if (window.confirm("Are you sure you want to remove ALL bookmarks for this conversation?")) {
    stateManager.resetState();

    await stateManager.saveStateToStorage();

    renderUi(dependencies);
  }
};
