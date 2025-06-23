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

      uiElements.storageWarning.innerHTML = `
        <p>${message}</p>
        <a href="#" id="gb-manage-data-link">${actionText}</a>
      `;

      uiElements.storageWarning.style.display = "flex";

      const manageLink = document.getElementById("gb-manage-data-link");

      if (manageLink) {
        manageLink.addEventListener("click", (e) => {
          e.preventDefault();
          chrome.runtime.sendMessage({ action: "openOptionsPage" });
        });
      }
    } else {
      uiElements.storageWarning.style.display = "none";
      uiElements.storageWarning.innerHTML = "";
    }
  } catch (error) {
    logger.error("Failed to check storage quota:", error);
    uiElements.storageWarning.style.display = "none";
  }
};
