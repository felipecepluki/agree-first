---
layout: ../../layouts/DocsLayout.astro
title: TanStack Start
description: Use agree-first in a TanStack Start React route with versioned agreements, optional styles, and app-owned persistence.
---

# TanStack Start

`agree-first` works in a TanStack Start **React** route without an adapter. Start handles routing and server rendering; the package handles the agreement UI and matching document versions. This guide follows [Start's file-based routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing).

## Create an app and install

For a new app, use the [official TanStack CLI](https://tanstack.com/start/latest/docs/framework/react/getting-started) and select the React variant. In an existing Start app, just install the package:

```bash
npm install agree-first
```

To use the included default UI, import its optional stylesheet in the root route so every page can use it:

```tsx
// src/routes/__root.tsx — add to your existing root route
import "agree-first/styles";
```

Start supports [side-effect CSS imports in routes](https://tanstack.com/start/latest/docs/framework/react/guide/css-styling). If you want your own design system instead, omit that import and use `unstyled`, `classNames`, or `render`. See [Styling & headless UI](/docs/styling/).

## Add a simple agreement route

```tsx
// src/routes/signup.tsx
import { createFileRoute } from "@tanstack/react-router";
import { AgreeFirst } from "agree-first";

const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];

export const Route = createFileRoute("/signup")({
  component: Signup,
});

function Signup() {
  return (
    <main>
      <h1>Create an account</h1>
      <AgreeFirst
        documents={documents}
        storageKey="my_app_agreement"
        onAccept={(payload) => {
          if (payload) console.log("Accepted:", payload);
        }}
      />
    </main>
  );
}
```

Create routes for `/terms` and `/privacy`, or replace those URLs with your existing document URLs. They are links and matching identities; `agree-first` does not fetch their content. With no `content`, this is the **simple flow**: the checkbox records acceptance immediately, without a modal or scroll requirement. `console.log` is only for inspecting the example. `storageKey` saves a browser-local record, not an authenticated or cross-device one.

## Keep durable records in your app

For signed-in users, load the last `AcceptPayload` through your Start app and pass it as `previousPayload`. Send new payloads from `onAccept` to an app-owned [server function](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions) or endpoint. `previousPayload` takes precedence over `storageKey`, so omit the local key when your server is the source of truth. Authenticate the user and validate current document versions server-side. The library does not create server functions, wait for a save to complete, or establish legal validity.

Acceptance updates the component's UI when the user acts. Your app should decide how to handle failed saves and when to let the user continue.

## SSR, re-acceptance, and optional review

When using `storageKey`, the browser record is read after hydration: server HTML and the first client render match, then the checkbox can update to a stored acceptance. SSR and hydration have smoke tests in this package, but a full TanStack Start app is not in its automated test matrix.

Changing a document version makes the old record no longer match. If document URLs or versions, `previousPayload`, or `storageKey` change **while the component is mounted**, remount `AgreeFirst` with a new React `key` derived from those inputs. In controlled mode, also reset the parent's `value` to `false`. See [Versioning & re-acceptance](/docs/versioning/) for the matching rules.

For an optional review modal, provide `content` for **every** document. Then you may opt into `requireScroll` and `minReadTimeMs`; see [Optional review](/docs/review/). The document URL remains a reference, not a source fetched by the package.
