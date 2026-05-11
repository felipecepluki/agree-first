import { useRef, useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
}

interface UseFocusTrapOptions {
  onEscape?: () => void;
  returnFocusTo?: HTMLElement | null;
}

export function useFocusTrap({ onEscape, returnFocusTo }: UseFocusTrapOptions = {}): {
  containerRef: RefObject<HTMLDivElement | null>;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Keep ref current so the cleanup closure always has the latest value
  const returnFocusRef = useRef<HTMLElement | null>(returnFocusTo ?? null);
  returnFocusRef.current = returnFocusTo ?? null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const raf = requestAnimationFrame(() => {
      const focusable = getFocusable(container);
      if (focusable.length > 0) focusable[0].focus();
      else container.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [onEscape]);

  return { containerRef };
}
