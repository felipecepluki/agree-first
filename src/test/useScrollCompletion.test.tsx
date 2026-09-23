import { useEffect } from "react";
import { describe, it, expect } from "vitest";
import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { useScrollCompletion } from "../hooks/useScrollCompletion";

interface Geometry {
  clientHeight: number;
  scrollHeight: number;
  scrollTop?: number;
}

function setGeometry(element: HTMLDivElement, geometry: Geometry) {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: geometry.clientHeight },
    scrollHeight: { configurable: true, value: geometry.scrollHeight },
    scrollTop: { configurable: true, writable: true, value: geometry.scrollTop ?? 0 },
  });
}

function ScrollFixture({ geometry }: { geometry: Geometry }) {
  const { hasScrolled, progress, containerRef } = useScrollCompletion();

  useEffect(() => {
    const element = containerRef.current;
    if (element) setGeometry(element, geometry);
  }, [containerRef, geometry]);

  return (
    <div
      ref={(element) => {
        containerRef.current = element;
        if (element) setGeometry(element, geometry);
      }}
      data-testid="scroll-container"
      data-complete={String(hasScrolled)}
      data-progress={progress}
    />
  );
}

const resizeObserver = globalThis.ResizeObserver as unknown as {
  trigger(target: Element): void;
};

describe("useScrollCompletion", () => {
  it("initialCompleted = true → hasScrolled = true, progress = 1", () => {
    const { result } = renderHook(() => useScrollCompletion(true));

    expect(result.current.hasScrolled).toBe(true);
    expect(result.current.progress).toBe(1);
  });

  it("initialCompleted = false → hasScrolled = false, progress = 0", () => {
    const { result } = renderHook(() => useScrollCompletion(false));

    expect(result.current.hasScrolled).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("default (no arg) → hasScrolled = false, progress = 0", () => {
    const { result } = renderHook(() => useScrollCompletion());

    expect(result.current.hasScrolled).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("returns a containerRef", () => {
    const { result } = renderHook(() => useScrollCompletion(false));

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it("completes only after scrolling within ten pixels of the bottom", () => {
    const { getByTestId } = render(
      <ScrollFixture geometry={{ clientHeight: 200, scrollHeight: 1_000 }} />
    );
    const container = getByTestId("scroll-container") as HTMLDivElement;

    expect(container).toHaveAttribute("data-complete", "false");
    expect(container).toHaveAttribute("data-progress", "0");

    container.scrollTop = 790;
    fireEvent.scroll(container);

    expect(container).toHaveAttribute("data-complete", "false");

    container.scrollTop = 791;
    fireEvent.scroll(container);

    expect(container).toHaveAttribute("data-complete", "true");
    expect(Number(container.dataset.progress)).toBeCloseTo(791 / 800);
  });

  it("completes immediately when the document fits inside its viewport", () => {
    const { getByTestId } = render(
      <ScrollFixture geometry={{ clientHeight: 300, scrollHeight: 300 }} />
    );
    const container = getByTestId("scroll-container");

    expect(container).toHaveAttribute("data-complete", "true");
    expect(container).toHaveAttribute("data-progress", "1");
  });

  it("rechecks completion when a resize makes the document fit", () => {
    const { getByTestId } = render(
      <ScrollFixture geometry={{ clientHeight: 200, scrollHeight: 1_000 }} />
    );
    const container = getByTestId("scroll-container") as HTMLDivElement;

    expect(container).toHaveAttribute("data-complete", "false");

    act(() => {
      setGeometry(container, { clientHeight: 200, scrollHeight: 200 });
      resizeObserver.trigger(container);
    });

    expect(container).toHaveAttribute("data-complete", "true");
    expect(container).toHaveAttribute("data-progress", "1");
  });
});
