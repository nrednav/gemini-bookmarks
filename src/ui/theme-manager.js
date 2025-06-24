import { createIconElement } from "../helpers/create-icon-element.js";
import { themeIcons } from "./icons.js";

/**
 * Applies the given theme to the UI by setting data attributes on the panel.
 * Also updates the toggle button's appearance.
 * @param {import('../core/types.js').Theme} theme
 * @param {import('../core/types.js').UIElements} uiElements
 */
export const applyTheme = (theme, uiElements) => {
  const { themeToggleButton } = uiElements;

  document.body.dataset.geminiBookmarksTheme = theme;

  if (!themeToggleButton) {
    return;
  }

  if (theme === "light") {
    themeToggleButton.replaceChildren(createIconElement(themeIcons.light));
    themeToggleButton.title = chrome.i18n.getMessage("themeButtonTitleLight");
  } else if (theme === "dark") {
    themeToggleButton.replaceChildren(createIconElement(themeIcons.dark));
    themeToggleButton.title = chrome.i18n.getMessage("themeButtonTitleDark");
  } else {
    themeToggleButton.replaceChildren(createIconElement(themeIcons.system));
    themeToggleButton.title = chrome.i18n.getMessage("themeButtonTitleSystem");
  }
};
