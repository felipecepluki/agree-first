---
layout: ../../layouts/DocsLayout.astro
title: Installation
description: Install agree-first and build your first versioned agreement in React.
---

# Installation

Start with the simple flow: a checkbox, links to your documents, and a callback for the acceptance record.

## Install the package

Choose your package manager in the terminal block below:

```bash
npm install agree-first
```

React and React DOM are peer dependencies. The library's CI tests React 18 and 19. Import `agree-first/styles` only if you want the included default styling; your own CSS is welcome.

## Add an agreement

```tsx
import { AgreeFirst } from "agree-first";
import "agree-first/styles"; // optional

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

`saveAgreement` is **a function you provide**, not an export from the library. Save the payload in your form, backend, or another place appropriate for your app. The package never sends it to a server for you.

With no `content` on the documents, the default UI shows a checkbox with document links. Checking it calls `onAccept` immediately; it does not open a modal or require scroll. Unchecking is not a revocation workflow. Give each document a stable, unique URL and change its `version` when the document changes.

## Recognize a returning user

Pass a previously saved payload back to the component:

```tsx
<AgreeFirst
  documents={documents}
  previousPayload={savedPayload}
  onAccept={(payload) => payload && saveAgreement(payload)}
/>
```

Matching URLs and versions start accepted. A new document or version asks for acceptance again. For browser-local convenience, `storageKey="my_app_agreement"` can read and write `localStorage`, but that is not a secure or cross-device record. See [Versioning & re-acceptance](/docs/versioning/) for the exact matching rules and storage caveats.

## Next steps

Read [Anatomy](/docs/anatomy/) for the parts of the flow, [Optional review](/docs/review/) if you need a document modal, or [Styling & headless UI](/docs/styling/) for your design system. To include the agreement in a form, see [TanStack Form](/docs/tanstack-form/) or [React Hook Form](/docs/react-hook-form/). For framework-specific setup, see [TanStack Start](/docs/tanstack-start/), [Next.js](/docs/nextjs/), [Vite + React](/docs/vite/), [Astro + React](/docs/astro/), or [RedwoodSDK](/docs/redwoodsdk/). If something behaves unexpectedly, check [Troubleshooting](/docs/troubleshooting/).
