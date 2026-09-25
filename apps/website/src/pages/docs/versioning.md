---
layout: ../../layouts/DocsLayout.astro
title: Versioning & re-acceptance
description: Learn how agree-first compares document URLs and versions and handles previous acceptance records.
---

# Versioning & re-acceptance

You declare document versions. `agree-first` compares the current documents with the last acceptance record and can request acceptance again when they differ.

```text
Previously accepted: /terms version 1.3
Current document:   /terms version 1.4
Result:             acceptance required again
```

## The matching rule

Every **current** document must have a matching URL and version in the previous payload. Titles and order do not affect matching.

| Current change | Result |
| --- | --- |
| Same URL and same version | Remains accepted |
| Same URL, new version | Requires acceptance again |
| New document or changed URL | Requires acceptance again |
| Document removed | Remains accepted if all remaining current documents match |
| Both old and current versions omitted | Matches for the same URL, even if the text changed |

Use a stable, **unique URL per document within a flow**. Two entries with the same URL cannot be distinguished reliably. The library does not fetch or hash the page behind a URL, so your application must update `version` when its document changes.

## Choose a record source

For a durable record, load the user's last `AcceptPayload` from your backend and pass it as `previousPayload`:

```tsx
<AgreeFirst
  documents={documents}
  previousPayload={lastAgreement}
  onAccept={(payload) => payload && saveAgreement(payload)}
/>
```

For browser-local convenience, use `storageKey`:

```tsx
<AgreeFirst
  documents={documents}
  storageKey="my_app_agreement"
  onAccept={(payload) => payload && saveAgreement(payload)}
/>
```

When both are supplied, `previousPayload` takes precedence. Invalid or unavailable local storage does not grant acceptance. Storage is written when acceptance occurs, **before** any asynchronous server request in your `onAccept` callback succeeds or fails. Use your backend as the source of truth if that distinction matters.

## Changing documents after mount

The initial accepted state and storage source are read on mount. If your app changes document URLs, versions, the previous record, or the storage key while the component is mounted, remount it with a new React `key` derived from those inputs.

```tsx
<AgreeFirst
  key={termsVersion}
  documents={documents}
  previousPayload={lastAgreement}
  onAccept={(payload) => payload && saveAgreement(payload)}
/>
```

In controlled mode, the parent also needs to set `value={false}` when the new documents require acceptance again. A new component key cannot override a `true` value supplied by the parent.

## What is recorded?

`onAccept` receives an `AcceptPayload` with an ID, timestamp, the current document metadata, scroll-completion indexes, and an optional user agent. The public type name remains `AcceptPayload` for compatibility. See the [API reference](/docs/api/#acceptpayload).

`reset()` clears in-memory progress. It does not delete a stored or server-side record, and it is not a revocation workflow.
