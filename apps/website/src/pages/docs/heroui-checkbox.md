---
layout: ../../layouts/DocsLayout.astro
title: HeroUI Checkbox
description: Use the HeroUI v3 Checkbox as a custom agree-first control while keeping versioned acceptance logic in the package.
---

# HeroUI Checkbox

Use the [HeroUI v3 Checkbox](https://heroui.com/en/docs/react/components/checkbox) as the visible control while `agree-first` manages document versions, re-acceptance, and the acceptance payload. This is an **application-level example**: HeroUI is not a dependency of `agree-first`.

HeroUI v3 currently requires **React 19+ and Tailwind CSS v4**. `agree-first` itself supports React 18 and 19, but this particular example targets an app that meets HeroUI's requirements. Follow the [HeroUI quick start](https://heroui.com/en/docs/react/getting-started/quick-start) if your app is not configured yet.

## Install HeroUI in your app

In a compatible React app, install HeroUI and `agree-first`:

```bash
npm install @heroui/styles @heroui/react agree-first
```

In your main CSS file, import Tailwind first, then HeroUI's styles as their quick start specifies:

```css
@import "tailwindcss";
@import "@heroui/styles";
```

You do not need `agree-first/styles` for this simple flow, because the checkbox and its surrounding UI are rendered by your app.

## Render the simple agreement

```tsx
"use client";

import { AgreeFirst } from "agree-first";
import { Checkbox } from "@heroui/react";

const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];

export function AgreementCheckbox() {
  return (
    <AgreeFirst
      documents={documents}
      storageKey="my_app_agreement"
      onAccept={(payload) => {
        if (payload) console.log("Accepted:", payload);
      }}
      render={({ isAccepted, submit }) => (
        <div className="rounded-xl border p-4">
          <Checkbox
            isSelected={isAccepted}
            onChange={(selected) => {
              if (selected && !isAccepted) submit();
            }}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              I agree to the documents below
            </Checkbox.Content>
          </Checkbox>
          <p className="mt-2 text-sm">
            Review the <a className="underline underline-offset-4" href="/terms">Terms of Service</a>
            {" and "}
            <a className="underline underline-offset-4" href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      )}
    />
  );
}
```

`Checkbox.Content` provides the clickable label and accessible name. The links are outside that label so following a document does not check the box. HeroUI's controlled checkbox uses [`isSelected` and `onChange`](https://heroui.com/en/docs/react/components/checkbox#api-reference); `submit()` records the simple agreement and calls `onAccept` when selected. After acceptance, the example ignores an uncheck attempt because `agree-first` does not provide a revocation workflow.

Create the `/terms` and `/privacy` routes or use your actual document URLs. `console.log` is only a demonstration. `storageKey` keeps a browser-local record; if you need a durable one, save the payload in your application and pass it back as `previousPayload`. See [Versioning & re-acceptance](/docs/versioning/).

## What this customizes

The `render` prop replaces the external control, not the library's review modal. Here, the documents have no `content`, so there is no modal. For review, provide `content` for every document, call `openModal()` from your custom control, and call `submit()` after review completes. Style the modal using the package's optional stylesheet and CSS variables, or use `unstyled` with `classNames`. See [Styling & headless UI](/docs/styling/) and [Optional review](/docs/review/).

If this is part of a larger form, keep validation and form submission in your app. The [TanStack Form](/docs/tanstack-form/) and [React Hook Form](/docs/react-hook-form/) guides show how to submit the payload alongside form data. For a copy-owned component instead of a HeroUI package dependency, see the [shadcn/ui Checkbox example](/docs/shadcn-checkbox/).
