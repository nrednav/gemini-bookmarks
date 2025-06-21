export const waitForElement = (parentElement, selector, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const element = parentElement.querySelector(selector);

    if (element) {
      resolve(element);
      return;
    }

    const interval = setInterval(() => {
      const element = parentElement.querySelector(selector);

      if (element) {
        clearInterval(interval);
        resolve(element);
      }
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      reject(new Error(`Element with selector "${selector} not found within ${timeout} ms."`));
    }, timeout);
  });
}
