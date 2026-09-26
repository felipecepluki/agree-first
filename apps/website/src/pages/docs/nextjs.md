---
layout: ../../layouts/DocsLayout.astro
title: Next.js
description: Use agree-first in a Next.js App Router project with a small Client Component, optional CSS, and versioned records.
---

# Next.js

Use `agree-first` in an App Router project without turning the whole page into a Client Component. Keep the interactive agreement in a small client boundary; leave data loading and the rest of the page on the server. This follows [Next.js's Server and Client Component guidance](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## Install and choose styling

```bash
npm install agree-first
```

If you want the included default styles, import them once in your root layout:

```tsx
// app/layout.tsx
import "agree-first/styles";
```

That CSS is optional. Omit the import and use `unstyled` plus `classNames` or `render` if your app owns the visual design. See [Styling & headless UI](/docs/styling/). Next.js [recommends keeping global CSS imports in the application root](https://nextjs.org/docs/app/getting-started/css).

## Put the agreement in a Client Component

```tsx
// app/agreement-field.tsx
"use client";

import { AgreeFirst } from "agree-first";

const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];

export function AgreementField() {
  return (
    <AgreeFirst
      documents={documents}
      storageKey="my_app_agreement"
      onAccept={(payload) => {
        if (payload) console.log("Accepted:", payload);
      }}
    />
  );
}
```

This is the **simple flow**: the checkbox links to your documents and accepts immediately, with no modal or mandatory scroll. `console.log` is only for trying the example; replace it with your application's persistence when needed. `storageKey` saves a browser-local record, not a durable, authenticated or cross-device one.

The package entry point already includes `"use client"`. The wrapper is still useful here because `onAccept` is an event callback: functions should be defined inside the client boundary rather than passed from a Server Component. [Next.js requires props crossing that boundary to be serializable](https://nextjs.org/docs/app/api-reference/directives/use-client).

## Render it from a Server Component

```tsx
// app/page.tsx
import { AgreementField } from "./agreement-field";

export default function Page() {
  return (
    <main>
      <h1>Create an account</h1>
      <AgreementField />
    </main>
  );
}
```

The page can stay a Server Component. A Client Component can still be pre-rendered to HTML and hydrated in the browser; you do not need to disable SSR for this example.

## Use a server record when it matters

For an authenticated or cross-device flow, load the user's last acceptance on the server and pass its serializable `AcceptPayload` to `AgreementField` as `previousPayload`. In the client component, pass that value to `AgreeFirst` and replace the example's `console.log` with a request to an endpoint owned by your application. `previousPayload` takes precedence over `storageKey`, so remove `storageKey` if your backend is the source of truth. The library does not create an API route, send requests, or wait for a server write before updating its UI. Validate and associate records with the correct user on your server. See [Versioning & re-acceptance](/docs/versioning/) for the URL/version matching contract.

## Hydration and optional review

When you use `storageKey`, browser storage is read **after hydration**. The server and first client render therefore start from the same markup; a matching stored record may update the checkbox shortly afterward. Do not read `localStorage` while rendering your own Server Component or disable SSR merely to avoid that update. The library has SSR and hydration smoke tests, but a full Next.js application is not yet part of its automated test matrix.

For the review modal, give **every** document a `content` React node inside the client boundary. The same component can then use `requireScroll` and `minReadTimeMs`; see [Optional review](/docs/review/). The package does not fetch content from each document URL.

If document versions, URLs, the previous record, or the storage key change after mount, remount `AgreeFirst` with a new React `key` derived from those inputs. In controlled mode, also reset the parent's `value` to `false` when re-acceptance is needed.

Using the Pages Router instead? Put the optional global stylesheet in `pages/_app.tsx`, then render the component in a page as you would in a regular React app. [Next.js documents that CSS placement for the Pages Router](https://nextjs.org/docs/pages/getting-started/css).
