---
layout: ../../layouts/DocsLayout.astro
title: Getting started
description: Install agree-first and build a simple versioned agreement flow in React.
---

# Getting started

Use a checkbox with links to your documents. `agree-first` tracks the accepted versions and gives you a record when the user accepts.

## Install

```bash
npm install agree-first
```

You can also use `pnpm add agree-first`, `yarn add agree-first`, or `bun add agree-first`. React and React DOM are peer dependencies; React 18 and 19 are tested in the library's CI.

## Your first agreement

```tsx
import { AgreeFirst } from "agree-first";
import "agree-first/styles"; // optional default styling

const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];

function AgreementField() {
  return (
    <AgreeFirst
      documents={documents}
      onAccept={(payload) => {
        if (payload) saveAgreement(payload);
      }}
    />
  );
}
```

`saveAgreement` is **your application function**. You decide whether to store the payload in your backend, your form state, or elsewhere. The package does not make network requests or fetch the document URLs.

Because the documents have no `content` prop, this is the **simple agreement** flow. The default UI is a checkbox with links. Checking it calls `onAccept` immediately, without opening a modal or requiring scroll. Unchecking is not a revocation workflow.

> Give each document a stable, unique URL. It is the document's identity when matching an earlier record. Add a `version` and update it whenever that document changes.

## Returning users

Pass a saved `AcceptPayload` back as `previousPayload`. Matching current URLs and versions start accepted; changed ones ask for acceptance again.

```tsx
<AgreeFirst
  documents={documents}
  previousPayload={savedPayload}
  onAccept={(payload) => payload && saveAgreement(payload)}
/>
```

For a browser-local record, `storageKey="my_app_agreement"` reads and writes `localStorage` instead. It is convenient, but not a secure or cross-device record. See [versioning and persistence](/docs/versioning/) for the matching rules and edge cases.

## What comes next?

- [Versioning & re-acceptance](/docs/versioning/) explains exactly when a new acceptance is needed.
- [Optional review](/docs/review/) shows the modal, scrolling, and minimum display time.
- [Styling & headless UI](/docs/styling/) shows how to use your own design system.
- [API reference](/docs/api/) lists the props and payload shape.

The package records the interaction and acceptance configured by the developer. It does not prove reading, understanding, or legal compliance.
