import { addBookmark, removeBookmark } from './logic';
import { renderUi } from '../ui/render-ui';
import { applyTheme } from '../ui/theme-manager';
import { getTheme, saveTheme } from './settings';
import { createConfirmationModal } from '../ui/modal.js';

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
  const { stateManager } = dependencies;

  const confirmed = await createConfirmationModal(chrome.i18n.getMessage("clearAllConfirmation"));

  if (confirmed) {
    stateManager.resetState();

    await stateManager.saveStateToStorage();

    renderUi(dependencies);
  }
};

/**
 * Cycles to the next theme, saves the preference, and applies the new theme to the UI.
 * The cycle order is system -> light -> dark -> system.
 * @param {import('./types.js').Dependencies} dependencies
 */
export const cycleTheme = async ({ uiElements }) => {
  const currentTheme = await getTheme();

  let nextTheme;

  if (currentTheme === 'light') {
    nextTheme = 'dark';
  } else if (currentTheme === 'dark') {
    nextTheme = 'system';
  } else {
    nextTheme = 'light';
  }

  await saveTheme(nextTheme);

  applyTheme(nextTheme, uiElements);
};
