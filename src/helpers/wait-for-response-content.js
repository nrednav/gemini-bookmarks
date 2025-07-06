/**
 * Observes a response element and waits until it contains non-empty, stable text content.
 * It resolves with the final, trimmed text content.
 *
 * @param {Object} options
 * @param {HTMLElement} options.responseElement - The container of the response message.
 * @param {string} options.contentSelector - The CSS selector for the actual content element within the container.
 * @param {number} [options.timeout=20000] - The maximum time to wait for content to appear.
 * @param {number} [options.stabilityTimeout=500] - Time to wait after the last change to ensure content is stable.
 * @returns {Promise<string>} A promise that resolves with the final, trimmed content.
 */
export const waitForResponseContent = ({
  responseElement,
  contentSelector,
  timeout = 20000,
  stabilityTimeout = 500,
}) => {
  return new Promise((resolve, reject) => {
    let stabilityTimer = null;
    let mainTimeoutTimer = null;

    const observer = new MutationObserver(() => {
      const contentElement = responseElement.querySelector(contentSelector);

      if (contentElement && contentElement.innerText.trim() !== "") {
        clearTimeout(stabilityTimer);

        stabilityTimer = setTimeout(() => {
          const finalContent = contentElement.innerText.trim();
          cleanupAndResolve(finalContent);
        }, stabilityTimeout);
      }
    });

    const cleanupAndResolve = (finalContent) => {
      observer.disconnect();
      clearTimeout(mainTimeoutTimer);
      clearTimeout(stabilityTimer);
      resolve(finalContent);
    };

    const cleanupAndReject = (error) => {
      observer.disconnect();
      clearTimeout(mainTimeoutTimer);
      clearTimeout(stabilityTimer);
      reject(error);
    };

    const initialContentElement =
      responseElement.querySelector(contentSelector);

    if (
      initialContentElement &&
      initialContentElement.innerText.trim() !== ""
    ) {
      resolve(initialContentElement.innerText.trim());
      return;
    }

    observer.observe(responseElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    mainTimeoutTimer = setTimeout(() => {
      const currentContentElement =
        responseElement.querySelector(contentSelector);
      const currentContent = currentContentElement
        ? currentContentElement.innerText.trim()
        : "";

      if (currentContent !== "") {
        cleanupAndResolve(currentContent);
      } else {
        cleanupAndReject(
          new Error("Timeout waiting for response content to appear."),
        );
      }
    }, timeout);
  });
};
