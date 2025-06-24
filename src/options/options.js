import { getAllStorageData } from "../helpers/get-all-storage-data";
import { Logger } from "../shell/logger";
import { createConfirmationModal } from "../ui/modal";
import { showToast } from "../ui/toast";

const CONVERSATION_KEY_PREFIX = "gb-conversation-";

const listElement = document.getElementById("conversations-list");
const loadingElement = document.getElementById("loading-state");
const emptyElement = document.getElementById("empty-state");
const totalUsageBadge = document.getElementById("total-usage-badge");
const deleteAllButton = document.getElementById("delete-all-button");
const exportAllButton = document.getElementById("export-all-button");

let totalStorageBytes = 0;

const logger = new Logger(window);

/**
 * Formats a number of bytes into a human-readable string (KB, MB).
 * @param {number} bytes - The number of bytes.
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / k ** i).toFixed(2));

  return `${formattedSize} ${sizes[i]}`;
}

/**
 * Updates the total usage badge in the header.
 */
function updateTotalUsageDisplay() {
  if (totalStorageBytes > 0) {
    totalUsageBadge.textContent = `${chrome.i18n.getMessage("optionsPageTotalUsage")}: ${formatBytes(totalStorageBytes)}`;
    totalUsageBadge.style.display = "inline-block";
  } else {
    totalUsageBadge.style.display = "none";
  }
}

/**
 * Fetches all conversation data and renders it to the page.
 */
async function loadAndRenderConversations() {
  try {
    const allData = await getAllStorageData();

    totalStorageBytes = 0;

    const conversations = Object.keys(allData)
      .filter((key) => key.startsWith(CONVERSATION_KEY_PREFIX))
      .map((key) => {
        const data = allData[key];
        const sizeInBytes = new Blob([JSON.stringify(data)]).size;

        totalStorageBytes += sizeInBytes;

        return { key, data, sizeInBytes };
      });

    loadingElement.style.display = "none";

    updateTotalUsageDisplay();

    if (conversations.length === 0) {
      emptyElement.style.display = "block";
      return;
    }

    deleteAllButton.disabled = false;
    exportAllButton.disabled = false;

    // Sort by the most recently bookmarked conversation first
    conversations.sort((a, b) => {
      const lastBookmarkA = Math.max(
        ...a.data.bookmarks.map((bookmark) => bookmark.timestamp),
      );
      const lastBookmarkB = Math.max(
        ...b.data.bookmarks.map((bookmark) => bookmark.timestamp),
      );

      return lastBookmarkB - lastBookmarkA;
    });

    listElement.replaceChildren();

    for (const conversation of conversations) {
      const listItem = createConversationListItem(
        conversation.key,
        conversation.data,
        conversation.sizeInBytes,
      );

      listElement.appendChild(listItem);
    }
  } catch (error) {
    logger.error("Error loading conversation data:", error);
    showStandardErrorToast();
  }
}

/**
 * Creates a single <li> element for a conversation.
 * @param {string} key - The storage key for the conversation.
 * @param {object} data - The data object for the conversation.
 * @returns {HTMLLIElement}
 */
