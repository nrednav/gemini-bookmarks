/**
 * @typedef {'light' | 'dark' | 'system'} Theme
 */
const THEME_STORAGE_KEY = 'gemini-bookmarks-theme';

/**
 * Retrieves the saved theme from storage.
 * @returns {Promise<Theme>} The saved theme, defaulting to 'system'.
 */
export const getTheme = async () => {
  const result = await chrome.storage.local.get(THEME_STORAGE_KEY);
  return result[THEME_STORAGE_KEY] || 'system';
};

/**
 * Saves the chosen theme to storage.
 * @param {Theme} theme - The theme to save.
 * @returns {Promise<void>}
 */
export const saveTheme = async (theme) => {
  await chrome.storage.local.set({ [THEME_STORAGE_KEY]: theme });
};
