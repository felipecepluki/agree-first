type GlowDot = {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
  driftPhase: number;
  driftSpeed: number;
  driftX: number;
  driftY: number;
  mint: boolean;
};

export function mountDottedGlow(canvas: HTMLCanvasElement, hero: HTMLElement) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let dots: GlowDot[] = [];
  let width = 0;
  let height = 0;
  let visible = true;
  let frame = 0;
  let lastPaint = 0;

  function resize() {
    const bounds = hero.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    let seed = 1729;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    dots = [];
    for (let y = 5.5; y < height; y += 11) {
      for (let x = 5.5; x < width; x += 11) {
        if (random() > 0.035) continue;
        dots.push({
          x,
          y,
          radius: 0.9 + random() * 0.7,
          phase: random() * Math.PI * 2,
          speed: 0.00035 + random() * 0.0008,
          driftPhase: random() * Math.PI * 2,
          driftSpeed: 0.00055 + random() * 0.00035,
          driftX: 3.5 + random() * 3,
          driftY: 2.8 + random() * 2.4,
          mint: random() > 0.93,
        });
      }
    }
    update();
  }

  function paint(now: number) {
    if (now - lastPaint < 32 && !reducedMotion.matches) {
      frame = requestAnimationFrame(paint);
      return;
    }
    lastPaint = now;
    context!.clearRect(0, 0, width, height);

    for (const dot of dots) {
      const pulse = (Math.sin(now * dot.speed + dot.phase) + 1) / 2;
      const alpha = 0.2 + pulse * pulse * 0.7;
      const x = dot.x + Math.sin(now * dot.driftSpeed + dot.driftPhase) * dot.driftX;
      const y = dot.y + Math.cos(now * dot.driftSpeed * 0.79 + dot.driftPhase) * dot.driftY;
      context!.shadowBlur = 12;
      context!.shadowColor = dot.mint ? "rgba(111, 226, 185, .9)" : "rgba(177, 151, 255, .9)";
      context!.fillStyle = dot.mint
        ? `rgba(139, 242, 200, ${alpha})`
        : `rgba(192, 169, 255, ${alpha})`;
      context!.beginPath();
      context!.arc(x, y, dot.radius, 0, Math.PI * 2);
      context!.fill();
    }

    if (!reducedMotion.matches && visible && !document.hidden) {
      frame = requestAnimationFrame(paint);
    }
  }

  function update() {
    cancelAnimationFrame(frame);
    if (visible && !document.hidden) paint(performance.now());
  }

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  resizeObserver.observe(hero);
  intersectionObserver.observe(hero);
  reducedMotion.addEventListener("change", update);
  document.addEventListener("visibilitychange", update);
}
