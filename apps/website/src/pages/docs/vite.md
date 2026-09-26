---
layout: ../../layouts/DocsLayout.astro
title: Vite + React
description: Add agree-first to a Vite and React TypeScript app, test versioned acceptance, and try the local playground.
---

# Vite + React

`agree-first` works in a regular Vite + React app. Start with document links and a checkbox; add the review modal only if your flow needs it.

## Create an app

If you already have a Vite + React project, skip to the next section. Otherwise, use Vite's [official `react-ts` template](https://vite.dev/guide/#scaffolding-your-first-vite-project):

```bash
npm create vite@latest my-agreement-app -- --template react-ts
cd my-agreement-app
npm install
```

The current Vite release requires Node 20.19+ or 22.12+. Use the version required by your chosen Vite template if it asks for a newer one.

## Install agree-first

```bash
npm install agree-first
```

The package uses React and React DOM from your app as peer dependencies. For the included default UI, add this import to `src/main.tsx`:

```tsx
import "agree-first/styles";
```

The stylesheet is optional. Omit it and use `unstyled`, `classNames`, or `render` to apply your own design system. See [Styling & headless UI](/docs/styling/). You can remove the Vite starter's demo CSS if it interferes with your page layout.

## Add a simple agreement

Replace the starter `src/App.tsx` with:

```tsx
import { AgreeFirst } from "agree-first";

const documents = [
  { title: "Terms of Service", url: "/terms.html", version: "1.0" },
  { title: "Privacy Policy", url: "/privacy.html", version: "1.0" },
];

export default function App() {
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

Provide actual pages at the document URLs. For this example, place sample `terms.html` and `privacy.html` files in your app's `public/` directory; Vite serves them at `/terms.html` and `/privacy.html`. In a real product, use your actual document URLs and stable, unique versions. The library does **not** fetch or inspect the pages behind those links. [Vite documents how `public/` files are served](https://vite.dev/guide/assets.html#the-public-directory).

The checkbox accepts immediately because none of the documents has `content`. `console.log` is only a way to inspect the payload while testing. Replace it with your application's persistence; `storageKey` is browser-local convenience, not an authenticated or cross-device record.

## Run and test re-acceptance

```bash
npm run dev
```

Open the URL Vite prints. Check the box, inspect the payload in DevTools, and reload: the stored matching agreement should appear accepted. Change the Terms version in `src/App.tsx` from `1.0` to `1.1`, then **reload the page**. The old record no longer matches, so acceptance is required again. A full reload matters here because HMR can keep component state across source edits; document metadata is read as the initial flow state on mount. The exact matching rules are in [Versioning & re-acceptance](/docs/versioning/).

If your application changes documents or versions dynamically without a reload, remount `AgreeFirst` with a new React `key` based on that metadata. In controlled mode, reset the parent's `value` to `false` when re-acceptance is needed.

## Try the review flow locally

For a modal review, provide `content` for **every** document. You can then configure `requireScroll` and `minReadTimeMs`; see [Optional review](/docs/review/). Document URLs remain links, not automatic content sources.

This repository also contains a [Vite playground](https://github.com/felipecepluki/agree-first/tree/main/apps/playground) that runs both flows and an unstyled example without publishing to npm. To try the repository's current, possibly unreleased code, follow its README instead of installing the published package. The playground is a separate app and is not included in the npm tarball.
