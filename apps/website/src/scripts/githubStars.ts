type StarCache = { count: number; checkedAt: number };

const cacheKey = "agree-first-github-stars";
const refreshAfterMs = 10 * 60 * 1000;
const apiUrl = "https://api.github.com/repos/felipecepluki/agree-first";

export function mountGitHubStars(link: HTMLAnchorElement) {
  const countLabel = link.querySelector<HTMLElement>("[data-star-count]");
  if (!countLabel) return;

  let lastCheckedAt = 0;

  function showCount(count: number) {
    countLabel!.textContent = new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(count).toLowerCase();
    link.setAttribute("aria-label", `${count} GitHub stars; view agree-first repository`);
  }

  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) ?? "null") as StarCache | null;
    if (cached && Number.isInteger(cached.count) && cached.count >= 0 && Number.isFinite(cached.checkedAt)) {
      showCount(cached.count);
      lastCheckedAt = cached.checkedAt;
    }
  } catch {
    // Storage can be unavailable; the badge remains a normal repository link.
  }

  async function refresh() {
    if (document.hidden || Date.now() - lastCheckedAt < refreshAfterMs) return;
    lastCheckedAt = Date.now();

    try {
      const response = await fetch(apiUrl, {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
      });
      if (!response.ok) return;

      const repository: { stargazers_count?: unknown } = await response.json();
      const count = repository.stargazers_count;
      if (typeof count !== "number" || !Number.isInteger(count) || count < 0) return;

      showCount(count);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ count, checkedAt: lastCheckedAt }));
      } catch {
        // A successful fetch should still update the badge when storage is blocked.
      }
    } catch {
      // Network and API limits must not break site navigation.
    }
  }

  void refresh();
  window.setInterval(() => void refresh(), refreshAfterMs);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void refresh();
  });
}
