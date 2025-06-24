import { actionIcons } from "./icons";
import { applyTheme } from "./theme-manager";

export const injectUi = (window, elementSelectors, initialTheme) => {
  const oldUi = window.document.querySelector(".gemini-bookmarks-container");

  if (oldUi) {
    oldUi.remove();
  }

  const container = window.document.createElement("div");
  container.className = "gemini-bookmarks-container";

  const panel = window.document.createElement("div");
  panel.className = "gb-panel";

  const storageWarning = window.document.createElement("div");
  storageWarning.id = "gb-storage-warning";
  storageWarning.className = "gb-storage-warning";
  storageWarning.style.display = "none";

  const panelHeader = window.document.createElement("div");
  panelHeader.className = "gb-panel__header";

  const panelHeaderTitle = window.document.createElement("h3");
  panelHeaderTitle.textContent = chrome.i18n.getMessage("panelHeader");

  const panelHeaderActions = window.document.createElement("div");
  panelHeaderActions.className = "gb-panel__header-actions";

  const themeToggleButton = window.document.createElement("button");
  themeToggleButton.className = "gb-theme-toggle-button";

  const clearAllButton = window.document.createElement("button");
  clearAllButton.className = "gb-clear-all-button";
  clearAllButton.title = chrome.i18n.getMessage("clearAllButtonTitle");
  clearAllButton.textContent = chrome.i18n.getMessage("clearAllButtonText");

  const panelTagsContainer = window.document.createElement("div");
  panelTagsContainer.className = "gb-panel__tags";
  panelTagsContainer.id = "gb-tags-container";

  const panelBookmarksContainer = window.document.createElement("div");
  panelBookmarksContainer.className = "gb-panel__bookmarks";
  panelBookmarksContainer.id = "gb-bookmarks-container";

  const floatingActionButton = window.document.createElement("button");
  floatingActionButton.className = "gb-fab";
  floatingActionButton.title = chrome.i18n.getMessage("fabTitle");
  floatingActionButton.innerHTML = actionIcons.bookmark;

  panelHeaderActions.append(themeToggleButton, clearAllButton);
  panelHeader.append(panelHeaderTitle, panelHeaderActions);
  panel.append(
    storageWarning,
    panelHeader,
    panelTagsContainer,
    panelBookmarksContainer,
  );
  container.append(panel, floatingActionButton);

  // Set theme before injecting UI to prevent flicker
  applyTheme(initialTheme, { themeToggleButton: themeToggleButton });

  window.document.body.append(container);

  return {
    window: window,
    uiElements: {
      storageWarning: storageWarning,
      fab: floatingActionButton,
      panel: panel,
      tagsContainer: panelTagsContainer,
      bookmarksContainer: panelBookmarksContainer,
      clearAllButton: clearAllButton,
      themeToggleButton: themeToggleButton,
      bookmarkButtons: Array.from(
        window.document.querySelectorAll(elementSelectors.ui.bookmarkButton),
      ),
      modelResponses: window.document.querySelectorAll(
        elementSelectors.modelResponse.container,
      ),
    },
  };
};
