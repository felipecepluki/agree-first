// Adapted to this Astro site's static Markdown from the MIT-licensed Code Blocks
// copy-button and code-block patterns: https://github.com/pheralb/code-blocks

const installCommands = {
  npm: "npm install agree-first",
  pnpm: "pnpm add agree-first",
  yarn: "yarn add agree-first",
  bun: "bun add agree-first",
} as const;

const copyIcon = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
const checkIcon = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';

const languageLabels: Record<string, string> = {
  bash: "Terminal",
  css: "CSS",
  text: "Example",
  ts: "TypeScript",
  tsx: "React · TSX",
};

export function enhanceDocsCodeBlocks(root: Document): void {
  root.querySelectorAll<HTMLPreElement>(".markdown-body pre[data-language]").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code || !pre.parentElement || pre.closest(".docs-code-block")) return;

    const initialCode = code.textContent?.trim() ?? "";
    const isInstall = initialCode === installCommands.npm;
    const language = pre.dataset.language ?? "text";
    const block = root.createElement("div");
    block.className = "docs-code-block";
    const header = root.createElement("div");
    header.className = "docs-code-header";
    const label = root.createElement("span");
    label.className = "docs-code-label";
    label.textContent = languageLabels[language] ?? language.toUpperCase();
    header.append(label);

    let currentCode = initialCode;
    if (isInstall) {
      block.classList.add("docs-code-install");
      const tabs = root.createElement("div");
      tabs.className = "docs-package-managers";
      tabs.setAttribute("role", "group");
      tabs.setAttribute("aria-label", "Choose a package manager");

      for (const [manager, command] of Object.entries(installCommands)) {
        const tab = root.createElement("button");
        tab.type = "button";
        tab.className = "docs-package-manager";
        tab.textContent = manager;
        tab.setAttribute("aria-pressed", String(manager === "npm"));
        tab.addEventListener("click", () => {
          currentCode = command;
          code.textContent = command;
          tabs.querySelectorAll("button").forEach((button) => {
            button.setAttribute("aria-pressed", String(button === tab));
          });
        });
        tabs.append(tab);
      }
      header.append(tabs);
    }

    const copyButton = root.createElement("button");
    copyButton.type = "button";
    copyButton.className = "docs-code-copy";
    copyButton.setAttribute("aria-label", "Copy code");
    copyButton.innerHTML = `${copyIcon}<span>Copy</span>`;
    const copyStatus = root.createElement("span");
    copyStatus.className = "docs-code-status";
    copyStatus.setAttribute("aria-live", "polite");
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(currentCode);
        copyButton.innerHTML = `${checkIcon}<span>Copied</span>`;
        copyButton.setAttribute("aria-label", "Code copied");
        copyButton.dataset.state = "copied";
        copyStatus.textContent = "Code copied to clipboard";
      } catch {
        copyButton.innerHTML = `${copyIcon}<span>Try again</span>`;
        copyButton.setAttribute("aria-label", "Copy failed, try again");
        copyButton.dataset.state = "error";
        copyStatus.textContent = "Could not copy code";
      }
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copyButton.innerHTML = `${copyIcon}<span>Copy</span>`;
        copyButton.setAttribute("aria-label", "Copy code");
        delete copyButton.dataset.state;
        copyStatus.textContent = "";
      }, 2000);
    });
    header.append(copyButton, copyStatus);

    pre.parentElement.insertBefore(block, pre);
    block.append(header, pre);
  });
}
