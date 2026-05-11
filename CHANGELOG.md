# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] — 2026-05-11

### Features

- **Headless consent modal** — `AgreeFirst` component with render prop and default UI modes
- **Multi-document tabs** — present Terms of Service, Privacy Policy, and any custom documents in a sequential tab flow
- **Scroll enforcement** — progress bar + `requireScroll` lock that prevents acceptance until the user reaches the bottom
- **Minimum read time** — `minReadTimeMs` per document, independent of or combined with scroll enforcement
- **Audit payload** — timestamped `AcceptPayload` with document list, scroll evidence, and `userAgent`; store server-side for GDPR/LGPD compliance
- **Version detection** — `previousPayload` / `storageKey` auto-accepts returning users or sets `needsReAcceptance` when a document version changed
- **Form library integration** — `value` / `onChange` / `onBlur` / `name` props compatible with React Hook Form, Formik, TanStack Form, and react-final-form
- **i18n / strings** — all UI text overridable via the `strings` prop; `closeText` controls the modal close button aria-label
- **Accessibility** — focus trap, Escape key, `role="dialog"`, `role="tablist"`, `role="progressbar"`, live region for tab changes, full `:focus-visible` support
- **Keyboard scroll** — Space, PageDown/Up, ArrowDown/Up, Home, End scroll the document area when focused
- **Dark mode** — automatic via `prefers-color-scheme: dark`; all colors exposed as CSS custom properties (`--af-*`)
- **CSS custom properties** — full theme control without touching `classNames`
- **`classNames` overrides** — per-element class injection for unstyled / partial-styled setups
- **`unstyled` mode** — strip all default classes; apply your own via `classNames`
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
