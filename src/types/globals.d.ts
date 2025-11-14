// Global typings used across the app
// Central place for DOM apis that may not exist in some TS lib sets

export {};

declare global {
  interface Window {
    requestIdleCallback?: (
      callback: (deadline: { timeRemaining: () => number; didTimeout: boolean }) => void,
      options?: { timeout?: number }
    ) => number;
    cancelIdleCallback?: (id: number) => void;
  }
}
