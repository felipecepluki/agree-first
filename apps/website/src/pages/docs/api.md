---
layout: ../../layouts/DocsLayout.astro
title: API reference
description: Public props, document shape, render props, and acceptance payload for agree-first.
---

# API reference

The main export is `AgreeFirst`. It supports either link-only documents or documents with review content. The public `AcceptPayload` name is retained for compatibility.

## `AgreeFirst` props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `documents` | `AgreeFirstDocument[]` | required | Nonempty document list. Omit `content` on all for simple flow; provide it on all for review. |
| `onAccept` | `(payload?: AcceptPayload) => void` | — | Called on simple acceptance, or after `submit()` following review. |
| `previousPayload` | `AcceptPayload` | — | Earlier record used for version matching; takes precedence over storage. |
| `storageKey` | `string` | — | Optional browser-local persistence key. |
| `render` | `(props: RenderProps) => ReactNode` | — | Render your own external controls. |
| `children` | `ReactNode` | — | Label for the optional default action button. |
| `label` | `ReactNode` | generated | Default checkbox prompt override. |
| `requireScroll` | `boolean` | `true` | Gate review acceptance on scroll completion; ignored for simple flow. |
| `requireCheckbox` | `boolean` | `true` | Show default checkbox; when `false`, use the optional button as the action. |
| `value` / `onChange` | `boolean` / `(accepted: boolean) => void` | — | Controlled form state. |
| `onBlur` | `() => void` | — | Fires on acceptance and modal close. |
| `name` | `string` | — | Name for a hidden native checkbox input. |
| `unstyled` | `boolean` | `false` | Remove default class names. |
| `className` / `classNames` | `string` / `AgreeFirstClassNames` | — | Customize default UI classes. |
| `strings` | `AgreeFirstStrings` | — | Override built-in modal copy and accessible labels. |
| `consentId` | `string` | generated | Custom payload ID. |
| `onOpen` / `onDecline` | `() => void` | — | Modal open / close-without-accept callbacks. |
| `onScrollProgress` | `(progress: number) => void` | — | Fraction of documents scrolled, from `0` to `1`. |
| `closeOnOverlayClick` | `boolean` | `true` | Allow backdrop to close the modal. |

Individual text props `modalTitle`, `acceptText`, `continueText`, `scrollHint`, and `readFullText` also remain available. `strings` takes precedence when both are provided. The full list of `strings` keys is in the [README](https://github.com/felipecepluki/agree-first#i18n--strings).

## `AgreeFirstDocument`

```ts
interface AgreeFirstDocument {
  title: string;
  url: string;               // stable, unique URL within this flow
  version?: string;          // update when the document changes
  content?: ReactNode;       // omit entirely for simple flow
  type?: "terms" | "privacy" | "policy" | "custom";
  minReadTimeMs?: number;    // review content only
}
```

The URL is a link and matching identity, not a source fetched by the package. `minReadTimeMs` requires `content`.

## `AcceptPayload`

```ts
interface AcceptPayload {
  id: string;
  timestamp: string;         // ISO 8601
  documents: Array<{
    title: string;
    url: string;
    version?: string;
    type?: string;
  }>;
  scrollCompleted: number[]; // document indexes, empty in simple flow
  userAgent?: string;
}
```

Store the payload server-side if your product needs a durable acceptance record. It is not proof of reading or automatic legal compliance.

## `RenderProps`

The `render` callback receives `isAccepted`, `isModalOpen`, `openModal()`, `closeModal()`, `canSubmit`, `submit()`, `reset()`, `scrollProgress`, `needsReAcceptance`, and `getPayload()`.

`submit()` accepts immediately in the simple flow. In review flow, it calls `onAccept` after the documents have been accepted. `reset()` clears in-memory progress, not stored records. The [README](https://github.com/felipecepluki/agree-first#renderprops) includes a typed example.

## Hooks

`useAgreeFirst` exposes the underlying state machine for advanced use. `useScrollCompletion` tracks completion for a scrollable element, including non-overflowing content. Both are public exports, but the component is the simplest starting point. See the [README hook examples](https://github.com/felipecepluki/agree-first#usescrollcompletion-hook).
