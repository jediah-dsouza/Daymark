import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  const prototype = HTMLDialogElement.prototype;
  if (!prototype.showModal) {
    Object.defineProperty(prototype, 'showModal', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    });
  }
  if (!prototype.close) {
    Object.defineProperty(prototype, 'close', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
      },
    });
  }
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
