---
layout: ../../layouts/DocsLayout.astro
title: Optional review
description: Add an optional accessible document review modal, scroll completion, and minimum display time.
---

# Optional review

The common flow needs only links and a checkbox. If your product wants a more explicit review step, provide `content` for **every** document. That activates the built-in modal.

```tsx
const documents = [
  {
    title: "Terms of Service",
    url: "/terms",
    version: "1.4",
    content: <TermsText />,
  },
  {
    title: "Privacy Policy",
    url: "/privacy",
    version: "2.0",
    content: <PrivacyText />,
  },
];

<AgreeFirst
  documents={documents}
  requireScroll
  onAccept={(payload) => payload && saveAgreement(payload)}
>
  Continue
</AgreeFirst>
```

With `content`, the checkbox opens the modal. The user works through documents in order. After the final document is accepted, the optional **Continue** button calls `onAccept`. If you supply your own controls through `render`, call its `submit()` after review instead.

Do not mix link-only documents and documents with `content` in one flow. The document `url` remains a link to the full text; the library does not fetch it into the modal.

## Review requirements

`requireScroll` defaults to `true` in the review flow. It waits for the active document to reach the bottom. If its content fits in the viewport, it completes immediately. Use `requireScroll={false}` to remove the scroll gate while keeping the modal.

You can add `minReadTimeMs` to a document to delay its accept action. This is a minimum **display time**, not a measurement of actual reading.

```tsx
const documents = [
  {
    title: "Terms of Service",
    url: "/terms",
    version: "1.4",
    content: <TermsText />,
    minReadTimeMs: 15_000,
  },
];

<AgreeFirst documents={documents} requireScroll={false}>
  Continue
</AgreeFirst>
```

## Keyboard and focus

The modal exposes dialog, tab, tabpanel, and progress semantics. Its tabs support Arrow Left/Right, Home, and End. The document area supports Space, Page Up/Down, Arrow Up/Down, Home, and End when focused. Escape closes the modal, and focus returns to the opening control. Check the result with your own content and surrounding form in a real browser.

Close, reopen, mobile layout, and document switching can be tested in the [local Vite playground](https://github.com/felipecepluki/agree-first/tree/main/apps/playground). Scroll completion and display time record UI interaction only; neither proves that someone read or understood a document.
