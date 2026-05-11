import { useRef, useState, useEffect } from "react";

export function useScrollCompletion(initialCompleted = false) {
  const [hasScrolled, setHasScrolled] = useState(initialCompleted);
  const [progress, setProgress] = useState(initialCompleted ? 1 : 0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialCompleted) return;

    const el = containerRef.current;
    if (!el) return;

    let done = false;

    const check = () => {
      if (done) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      setProgress(maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 1);
      if (maxScroll <= 0 || scrollHeight - scrollTop - clientHeight < 10) {
        done = true;
        setHasScrolled(true);
      }
    };

    check();
    el.addEventListener("scroll", check, { passive: true });

    const observer = new ResizeObserver(() => {
      check();
    });
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", check);
      observer.disconnect();
    };
  }, [initialCompleted]);

  return { hasScrolled, progress, containerRef };
}
