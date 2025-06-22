export const injectUi = (window, elementSelectors) => {
  const oldUi = window.document.querySelector(".gemini-bookmarks-container");

  if (oldUi) {
    oldUi.remove();
  }

  const uiHtml = `
    <div class="gemini-bookmarks-container">
      <div class="gb-panel">
        <div class="gb-panel__header">
          <h3>${chrome.i18n.getMessage("panelHeader")}</h3>
          <div class="gb-panel__header-actions">
            <button class="gb-theme-toggle-button"></button>
            <button class="gb-clear-all-button" title="${chrome.i18n.getMessage("clearAllButtonTitle")}">
              ${chrome.i18n.getMessage("clearAllButtonText")}
            </button>
          </div>
        </div>
        <div class="gb-panel__tags" id="gb-tags-container">
          </div>
        <div class="gb-panel__bookmarks" id="gb-bookmarks-container">
          </div>
      </div>

      <button class="gb-fab" title="${chrome.i18n.getMessage("fabTitle")}">
        <svg viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
    </div>
  `;

  window.document.body.insertAdjacentHTML("beforeend", uiHtml);

  return {
    window: window,
    uiElements: {
      fab: window.document.querySelector(elementSelectors.ui.fab),
      panel: window.document.querySelector(elementSelectors.ui.panel),
      tagsContainer: window.document.getElementById(
        elementSelectors.ui.tagsContainer,
      ),
      bookmarksContainer: window.document.getElementById(
        elementSelectors.ui.bookmarksContainer,
      ),
      clearAllButton: window.document.querySelector(
        elementSelectors.ui.clearAllButton,
      ),
      themeToggleButton: window.document.querySelector(
        elementSelectors.ui.themeToggleButton,
      ),
      bookmarkButtons: Array.from(
        window.document.querySelectorAll(elementSelectors.ui.bookmarkButton),
      ),
      modelResponses: window.document.querySelectorAll(
        elementSelectors.modelResponse.container,
      ),
    },
  };
};
