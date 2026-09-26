---
layout: ../../layouts/DocsLayout.astro
title: Troubleshooting
description: Diagnose common agree-first setup, styling, acceptance, versioning, and form integration issues.
---

# Troubleshooting

Start with the behavior you see. These answers describe the current package contract; they are not a substitute for testing your own document content, styling, and submission flow in a browser.

## Setup and styling

### The component works, but it has no default styling

The stylesheet is optional and must be imported by your application:

```tsx
import { AgreeFirst } from "agree-first";
import "agree-first/styles";
```

Import it once in your app's normal global-CSS entry point. If you intentionally use `unstyled`, supply your own layout and classes; that mode keeps behavior and markup but does not provide the default visual design. See [Styling & headless UI](/docs/styling/).

### My theme variables do not change the modal

The modal is rendered in a portal under `document.body`. CSS variables set only on an ancestor of your form do not reach it. Put shared `--af-*` variables on `:root`, `html`, or `body`, or another ancestor of the portal. The [styling guide](/docs/styling/) lists examples.

### An SSR framework says the component needs a client boundary

`AgreeFirst` uses browser interaction and its entry point includes `"use client"`. In a React Server Components app, keep event callbacks such as `onAccept` inside a client component rather than passing a regular function from a server component. See the [Next.js](/docs/nextjs/) or [RedwoodSDK](/docs/redwoodsdk/) guide. In Astro, render it as a hydrated React island; see [Astro + React](/docs/astro/).

## Agreement behavior

### Clicking the checkbox does not open a modal

That is the **simple flow** when every document omits `content`. The checkbox accepts immediately and calls `onAccept`; it still links to each document URL. To enable review, provide React `content` for **every** document. Mixing documents with and without `content` throws an error. See [Optional review](/docs/review/).

### I set `requireScroll={false}`, but the modal still opens

`requireScroll` only removes the scroll gate **inside an existing review flow**. It does not select the simple flow. For a checkbox and links without a modal, omit `content` on every document.

### The review accept action stays unavailable

Check the active document, not a previously completed tab. In review mode, `requireScroll` defaults to `true`, so the active scroll area must reach the bottom. A document with `minReadTimeMs` must also finish its minimum **display time**. Use `requireScroll={false}` if you do not want a scroll requirement. A document that fits in the scroll area counts as completed immediately; that is expected. See [Optional review](/docs/review/).

### All documents are accepted, but `onAccept` did not run

In review mode, finishing the last tab updates the accepted state but does not call `onAccept` yet. Supply an optional action button through `children` and activate it, or call `submit()` from your own `render` control. In the simple flow, checking the box calls `onAccept` immediately. If you place the review action inside a form, use a custom `type="button"` control or otherwise prevent an unintended form submit. See [Optional review](/docs/review/) and the [form guides](/docs/react-hook-form/).

### I get an error about missing `content` or `minReadTimeMs`

Choose one flow for the entire document list: omit `content` on **all** documents for a simple agreement, or provide it on **all** documents for review. `minReadTimeMs` requires review content. The `url` is only a link; it does not make the package load a document into the modal.

## Records and re-acceptance

### A changed policy did not ask for acceptance again

The package compares every current document's `url` and `version` with the previous record. It does **not** inspect the page behind the URL. Keep URLs unique within a flow and update `version` when text changes. If both the old and current `version` are omitted, the same URL still matches. See [Versioning & re-acceptance](/docs/versioning/).

### I changed documents after render, but the checkbox kept its old state

Initial acceptance and the storage source are read when `AgreeFirst` mounts. If URLs, versions, `previousPayload`, or `storageKey` change while it stays mounted, remount it with a React `key` derived from those inputs. If you also pass controlled `value`, reset it to `false` when re-acceptance is required; a new key cannot override a parent-supplied `true`.

### I saved a record, but it was not restored on another device

`storageKey` uses the current browser's `localStorage`, not a server account. For cross-device persistence, save the `AcceptPayload` in your application and pass the prior record back as `previousPayload`. If both props are supplied, `previousPayload` takes precedence. Invalid or unavailable local storage does not grant acceptance.

### The checkbox briefly appears unchecked after a server-rendered page loads

With `storageKey`, the package reads browser storage **after hydration** so the server and first client render agree. A matching stored record can then update the checkbox. If that transition is unsuitable, load a prior record in your own app and pass it as `previousPayload`; do not read `localStorage` during server rendering just to force a checked first frame.

## Controlled forms

### The checkbox stays unchecked after I click it

When you pass `value`, the parent owns the state. `onChange` receives a **boolean**, not a DOM event, and the parent must update `value` promptly:

```tsx
import { useState } from "react";

const [accepted, setAccepted] = useState(false);

<AgreeFirst
  documents={documents}
  value={accepted}
  onChange={setAccepted}
/>
```

In a form library, connect `value` and `onChange` to its controlled field. See [React Hook Form](/docs/react-hook-form/) or [TanStack Form](/docs/tanstack-form/).

### The form has `terms: true`, but no acceptance payload

The form field is only a boolean. Capture `onAccept(payload)` separately and send that record with your form request. In the simple flow, `onAccept` happens when the checkbox is checked, not when the form is submitted. In review mode, call the final `submit()` action first. A restored matching `previousPayload` also does not trigger `onAccept` again; initialize your form's record from that prior payload. Both form guides show this separation.

### Resetting the form did not delete the previous agreement

Form reset clears controlled state and in-memory progress; it is **not revocation**. It does not remove an existing `localStorage` or server record. Decide separately what revocation means for your product. If your form holds a pending payload in a ref or state, clear that value when resetting the form.

## Still stuck?

Try the [local playground](https://github.com/felipecepluki/agree-first/tree/main/apps/playground) with the same number of documents and flow. If you can reproduce the issue, [open a GitHub issue](https://github.com/felipecepluki/agree-first/issues) with a minimal example, package and React versions, browser, whether CSS is imported, document shape (without private legal text), and the expected and actual behavior. For a potential vulnerability, use the private reporting route in [SECURITY.md](https://github.com/felipecepluki/agree-first/blob/main/SECURITY.md), not a public issue.
