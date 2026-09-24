# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Position the package as a small library for versioned React agreement flows; scroll and minimum-time gates remain optional review tools, not proof of reading.
- Add a link-only agreement flow: omit `content` from every document to record acceptance directly from the checkbox or `submit()` in a custom UI. Existing documents with `content` keep their review-modal behavior and default scroll gate.
- Reject mixed link-only/review document lists and `minReadTimeMs` without review content, so review requirements cannot be silently skipped.
- Treat incomplete previous or stored payloads as non-matching instead of allowing malformed data to crash version matching.
- Read browser-local records after hydration, avoiding a checked-state mismatch for returning users in server-rendered apps.
- Clear `needsReAcceptance` once the current documents have been accepted, even when the previous record is outdated.
- Keep the default checkbox's accessible name properly spaced across multiple document links; remove its default link class in `unstyled` mode.
- Document URL/version comparison, re-acceptance, local storage limits, and acceptance-payload semantics; update npm description and keywords.
- Avoid duplicate `onAccept` calls in the simple flow while a controlled parent applies its value asynchronously; clarify that document URLs must be unique and metadata changes require remounting with a new key.

## [0.1.0] — 2026-05-11

### Features

- **Headless consent modal** — `AgreeFirst` component with render prop and default UI modes
- **Multi-document tabs** — present Terms of Service, Privacy Policy, and any custom documents in a sequential tab flow
- **Flexible modal layout** — the default heading follows the active document, tabs share available width equally, and the document link and acceptance action align in one footer; the default theme adds a larger close control and more readable document link
- **Scroll enforcement** — progress bar + `requireScroll` lock that prevents acceptance until the user reaches the bottom
- **Minimum display time** — `minReadTimeMs` per document, independent of or combined with scroll enforcement
- **Consent payload** — timestamped `AcceptPayload` with document list, scroll-completion indexes, and `userAgent`; useful as an interaction record when stored server-side
- **Version detection** — `previousPayload` / `storageKey` auto-accepts returning users or sets `needsReAcceptance` when a document version changed
- **Form library integration** — `value` / `onChange` / `onBlur` / `name` props compatible with React Hook Form, Formik, TanStack Form, and react-final-form
- **i18n / strings** — modal copy, accessibility labels, and document position text are overridable via `strings`; document content, checkbox copy, and submit text are supplied separately
- **Accessibility** — focus trap, Escape key, `role="dialog"`, `role="tablist"`, `role="progressbar"`, live region for tab changes, full `:focus-visible` support
- **Keyboard scroll** — Space, PageDown/Up, ArrowDown/Up, Home, End scroll the document area when focused
- **Dark mode** — automatic via `prefers-color-scheme: dark`; all colors exposed as CSS custom properties (`--af-*`)
- **CSS custom properties** — full theme control without touching `classNames`
- **`classNames` overrides** — per-element class injection for unstyled / partial-styled setups
- **`unstyled` mode** — strip all default classes; apply your own via `classNames` while the screen-reader announcement remains visually hidden
- **Entry and exit animations** — slide-up entry, slide-down exit with fade overlay
- **`onOpen` callback** — fires when the modal opens (analytics)
- **`onDecline` callback** — fires when the modal closes without full acceptance
- **`onScrollProgress` callback** — fires with 0–1 progress as documents are scrolled
- **`useScrollCompletion` export** — standalone hook for tracking scroll completion on any element
- **`useAgreeFirst` export** — full hook for building completely custom UIs
- **`closeModal` in `RenderProps`** — headless mode can close the modal programmatically
- **Next.js App Router compatible** — `"use client"` directive, no server-side `window` access
- **Zero runtime dependencies** — only `react` and `react-dom` as peer deps

### Packages

- `agree-first` — main entry (`dist/index.js`, `dist/index.mjs`)
- `agree-first/styles` — optional default stylesheet (`dist/styles/default.css`)
