import { themeIcons } from './icons.js';

/**
 * Applies the given theme to the UI by setting data attributes on the panel.
 * Also updates the toggle button's appearance.
 * @param {import('../core/types.js').Theme} theme
 * @param {import('../core/types.js').UIElements} uiElements
 */
export const applyTheme = (theme, uiElements) => {
  const { panel, themeToggleButton } = uiElements;

  if (!panel || !themeToggleButton) return;

  panel.dataset.theme = theme;

  if (theme === 'light') {
    themeToggleButton.innerHTML = themeIcons.light;
    themeToggleButton.title = browser.i18n.getMessage("themeButtonTitleLight");
  } else if (theme === 'dark') {
    themeToggleButton.innerHTML = themeIcons.dark;
    themeToggleButton.title = browser.i18n.getMessage("themeButtonTitleDark");
  } else {
    themeToggleButton.innerHTML = themeIcons.system;
    themeToggleButton.title = browser.i18n.getMessage("themeButtonTitleSystem");
  }
};
