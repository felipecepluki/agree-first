---
layout: ../../layouts/DocsLayout.astro
title: TanStack Form
description: Connect agree-first to a TanStack Form field and submit the versioned acceptance payload with your form data.
---

# TanStack Form

`AgreeFirst` can act as a controlled boolean field in [TanStack Form](https://tanstack.com/form/latest). TanStack Form owns validation and submission; `agree-first` owns the agreement interaction and creates an `AcceptPayload` with document versions and a timestamp. No adapter or extra package inside `agree-first` is needed.

## Install the packages

In your React application, install both packages if they are not already present:

```bash
npm install agree-first @tanstack/react-form
```

Import `agree-first/styles` in your app only if you want the default look. The integration works with the unstyled mode too.

## Connect the agreement field

This example uses the simple flow: document links and a checkbox, without a review modal. TanStack Form controls the boolean `terms` field. The acceptance payload stays in a ref until the surrounding form is submitted, so the example does not save a record for an unfinished registration.

```tsx
import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { AgreeFirst, type AcceptPayload } from "agree-first";

const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];

export function SignupForm() {
  const acceptance = useRef<AcceptPayload | null>(null);

  const form = useForm({
    defaultValues: { email: "", terms: false },
    onSubmit: async ({ value }) => {
      if (!value.terms || !acceptance.current) return;

      // Replace this with your own API request.
      console.log({ email: value.email, agreement: acceptance.current });
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <label>
            Email
            <input
              type="email"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </label>
        )}
      </form.Field>

      <form.Field
        name="terms"
        validators={{
          onChange: ({ value }) => value ? undefined : "Accept the documents to continue",
          onSubmit: ({ value }) => value ? undefined : "Accept the documents to continue",
        }}
      >
        {(field) => (
          <>
            <AgreeFirst
              name={field.name}
              documents={documents}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              onAccept={(payload) => {
                acceptance.current = payload ?? null;
              }}
            />
            {field.state.meta.errors.length > 0 && (
              <p role="alert">{field.state.meta.errors.join(", ")}</p>
            )}
          </>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Create account"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
```

Create the `/terms` and `/privacy` pages or use URLs for your existing documents. `agree-first` uses each URL as a link and identity; it does not fetch document content. TanStack Form's [`useForm`, `form.Field`, and `form.Subscribe` APIs](https://tanstack.com/form/latest/docs/framework/react/guides/basic-concepts) provide the form state, while its [validators](https://tanstack.com/form/latest/docs/framework/react/guides/validation) block submission when `terms` is false.

## Understand acceptance versus submission

Checking the box calls `onChange(true)` and `onAccept(payload)` immediately. Submitting the form is a **separate** action. A boolean alone does not contain the accepted document versions or timestamp, so send the payload alongside your form data when you need an acceptance record. This example does not use `storageKey`: browser storage would be written at acceptance time, even if registration later fails.

The example's `console.log` is only a placeholder. Your server should authenticate the user, validate current document versions, and save the record. If the request fails, the checkbox remains accepted; your app must show the error and allow a retry. Do not treat the payload as proof that someone read the documents or as automatic legal compliance.

## Returning users and optional review

For a returning user, load their prior record and pass it as `previousPayload`. In controlled mode, make sure TanStack Form's initial `terms` value reflects whether **every current URL and version** matches that record. Do not initialize it to `true` merely because some earlier payload exists: the controlled value takes precedence over the component's internal state. If you start with `terms: true`, initialize the form's acceptance ref from that **matching** prior payload too: `onAccept` is not called again just because a record was restored. If documents or the previous record change while mounted, reset the field and remount `AgreeFirst` with a new `key`. See [Versioning & re-acceptance](/docs/versioning/).

The code above is specifically for the simple flow. To require a review modal, provide `content` for every document and add a deliberate **Continue** action: in review mode, completing the final document updates the boolean field, but `onAccept` fires only when the component's optional action button or `render().submit()` is used. Do not reuse the example unchanged, or its payload ref will still be empty at form submission. If placing the optional button inside a form, remember that a button without an explicit type can also submit the surrounding form; a custom `render` control with `type="button"` avoids that. See [Optional review](/docs/review/). Unchecking or resetting the form is not a revocation workflow, and it does not delete a previously stored record.