function createConversationListItem(key, data, sizeInBytes) {
  const listItem = document.createElement("li");

  listItem.className = "conversation-item";
  listItem.dataset.storageKey = key;
  listItem.dataset.sizeInBytes = sizeInBytes;

  const urlPath = key.replace(CONVERSATION_KEY_PREFIX, "");

  const bookmarkCount = data.bookmarks.length;
  const bookmarkCountMessage = chrome.i18n.getMessage(
    bookmarkCount === 1 ? "bookmarkCountSingular" : "bookmarkCountPlural",
    [bookmarkCount.toString()],
  );

  const lastUpdated = new Date(
    Math.max(...data.bookmarks.map((b) => b.timestamp)),
  ).toLocaleString(navigator.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lastUpdatedMessage = chrome.i18n.getMessage("lastUpdatedTimestamp", [
    lastUpdated,
  ]);

  const infoElement = document.createElement("div");
  infoElement.className = "conversation-info";

  const urlPathElement = document.createElement("p");
  urlPathElement.className = "url-path";
  urlPathElement.textContent = urlPath;

  const bookmarkCountElement = document.createElement("div");
  bookmarkCountElement.className = "bookmark-count";

  const bookmarkSummaryMessage = document.createElement("p");
  bookmarkSummaryMessage.textContent = `${bookmarkCountMessage} - ${lastUpdatedMessage}`;

  const usageBadge = document.createElement("span");
  usageBadge.className = "usage-badge";
  usageBadge.textContent = formatBytes(sizeInBytes);

  bookmarkCountElement.append(bookmarkSummaryMessage, usageBadge);
  infoElement.append(urlPathElement, bookmarkCountElement);

  const actionsElement = document.createElement("div");
  actionsElement.className = "conversation-actions";

  const viewButton = document.createElement("button");
  viewButton.className = "view-button";
  viewButton.textContent = chrome.i18n.getMessage("optionsViewButton");
  viewButton.addEventListener("click", handleView);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.textContent = chrome.i18n.getMessage("optionsDeleteButton");
  deleteButton.addEventListener("click", handleDelete);

  actionsElement.append(viewButton, deleteButton);
  listItem.append(infoElement, actionsElement);

  return listItem;
}

/**
 * Handles the click event for a view button.
 * @param {MouseEvent} event
 */
function handleView(event) {
  const listItem = event.target.closest(".conversation-item");
  const key = listItem.dataset.storageKey;
  const urlPath = key.replace(CONVERSATION_KEY_PREFIX, "");
  const fullUrl = `https://gemini.google.com${urlPath}`;

  chrome.tabs.create({ url: fullUrl });
}

/**
 * Handles the click event for a delete button.
 * @param {MouseEvent} event
 */
async function handleDelete(event) {
  const listItem = event.target.closest(".conversation-item");
  const key = listItem.dataset.storageKey;
  const sizeInBytes = parseInt(listItem.dataset.sizeInBytes, 10);

  const confirmationMessage = chrome.i18n.getMessage(
    "optionsDeleteConfirmation",
  );
  const confirmed = await createConfirmationModal(confirmationMessage);

  if (confirmed) {
    try {
      await chrome.storage.local.remove(key);

      listItem.remove();

      totalStorageBytes -= sizeInBytes;

      updateTotalUsageDisplay();

      if (listElement.children.length === 0) {
        listElement.replaceChildren();
        emptyElement.style.display = "block";
        totalStorageBytes = 0;

        updateTotalUsageDisplay();

        deleteAllButton.disabled = true;
        exportAllButton.disabled = true;
      }
    } catch (error) {
      logger.error(`Failed to delete data for key ${key}:`, error);
      showStandardErrorToast();
    }
  }
}

/**
 * Handles the click event for the "Delete All" button.
 */
async function handleDeleteAll() {
  const confirmationMessage = chrome.i18n.getMessage(
    "optionsDeleteAllConfirmation",
  );
  const confirmed = await createConfirmationModal(confirmationMessage);

  if (confirmed) {
    try {
      const allData = await getAllStorageData();
      const keysToDelete = Object.keys(allData).filter((key) =>
        key.startsWith(CONVERSATION_KEY_PREFIX),
      );

      if (keysToDelete.length > 0) {
        await chrome.storage.local.remove(keysToDelete);
      }

      // Update UI
      listElement.replaceChildren();
      emptyElement.style.display = "block";
      totalStorageBytes = 0;

      updateTotalUsageDisplay();

      deleteAllButton.disabled = true;
      exportAllButton.disabled = true;
    } catch (error) {
      logger.error("Failed to delete all conversation data:", error);
      showStandardErrorToast();
    }
  }
}

/**
 * Handles exporting all bookmark data to a JSON file.
 */
async function handleExportAll() {
  try {
    const allData = await getAllStorageData();
    const exportData = {};

    for (const key in allData) {
      if (key.startsWith(CONVERSATION_KEY_PREFIX)) {
        exportData[key] = allData[key];
      }
    }

    if (Object.keys(exportData).length === 0) {
      logger.error("There is no data to export.");
      return;
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    const date = new Date().toISOString().slice(0, 10);

    a.download = `gemini-bookmarks-export-${date}.json`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error("Failed to export data:", error);
    showStandardErrorToast();
  }
}

const showStandardErrorToast = () =>
  showToast(chrome.i18n.getMessage("optionsPageStandardErrorToast"), "error");

const localizeOptionsPage = () => {
  const localizedElements = document.querySelectorAll("[data-locale]");

  for (const localizedElement of localizedElements) {
    localizedElement.innerText = chrome.i18n.getMessage(
      localizedElement.dataset.locale,
    );
  }
};

const main = () => {
  localizeOptionsPage();

  deleteAllButton.addEventListener("click", handleDeleteAll);
  exportAllButton.addEventListener("click", handleExportAll);

  loadAndRenderConversations();
};

document.addEventListener("DOMContentLoaded", main);
