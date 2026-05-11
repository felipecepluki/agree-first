import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollCompletion } from "../hooks/useScrollCompletion";

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
});
