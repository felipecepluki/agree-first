---
layout: ../../layouts/DocsLayout.astro
title: Accessibility
description: Learn the keyboard, focus, and screen-reader behavior of both agree-first flows, and what to verify in your own UI.
---

# Accessibility

The simple agreement flow starts with a real checkbox and document links. The optional review flow adds a modal with document tabs and a scrollable reading area. They need different keyboard and screen-reader checks; you do not need the modal to offer an accessible agreement control.

The component provides useful semantics and keyboard behavior, but accessibility also depends on your document content, surrounding form, styling, language, and real-browser testing. This page describes the current implementation, not a WCAG certification.

## Simple agreement: a real checkbox

By default, `AgreeFirst` renders a native checkbox inside a visible label. Its default label includes links using each document's `title` and `url`, so a keyboard user can reach both the checkbox and the documents. Checking it in a link-only flow records acceptance immediately; unchecking is not a revocation workflow.

If you replace the default `label`, keep a clear accessible name for the checkbox and preserve links to the actual documents. If you supply `children` as an action button, give it meaningful text. The `name` prop also adds a separate visually hidden checkbox for native form submission; that duplicate is removed from the accessibility tree and tab order.

For a fully custom outer control via `render`, **you own its accessibility**: use a real checkbox or an appropriate design-system checkbox, connect its label, expose the checked state, make links keyboard reachable, and show visible focus. See [Styling & headless UI](/docs/styling/) and the [shadcn/ui](/docs/shadcn-checkbox/) and [HeroUI](/docs/heroui-checkbox/) examples.

## Review dialog and focus

When every document has `content`, the checkbox opens a review dialog instead of accepting immediately. The dialog has `role="dialog"`, `aria-modal="true"`, and a title connected with `aria-labelledby`. Its close button has an accessible name. On opening, focus moves to that button. `Tab` and `Shift+Tab` wrap at the dialog's focusable boundaries; `Escape` closes it, and focus returns to the control that opened it after the close transition. Optional overlay-click closing does not replace the keyboard close control.

These behaviors are covered by component tests, but test them again with your own links and controls inside document `content`. For the modal interaction pattern, see the [WAI-ARIA dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Multiple documents and announcements

With more than one document, the modal renders a labelled tab list. The active tab reports `aria-selected`, points to its panel with `aria-controls`, and the panel points back with `aria-labelledby`. Future locked documents are disabled; completed and currently available documents can be revisited. The active document's title and position are also placed in a polite live region, which stays visually hidden even without the optional stylesheet.

While a tab has focus, `ArrowRight` and `ArrowLeft` move between **available** tabs and wrap at the ends. `Home` and `End` move to the first and last available tabs. Accepting a document moves focus to the next tab. A single-document review has no tab list; its scroll area is labelled with the document title. These choices follow the general [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) while keeping the next document unavailable until the flow permits it.

The active document also has a progress bar with an accessible label and a value from 0 to 100. `strings` lets you change labels such as the close button, tab list, scroll progress, and document position; see the [API reference](/docs/api/).

## Scrolling with a keyboard

The document area can receive focus. When **that area itself** has focus, these keys scroll it; key presses inside interactive document content keep their own behavior:

| Key | Action |
| --- | --- |
| `Space` or `PageDown` | Scroll down by most of a page |
| `PageUp` | Scroll up by most of a page |
| `ArrowDown` or `ArrowUp` | Scroll down or up by a small step |
| `End` or `Home` | Go to the bottom or top |

The accept/continue button is disabled until the configured scroll and minimum-display-time requirements are met. A document that fits inside the viewport counts as scroll-complete immediately. Reaching the bottom is an interaction signal, **not proof that someone read or understood the document**.

## Styling, motion, and language

The optional default CSS provides visible focus styles for package links, buttons, tabs, and the document area. In `unstyled` mode, semantic markup and the hidden live region remain, but **your application must supply** visible focus, sufficient contrast, readable text, and a usable responsive layout. Check the result at high zoom and on narrow screens.

The default stylesheet currently includes short opening/closing animations and does not include a `prefers-reduced-motion` override. If your product needs reduced motion now, provide an application-level override and test it. The [W3C reduced-motion guidance](https://www.w3.org/WAI/WCAG22/Techniques/css/C39) explains the preference. Translate the default English copy with `label`, `children`, document titles/content, and `strings`; ensure the surrounding page declares the appropriate language.

## Test your integration before shipping

- Use only the keyboard: reach the checkbox and every document link, open review, move between available tabs, scroll the document area, close with `Escape`, and confirm focus returns to the opener.
- Test with a screen reader in a real browser: check the checkbox name, dialog title, active tab and panel, progress value, and tab-change announcement. Automated semantic tests do not prove exactly what every reader announces.
- Check 200% zoom, a narrow viewport, visible focus, contrast, and reduced-motion settings with both your actual content and your chosen styling.
- If you provide custom `render` controls or interactive elements inside `content`, verify their labels, focus order, and keyboard behavior separately.

The [local playground](https://github.com/felipecepluki/agree-first/tree/main/apps/playground) is useful for these checks before publishing your application.
