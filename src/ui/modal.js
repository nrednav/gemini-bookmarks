import { createIconElement } from "../helpers/create-icon-element";
import { actionIcons } from "./icons";
import { showToast } from "./toast";

/**
 * Creates and displays a non-blocking, promise-based confirmation modal.
 * @param {string} message - The confirmation message to display to the user.
 * @returns {Promise<boolean>} A promise that resolves to `true` if confirmed, `false` otherwise.
 */
export const createConfirmationModal = (message) => {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");

    overlay.className = "gb-modal-overlay";

    const modalContainer = document.createElement("div");

    modalContainer.className = "gb-modal-container";

    const messageElement = document.createElement("p");

    messageElement.textContent = message;

    const buttonContainer = document.createElement("div");

    buttonContainer.className = "gb-modal-buttons";

    const confirmButton = document.createElement("button");

    confirmButton.className = "gb-modal-confirm";
    confirmButton.textContent = chrome.i18n.getMessage("confirmButtonText");

    const cancelButton = document.createElement("button");

    cancelButton.className = "gb-modal-cancel";
    cancelButton.textContent = chrome.i18n.getMessage("cancelButtonText");

    const cleanup = () => {
      document.body.removeChild(overlay);
      window.removeEventListener("keydown", handleEsc);
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    confirmButton.addEventListener("click", handleConfirm);
    cancelButton.addEventListener("click", handleCancel);
    overlay.addEventListener("click", (e) => {
      // Close only if the overlay itself is clicked, not the modal content
      if (e.target === overlay) {
        handleCancel();
      }
    });

    window.addEventListener("keydown", handleEsc);

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modalContainer.appendChild(messageElement);
    modalContainer.appendChild(buttonContainer);
    overlay.appendChild(modalContainer);

    document.body.appendChild(overlay);
  });
};

/**
 * Creates and displays a non-blocking modal for showing content.
 * @param {string} title - The title to display in the modal header.
 * @param {string} content - The plain text content to display.
 */
export const createContentModal = (title, content) => {
  const overlay = document.createElement("div");

  overlay.className = "gb-modal-overlay";

  const modalContainer = document.createElement("div");

  modalContainer.className = "gb-modal-container gb-content-modal";

  const modalHeader = document.createElement("div");

  modalHeader.className = "gb-modal-header";

  const titleElement = document.createElement("h3");

  titleElement.textContent = title;

  const headerActions = document.createElement("div");

  headerActions.className = "gb-modal-header-actions";

  const copyButton = document.createElement("button");

  copyButton.className = "gb-modal-action-button";
  copyButton.append(createIconElement(actionIcons.copy));
  copyButton.title = chrome.i18n.getMessage("copyButtonTooltip");
  copyButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        showToast(chrome.i18n.getMessage("copySuccessToast"), "success");
      })
      .catch((error) => {
        console.error("Failed to copy text from modal: ", error);
      });
  });

  const closeButton = document.createElement("button");

  closeButton.className = "gb-modal-close gb-modal-action-button";
  closeButton.append(createIconElement(actionIcons.close));
  closeButton.title = chrome.i18n.getMessage("modalCloseButton");

  const contentElement = document.createElement("pre");

  contentElement.className = "gb-modal-content";
  contentElement.textContent = content;

  const cleanup = () => {
    document.body.removeChild(overlay);
    window.removeEventListener("keydown", handleEsc);
  };

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      cleanup();
    }
  };

  closeButton.addEventListener("click", cleanup);
  overlay.addEventListener("click", (e) => {
    // Close only if the overlay itself is clicked, not the modal content
    if (e.target === overlay) {
      cleanup();
    }
  });

  window.addEventListener("keydown", handleEsc);

  headerActions.appendChild(copyButton);
  headerActions.appendChild(closeButton);
  modalHeader.appendChild(titleElement);
  modalHeader.appendChild(headerActions);
  modalContainer.appendChild(modalHeader);
  modalContainer.appendChild(contentElement);
  overlay.appendChild(modalContainer);

  document.body.appendChild(overlay);
};
