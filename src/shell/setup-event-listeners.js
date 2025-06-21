import { clearAllBookmarks, toggleTagFilter } from "../core/actions";

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
      const clickedTag = e.target.closest(elementSelectors.ui.panelTagFilter);

      if (!clickedTag) {
        return;
      }

      const tag = clickedTag.dataset.tag;

      toggleTagFilter(dependencies, tag);
    });
  }

  if (uiElements.clearAllButton) {
    uiElements.clearAllButton.addEventListener("click", async () => {
      await clearAllBookmarks(dependencies);
    });
  }
}
