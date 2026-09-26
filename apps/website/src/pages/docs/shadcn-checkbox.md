---
layout: ../../layouts/DocsLayout.astro
title: shadcn/ui Checkbox
description: Use the shadcn/ui Base UI Checkbox as a custom agree-first control without changing the agreement flow or adding a package dependency.
---

# shadcn/ui Checkbox

Use the [shadcn/ui Checkbox built on Base UI](https://ui.shadcn.com/docs/components/base/checkbox) for the visible control while `agree-first` manages document versions, re-acceptance, and the acceptance payload. This is an **application-level example**: shadcn/ui is not a dependency of `agree-first`.

## Add the checkbox to your app

Start with an existing React app that has [shadcn/ui configured](https://ui.shadcn.com/docs/installation) with the **Base UI** variant. Add its Checkbox using the shadcn CLI, then install `agree-first` if needed:

```bash
npx shadcn@latest add checkbox
```

```bash
npm install agree-first
```

The generated import path below assumes your app uses shadcn's default `@/components/ui` alias. Adjust it if your project uses a different alias. You do not need `agree-first/styles` for this simple, fully custom control.

## Render the simple agreement

```tsx
"use client";

import { AgreeFirst } from "agree-first";
import { Checkbox } from "@/components/ui/checkbox";

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
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <label className="flex items-center gap-3 text-sm font-medium">
            <Checkbox
              checked={isAccepted}
              onCheckedChange={(checked) => {
                if (checked === true && !isAccepted) submit();
              }}
            />
            <span>I agree to the documents below</span>
          </label>
          <p className="mt-2 pl-7 text-sm text-muted-foreground">
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

The enclosing label gives the Checkbox an accessible name; the document links remain separate so following one does not check the box. Base UI's Checkbox uses [`checked` and `onCheckedChange` for controlled state](https://ui.shadcn.com/docs/components/base/checkbox#checked-state). `submit()` records the simple agreement and calls `onAccept` when the user checks it. Once accepted, the example ignores an uncheck attempt because `agree-first` does not provide a revocation workflow.

Create the `/terms` and `/privacy` routes, or replace those URLs with your real documents. `console.log` is only for trying the example. `storageKey` persists in this browser; for a durable record, save the payload in your application and pass it back as `previousPayload`. See [Versioning & re-acceptance](/docs/versioning/).

## What this customizes

`render` replaces the external checkbox and links, not the package's review modal. This example has no `content`, so there is no modal. If you add `content` to every document, your custom control must call `openModal()` to begin review and `submit()` after the final document is accepted. Style that modal with the optional package CSS, CSS variables, or `unstyled` plus `classNames`; see [Styling & headless UI](/docs/styling/) and [Optional review](/docs/review/).

If this agreement is part of a larger form, keep form validation and submission in your app. The [TanStack Form](/docs/tanstack-form/) and [React Hook Form](/docs/react-hook-form/) guides explain how to send the acceptance payload alongside form data.

Using HeroUI instead? See the separate [HeroUI Checkbox example](/docs/heroui-checkbox/).
