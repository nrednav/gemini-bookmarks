import { createConversationKey } from "./core/create-conversation-key";
import { getTheme } from "./core/settings";
import { StateManager } from "./core/state-manager";
import { checkStorageQuota } from "./core/storage-limiter";
import { elementSelectors } from "./data/element-selectors";
import { waitForElement } from "./helpers/wait-for-element";
import { Logger } from "./shell/logger";
import { setupEventListeners } from "./shell/setup-event-listeners";
import { startObserver } from "./shell/start-observer";
import { injectBookmarkButton } from "./ui/inject-bookmark-button";
import { injectStyles } from "./ui/inject-styles";
import { injectUi } from "./ui/inject-ui";
import { renderUi } from "./ui/render-ui";
import { applyTheme } from "./ui/theme-manager";

export const main = async () => {
  const logger = new Logger(window);

  try {
    logger.info("Loaded.");

    injectStyles({ logger });

    await waitForElement({
      parentElement:
        window.document.body.querySelector("main") || window.document.body,
      selector: elementSelectors.modelResponse.container,
    });

    const conversationKey = createConversationKey(window.location.pathname);
    const stateManager = new StateManager({ conversationKey });

    await stateManager.loadStateFromStorage();

    const { uiElements } = injectUi(window, elementSelectors);
    const initialTheme = await getTheme();

    applyTheme(initialTheme, uiElements);

    const dependencies = {
      window,
      logger,
      uiElements,
      elementSelectors,
      stateManager,
      onNavigate: main,
    };

    await checkStorageQuota(dependencies);

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

main();
