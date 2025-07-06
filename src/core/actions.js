import { createConfirmationModal } from "../ui/modal.js";
import { renderUi } from "../ui/render-ui";
import { applyTheme } from "../ui/theme-manager";
import { addBookmark, removeBookmark } from "./logic";
import { getTheme, saveTheme } from "./settings";
import { checkStorageQuota } from "./storage-limiter.js";

/**
 * @param {import('./types.js').Dependencies} dependencies - The application-wide dependencies.
 */
export const toggleBookmark = async (
  dependencies,
  { id, content, tags, index },
) => {
  const { stateManager } = dependencies;
  const currentState = stateManager.getState();
  const existingBookmark = currentState.bookmarks.find(
    (bookmark) => bookmark.id === id,
  );

  let nextState;

  if (existingBookmark) {
    nextState = removeBookmark(currentState, id);
  } else {
    const newBookmark = { id, content, tags, index };
    nextState = addBookmark(currentState, newBookmark);
  }

  stateManager.setState(nextState);

  await stateManager.saveStateToStorage();
  await checkStorageQuota(dependencies);

  renderUi(dependencies);
};

/**
 * @param {import('./types.js').Dependencies} dependencies - The application-wide dependencies.
 */
export const toggleTagFilter = (dependencies, tag) => {
  const { stateManager } = dependencies;
  const currentState = stateManager.getState();

  let newActiveTagFilters;

  if (currentState.activeTagFilters.includes(tag)) {
    newActiveTagFilters = currentState.activeTagFilters.filter(
      (activeTag) => activeTag !== tag,
    );
  } else {
    newActiveTagFilters = [...currentState.activeTagFilters, tag];
  }

  stateManager.setState({
    ...currentState,
    activeTagFilters: newActiveTagFilters,
  });

  renderUi(dependencies);
};

/**
 * @param {import('./types.js').Dependencies} dependencies - The application-wide dependencies.
 */
export const clearAllBookmarks = async (dependencies) => {
  const { stateManager } = dependencies;

  const confirmed = await createConfirmationModal(
    chrome.i18n.getMessage("clearAllConfirmation"),
  );

  if (confirmed) {
    await stateManager.clearStorage();
    await checkStorageQuota(dependencies);

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

  if (currentTheme === "light") {
    nextTheme = "dark";
  } else if (currentTheme === "dark") {
    nextTheme = "system";
  } else {
    nextTheme = "light";
  }

  await saveTheme(nextTheme);

  applyTheme(nextTheme, uiElements);
};

/**
 * Deletes a single bookmark from the state and storage.
 * @param {import('./types.js').Dependencies} dependencies
 * @param {string} bookmarkId - The ID of the bookmark to delete.
 */
export const deleteBookmark = async (dependencies, bookmarkId) => {
  const { stateManager } = dependencies;
  const currentState = stateManager.getState();

  const updatedBookmarks = currentState.bookmarks.filter(
    (bookmark) => bookmark.id !== bookmarkId,
  );

  stateManager.setState({ ...currentState, bookmarks: updatedBookmarks });

  await stateManager.saveStateToStorage();
  await checkStorageQuota(dependencies);

  renderUi(dependencies);
};
