---
layout: ../../layouts/DocsLayout.astro
title: RedwoodSDK
description: Use agree-first in a RedwoodSDK app with a small React client component, optional CSS, and versioned agreement records.
---

# RedwoodSDK

RedwoodSDK renders React Server Components by default. Keep your page and data loading on the server, and put the interactive agreement in a small client component. No `agree-first` adapter or Cloudflare service is required by the package. This guide follows the [RedwoodSDK quick start](https://docs.rwsdk.com/getting-started/quick-start) and its [React Server Components guidance](https://docs.rwsdk.com/core/react-server-components).

## Install and choose styling

In an existing RedwoodSDK app, install the package:

```bash
npm install agree-first
```

For a new app, follow the [official starter](https://docs.rwsdk.com/getting-started/quick-start) first. If you want the included default UI, add the package stylesheet to your app's global CSS:

```css
/* src/app/styles.css */
@import "agree-first/styles";
```

Keep that stylesheet linked from your existing `Document`. RedwoodSDK's [styling guide](https://docs.rwsdk.com/guides/frontend/tailwind/) shows the `styles.css?url` import and `<link rel="stylesheet">` in `Document.tsx`. If you prefer your own design system, skip the import and use `unstyled`, `classNames`, or `render` instead. See [Styling & headless UI](/docs/styling/).

## Put the agreement in a client component

```tsx
// src/app/components/AgreementField.tsx
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

The wrapper makes the client boundary explicit and keeps the callback on the client. The package entry point also has a `"use client"` directive. These documents omit `content`, so this is the **simple agreement flow**: the checkbox accepts immediately, without a modal or scroll requirement. `console.log` is only for trying the example; `storageKey` saves a browser-local record, not an authenticated or cross-device one.

## Render it from a server page

```tsx
// src/app/pages/SignupPage.tsx
import { AgreementField } from "../components/AgreementField";

export function SignupPage() {
  return (
    <main>
      <h1>Create an account</h1>
      <AgreementField />
    </main>
  );
}
```

Add `SignupPage` to your existing `render(Document, [...])` route group in `src/worker.tsx`:

```tsx
// src/worker.tsx — inside the existing render(Document, [...]) group
route("/signup", SignupPage),
```

Import `SignupPage` in that file. Also create routes for `/terms` and `/privacy`, or replace those URLs with your real documents. The URL is a link and matching identity; `agree-first` does not fetch the document. RedwoodSDK's [routing guide](https://docs.rwsdk.com/core/routing/) explains the `render` and `route` setup.

## Persist beyond one browser

For signed-in users, load their last `AcceptPayload` on the server and pass it as `previousPayload` to the client component. Replace the example's `console.log` with an app-owned [server function or action](https://docs.rwsdk.com/core/react-server-components#server-functions) that saves the new payload. Define the callback **inside** the client component; do not pass a regular server-side function through the React Server Component boundary. If your server is the source of truth, omit `storageKey`: `previousPayload` takes precedence over it.

Authenticate the user and validate current document versions on the server. `agree-first` does not provide a database, wait for an asynchronous save before updating its UI, or establish legal validity. Your app should handle failed saves and decide when the user may continue.

## SSR, re-acceptance, and optional review

With `storageKey`, browser storage is read after hydration. The server HTML and first client render match, then a previously saved acceptance can update the checkbox. The library has SSR and hydration smoke tests, but a full RedwoodSDK app is not yet in its automated test matrix.

If a document version changes, the old record no longer matches. If URLs, versions, `previousPayload`, or `storageKey` change **while `AgreeFirst` remains mounted**, remount it with a new React `key` derived from those inputs. In controlled mode, also reset the parent's `value` to `false`. See [Versioning & re-acceptance](/docs/versioning/).

For an optional review modal, provide `content` for **every** document inside the client component. You can then enable `requireScroll` or `minReadTimeMs`; see [Optional review](/docs/review/). The package does not fetch or parse remote documents.
