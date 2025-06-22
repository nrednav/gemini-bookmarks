import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitForElement } from './wait-for-element';

describe('helpers/waitForElement', () => {
  let parentElement;

  beforeEach(() => {
    vi.useFakeTimers();

    parentElement = document.createElement('div');

    document.body.appendChild(parentElement);
  });

  afterEach(() => {
    vi.useRealTimers();

    if (parentElement.parentNode) {
      parentElement.parentNode.removeChild(parentElement);
    }
  });

  test('should resolve immediately if the element already exists', async () => {
    const targetElement = document.createElement('span');

    targetElement.id = 'target';

    parentElement.appendChild(targetElement);

    const foundElement = await waitForElement({ parentElement: parentElement, selector: '#target' });

    expect(foundElement).toBe(targetElement);
  });

  test('should resolve when the element appears after a delay', async () => {
    const promise = waitForElement({ parentElement: parentElement, selector: '#target' });

    setTimeout(() => {
      const targetElement = document.createElement('span');

      targetElement.id = 'target';

      parentElement.appendChild(targetElement);
    }, 200);

    await vi.advanceTimersByTimeAsync(300);

    const foundElement = await promise;

    expect(foundElement).not.toBeNull();
    expect(foundElement.id).toBe('target');
  });

  test('should reject if the element does not appear within the timeout', async () => {
    const promise = waitForElement({ parentElement: parentElement, selector: '#target', timeout: 500 });

    const assertionPromise = expect(promise).rejects.toThrow(
      'Element with selector "#target not found within 500 ms."'
    );

    await vi.advanceTimersByTimeAsync(501);

    await assertionPromise;
  });
});
