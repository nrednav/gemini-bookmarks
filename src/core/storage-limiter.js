import { getAllStorageData } from "../helpers/get-all-storage-data.js";

// In Chrome, this is ~5MB.
// Firefox does not expose this constant, keeping it same for consistency
const QUOTA_BYTES = 5 * 1024 * 1024;
const WARNING_THRESHOLD_PERCENT = 90;

/**
 * Checks storage usage and displays a warning if it exceeds the threshold.
 * @param {import('./types.js').Dependencies} dependencies
 */
export const checkStorageQuota = async ({ uiElements, logger }) => {
  if (!uiElements.storageWarning) {
    return;
  }

  try {
    const allData = await getAllStorageData();
    const bytesInUse = new Blob([JSON.stringify(allData)]).size;
    const usagePercent = Math.round((bytesInUse / QUOTA_BYTES) * 100);

    if (usagePercent >= WARNING_THRESHOLD_PERCENT) {
      const message = chrome.i18n.getMessage("storageWarningMessage", [
        usagePercent.toString(),
      ]);
      const actionText = chrome.i18n.getMessage("storageWarningAction");

      const storageWarningMessage = document.createElement("p");
      storageWarningMessage.textContent = message;

      const manageDataLink = document.createElement("a");
      manageDataLink.href = "#";
      manageDataLink.id = "gb-manage-data-link";
      manageDataLink.textContent = actionText;

      uiElements.storageWarning.replaceChildren(
        storageWarningMessage,
        manageDataLink,
      );
      uiElements.storageWarning.style.display = "flex";

      if (manageDataLink) {
        manageDataLink.addEventListener("click", (e) => {
          e.preventDefault();
          chrome.runtime.sendMessage({ action: "openOptionsPage" });
        });
      }
    } else {
      uiElements.storageWarning.style.display = "none";
      uiElements.storageWarning.replaceChildren();
    }
  } catch (error) {
    logger.error("Failed to check storage quota:", error);
    uiElements.storageWarning.style.display = "none";
  }
};
