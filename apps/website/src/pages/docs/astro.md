---
layout: ../../layouts/DocsLayout.astro
title: Astro + React
description: Use agree-first as a hydrated React island in Astro, with optional CSS and versioned agreement records.
---

# Astro + React

Keep the rest of an Astro page static and render the agreement as one interactive React island. This is the same pattern used by [this site's live demo](https://github.com/felipecepluki/agree-first/blob/main/apps/website/src/pages/index.astro).

## Add React and agree-first

In an existing Astro project, add Astro's official React integration if it is not already configured:

```bash
npx astro add react
```

That command installs and configures `@astrojs/react`; follow its prompts. See the [Astro React integration guide](https://docs.astro.build/en/guides/integrations-guide/react/) for manual setup and TypeScript details. Then install the package:

```bash
npm install agree-first
```

React and React DOM come from the Astro app as peer dependencies. You do not need a special `agree-first` Astro integration.

## Create the React island

Put the documents and callback in a `.tsx` component:

```tsx
// src/components/AgreementField.tsx
import { AgreeFirst } from "agree-first";

const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];

export default function AgreementField() {
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

This is the **simple agreement** flow: no `content` means checkbox and document links, with immediate acceptance. Create the `/terms` and `/privacy` pages in your Astro app, or replace those URLs with your real documents. The library does not fetch their contents. `console.log` is only for inspecting the example; replace it with your own persistence when needed.

Keep `onAccept` inside the React component. Functions passed from an `.astro` file to a hydrated island cannot be serialized for the browser. [Astro documents this boundary](https://docs.astro.build/en/guides/framework-components/#passing-props-to-framework-components).

## Hydrate it in an Astro page

```astro
---
// src/pages/signup.astro
import AgreementField from "../components/AgreementField";
import "agree-first/styles"; // optional default styling
---

<html lang="en">
  <body>
    <main>
      <h1>Create an account</h1>
      <AgreementField client:load />
    </main>
  </body>
</html>
```

`client:load` renders HTML first, then loads the React code as the page loads so the checkbox becomes interactive. Without a `client:*` directive, an Astro-rendered React component stays static and cannot handle acceptance. `client:only="react"` is not needed here; `agree-first` has SSR and hydration smoke tests, though this exact Astro integration is not part of the library's automated test matrix. [Astro explains its hydration directives](https://docs.astro.build/en/guides/framework-components/#hydrating-interactive-components).

The stylesheet import is optional and can live in a shared Astro layout if several pages use the component. Omit it and use `unstyled`, `classNames`, or `render` for your own design system. See [Styling & headless UI](/docs/styling/).

## Records, versions, and review

`storageKey` reads browser storage after hydration, so a matching saved acceptance can appear shortly after the initial HTML. It is not a durable or cross-device record. For authenticated users, load a prior `AcceptPayload` from your application and pass it as a serializable `previousPayload` prop to the React island; save new payloads through your own endpoint. A static Astro build cannot embed a different prior record for every user without a client fetch or an on-demand server route. See [Versioning & re-acceptance](/docs/versioning/) for the matching rules.

For the optional review modal, provide `content` for **every** document inside the React component, not as callback or render-prop values from the `.astro` page. You can then use `requireScroll` and `minReadTimeMs`. See [Optional review](/docs/review/).

To test locally, run your Astro dev server, accept once, reload, and then change a document version and reload again. Acceptance should be required for the new version. The sample on this website uses the repository's local library build; installing from npm uses the version currently published there.
