import "@testing-library/jest-dom";

// Node 22+ may expose an undefined experimental localStorage global when it is
// not started with --localstorage-file. Prefer jsdom's browser implementation.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: (globalThis as typeof globalThis & { jsdom: { window: Window } }).jsdom.window.localStorage,
});

class ResizeObserverMock {
  private static observers = new Set<ResizeObserverMock>();
  private target: Element | null = null;

  constructor(private readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.observers.add(this);
  }

  observe(target: Element) {
    this.target = target;
  }

  unobserve(target: Element) {
    if (this.target === target) this.target = null;
  }

  disconnect() {
    this.target = null;
  }

  static trigger(target: Element) {
    for (const observer of ResizeObserverMock.observers) {
      if (observer.target === target) {
        observer.callback([], observer as unknown as ResizeObserver);
      }
    }
  }
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverMock,
});
