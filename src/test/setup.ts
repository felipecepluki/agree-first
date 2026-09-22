import "@testing-library/jest-dom";

// Node 22+ may expose an undefined experimental localStorage global when it is
// not started with --localstorage-file. Prefer jsdom's browser implementation.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: (globalThis as typeof globalThis & { jsdom: { window: Window } }).jsdom.window.localStorage,
});
