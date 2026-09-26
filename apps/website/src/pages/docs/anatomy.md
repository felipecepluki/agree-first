---
layout: ../../layouts/DocsLayout.astro
title: Anatomy
description: Learn how documents, versions, acceptance records, and optional review fit together in agree-first.
---

# Anatomy

An agreement flow has four pieces: **current documents**, an optional **previous record**, the **acceptance UI**, and the **new record** returned to your application.

## Documents are the source of truth

Each document needs a `title` and `url`. Add a `version` so a change can trigger re-acceptance.

```tsx
const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];
```

The URL is both a link and the document's matching identity. Keep it stable and unique within one flow. The library does not fetch, parse, or monitor what is hosted at that URL; your application declares the version. See [Versioning & re-acceptance](/docs/versioning/) for what happens when a document is added, removed, or has no version.

## The UI follows the documents

When **none** of the documents have `content`, `AgreeFirst` uses the simple checkbox-and-links flow. Checking it accepts the current set and calls `onAccept`.

When **every** document has `content`, the same component adds a review modal. The content you pass is rendered there; the URL remains a link to the full document. Scroll completion and minimum display time are optional review requirements. Do not mix documents with and without `content` in one flow.

You can use the [default CSS or your own UI](/docs/styling/). The simple flow does not require the modal.

## A previous record decides re-acceptance

Pass an earlier payload through `previousPayload`, or use `storageKey` for browser-local persistence. The current set is accepted only if every current URL and version matches the earlier record.

```text
Earlier record: Terms /terms version 1.3
Current document: Terms /terms version 1.4
Result:           acceptance required again
```

`previousPayload` takes precedence when both record sources are provided. Your backend should remain the source of truth if you need durable or cross-device records.

## Your application owns the result

On acceptance, `onAccept` receives an `AcceptPayload`: an ID, timestamp, document metadata, indexes completed by scrolling, and optionally a user agent. In a simple flow, `scrollCompleted` is empty. You decide how to store and use the payload; it is not proof of reading or automatic legal compliance.

The [API reference](/docs/api/) lists the full type shape. Continue to [Optional review](/docs/review/) only if your product needs a more explicit review step.
