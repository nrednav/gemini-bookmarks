import { renderUi } from "../ui/render-ui";

export const setupEventListeners = (dependencies) => {
  const { window, uiElements, elementSelectors, stateManager } = dependencies;

  if (uiElements.fab && uiElements.panel) {
    uiElements.fab.addEventListener("click", () => {
      uiElements.panel.classList.toggle("visible");
    });
  }

  if (uiElements.bookmarksContainer) {
    uiElements.bookmarksContainer.addEventListener("click", (e) => {
      const clickedBookmark = e.target.closest(elementSelectors.ui.panelBookmark);

      if (!clickedBookmark) {
        return;
      }

      const bookmarkId = clickedBookmark.dataset.bookmarkId;

      if (!bookmarkId) {
        return;
      }

      const responseElement = window.document.getElementById(bookmarkId);

      if (responseElement) {
        responseElement.scrollIntoView({ behavior: "smooth", block: "start" });
        responseElement.classList.add("bookmark-highlight");

        setTimeout(() => {
          responseElement.classList.remove("bookmark-highlight");
        }, 1500);
      }
    });
  }

  if (uiElements.tagsContainer) {
    uiElements.tagsContainer.addEventListener("click", (e) => {
      const clickedTag = e.target.closest(elementSelectors.ui.panelFilterTag);

      if (!clickedTag) {
        return;
      }

      const tag = clickedTag.dataset.tag;

      const currentState = stateManager.getState();
      let newActiveTagFilters = [];

      if (currentState.activeTagFilters.includes(tag)) {
        newActiveTagFilters = currentState.activeTagFilters.filter((activeTagFilter) => activeTagFilter !== tag);
      } else {
        newActiveTagFilters = [...currentState.activeTagFilters, tag];
      }

      stateManager.setState({ ...currentState, activeTagFilters: newActiveTagFilters });

      renderUi({ window, uiElements, elementSelectors, stateManager });
    });
  }

  if (uiElements.clearAllButton) {
    uiElements.clearAllButton.addEventListener("click", async () => {
      if (window.confirm("Are you sure you want to remove ALL bookmarks for this conversation?")) {
        stateManager.resetState();

        await stateManager.saveStateToStorage();

        renderUi({ window, uiElements, elementSelectors, stateManager });
      }
    });
  }
}
