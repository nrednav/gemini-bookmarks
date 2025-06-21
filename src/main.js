import { elementSelectors } from "./data/element-selectors";
import { logger } from "./shell/logger";
import { createConversationKey } from "./core/create-conversation-key";
import { injectUi } from './ui/inject-ui';
import { renderUi } from './ui/render-ui';
import { StateManager } from "./core/state-manager";
import { waitForElement } from './helpers/wait-for-element'
import { setupEventListeners } from "./shell/setup-event-listeners";
import { startObserver } from "./shell/start-observer";
import { injectBookmarkButton } from "./ui/inject-bookmark-button";

export const main = async () => {
  try {
    logger.info("Loaded.");

    await waitForElement(
      window.document.body.querySelector('main') || window.document.body,
      elementSelectors.modelResponse.container
    );

    const conversationKey = createConversationKey(window.location.pathname);
    const stateManager = new StateManager({ conversationKey });

    await stateManager.loadStateFromStorage();

    const { uiElements } = injectUi(window, elementSelectors);

    const dependencies = {
      window,
      uiElements,
      elementSelectors,
      stateManager,
      onNavigate: main
    };

    for (const modelResponse of uiElements.modelResponses) {
      await injectBookmarkButton(modelResponse, dependencies);
    }

    setupEventListeners(dependencies);
    startObserver(dependencies);
    renderUi(dependencies);
  } catch (error) {
    logger.error("Failed to initialize extension:", error);
  }
};

if (document.readyState !== "loading") {
  main();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    main();
  });
}
