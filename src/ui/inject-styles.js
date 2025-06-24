import styles from "./styles.css?inline";

const STYLE_ID = "gemini-bookmarks-styles";

/**
 * Injects the extension's entire stylesheet into the document's <head>.
 * This guarantees that CSS rules are available immediately when the UI is injected,
 * preventing a Flash of Unstyled Content (FOUC) in Single Page Applications.
 */
export const injectStyles = ({ logger }) => {
  if (document.getElementById(STYLE_ID)) {
    logger.info("Styles already injected.");
    return;
  }

  try {
    const styleElement = document.createElement("style");

    styleElement.id = STYLE_ID;
    styleElement.textContent = styles;

    document.head.appendChild(styleElement);

    logger.info("Extension styles injected.");
  } catch (error) {
    logger.error("Failed to inject extension styles:", error);
  }
};
