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
const reactIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4.1"/><ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/></svg>';
const terminalIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 7 5 5-5 5M12 17h8"/></svg>';
const codeIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-4 18"/></svg>';

const languageLabels: Record<string, string> = {
  bash: "Terminal",
  css: "CSS",
  text: "Example",
  ts: "TypeScript",
  tsx: "React · TSX",
};

function renderInstallCommand(code: Element, command: string): void {
  const [manager, action, packageName] = command.split(" ");
  const part = (className: string, value: string) => {
    const span = code.ownerDocument.createElement("span");
    span.className = className;
    span.textContent = value;
    return span;
  };
  code.replaceChildren(
    part("docs-command-manager", manager), " ",
    part("docs-command-action", action), " ",
    part("docs-command-package", packageName),
  );
}

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
    const icon = root.createElement("span");
    icon.className = `docs-code-icon docs-code-icon-${language}`;
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = language === "tsx" || language === "jsx" ? reactIcon : language === "bash" ? terminalIcon : codeIcon;
    const label = root.createElement("span");
    label.className = "docs-code-label";
    const filename = /^\/\/\s+(.+\.(?:tsx?|jsx?|css))\s*$/.exec(initialCode.split("\n", 1)[0])?.[1];
    label.textContent = isInstall ? "Install agree-first" : filename ?? languageLabels[language] ?? language.toUpperCase();
    header.append(icon, label);

    let currentCode = initialCode;
    if (isInstall) {
      block.classList.add("docs-code-install");
      const managerTabs = root.createElement("div");
      managerTabs.className = "docs-package-managers";
      managerTabs.setAttribute("role", "group");
      managerTabs.setAttribute("aria-label", "Choose a package manager");

      for (const [manager, command] of Object.entries(installCommands)) {
        const tab = root.createElement("button");
        tab.type = "button";
        tab.className = "docs-package-manager";
        tab.textContent = manager;
        tab.setAttribute("aria-pressed", String(manager === "npm"));
        tab.addEventListener("click", () => {
          currentCode = command;
          renderInstallCommand(code, command);
          managerTabs.querySelectorAll("button").forEach((button) => {
            button.setAttribute("aria-pressed", String(button === tab));
          });
        });
        managerTabs.append(tab);
      }
      renderInstallCommand(code, currentCode);
      header.append(managerTabs);
    }

    const copyButton = root.createElement("button");
    copyButton.type = "button";
    copyButton.className = "docs-code-copy";
    copyButton.setAttribute("aria-label", "Copy code");
    copyButton.title = "Copy code";
    copyButton.innerHTML = copyIcon;
    const copyStatus = root.createElement("span");
    copyStatus.className = "docs-code-status";
    copyStatus.setAttribute("aria-live", "polite");
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(currentCode);
        copyButton.innerHTML = checkIcon;
        copyButton.setAttribute("aria-label", "Code copied");
        copyButton.title = "Copied";
        copyButton.dataset.state = "copied";
        copyStatus.textContent = "Code copied to clipboard";
      } catch {
        copyButton.innerHTML = copyIcon;
        copyButton.setAttribute("aria-label", "Copy failed, try again");
        copyButton.title = "Copy failed, try again";
        copyButton.dataset.state = "error";
        copyStatus.textContent = "Could not copy code";
      }
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copyButton.innerHTML = copyIcon;
        copyButton.setAttribute("aria-label", "Copy code");
        copyButton.title = "Copy code";
        delete copyButton.dataset.state;
        copyStatus.textContent = "";
      }, 2000);
    });
    header.append(copyButton, copyStatus);

    pre.parentElement.insertBefore(block, pre);
    block.append(header, pre);
  });
}
