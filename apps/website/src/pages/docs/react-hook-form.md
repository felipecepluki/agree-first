---
layout: ../../layouts/DocsLayout.astro
title: React Hook Form
description: Use agree-first as a controlled React Hook Form field and submit its versioned acceptance payload with your form.
---

# React Hook Form

`AgreeFirst` can be a controlled field in [React Hook Form](https://react-hook-form.com/). React Hook Form validates and submits the form; `agree-first` manages the agreement interaction and produces an `AcceptPayload` with the document versions and a timestamp. This uses [`Controller`](https://react-hook-form.com/docs/usecontroller/controller), not a special adapter or a dependency added to `agree-first`.

## Install the packages

In your React app, install both packages if needed:

```bash
npm install agree-first react-hook-form
```

Import `agree-first/styles` separately if you want the default UI. You can also omit it and use the package's unstyled or custom-render options.

## Connect a controlled field

This example uses link-only documents. Checking the box accepts the current versions immediately; the acceptance payload is held until the surrounding registration form is submitted.

```tsx
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { AgreeFirst, type AcceptPayload } from "agree-first";

type SignupValues = { email: string; terms: boolean };

const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];

export function SignupForm() {
  const acceptance = useRef<AcceptPayload | null>(null);
  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    defaultValues: { email: "", terms: false },
  });

  const onSubmit = async (values: SignupValues) => {
    if (!values.terms || !acceptance.current) return;

    // Replace this with your own API request.
    console.log({ email: values.email, agreement: acceptance.current });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="signup-email">Email</label>
      <input
        id="signup-email"
        type="email"
        {...register("email", { required: "Enter your email" })}
      />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <Controller
        name="terms"
        control={control}
        rules={{ validate: (accepted) => accepted || "Accept the documents to continue" }}
        render={({ field, fieldState }) => (
          <>
            <AgreeFirst
              ref={field.ref}
              name={field.name}
              documents={documents}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              onAccept={(payload) => {
                acceptance.current = payload ?? null;
              }}
            />
            {fieldState.error && <p role="alert">{fieldState.error.message}</p>}
          </>
        )}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Create account"}
      </button>
    </form>
  );
}
```

Create `/terms` and `/privacy` pages or use your existing document URLs. The URLs are links and matching identities; the package does not fetch document contents. `Controller` gives `AgreeFirst` the current boolean value and handlers. Its `ref` is forwarded to the package's hidden input when `name` is supplied, which React Hook Form can use for focus management. You do **not** need to call `register("terms")` as well: `Controller` already registers that field.

## Save a record, not just a boolean

In the simple flow, checking the box calls `onChange(true)` and `onAccept(payload)` before form submission. The `terms` boolean alone does not carry the accepted versions or timestamp, so the example holds the payload in a ref and submits it with the other form values. It deliberately omits `storageKey`: local storage would be written as soon as acceptance occurs, even if registration later fails. React Hook Form's [`handleSubmit`](https://react-hook-form.com/docs/useform/handlesubmit) runs validation before calling your submit handler.

Replace `console.log` with your application's request. The server should authenticate the user and validate the current document versions before storing the record. If that request fails, the agreement remains accepted; show the error and let the person retry. The payload is not proof of reading or automatic legal compliance.

## Returning users, reset, and review

For a returning user, pass the last record as `previousPayload`. If every current document URL and version matches, initialize both `defaultValues.terms` **and** the acceptance ref from that matching record. Do not set the controlled field to `true` simply because any old payload exists: controlled `value` overrides the package's matching state, and `onAccept` does not run again when a previous record is restored. When documents or the previous record change while mounted, reset the field and remount `AgreeFirst` with a new `key`. See [Versioning & re-acceptance](/docs/versioning/).

If you call React Hook Form's `reset()` to start a new form, clear the acceptance ref too. Resetting the form is not a revocation workflow and does not delete a stored record. React Hook Form [requires `defaultValues` for controlled fields to reset correctly](https://react-hook-form.com/docs/useform/reset).

This snippet is for the simple flow. For an optional review modal, provide `content` for every document and add a deliberate **Continue** action. Completing the final document changes the boolean field, but `onAccept` fires only when the component's optional action button or `render().submit()` is used. Without that extra action, the example's payload ref remains empty. Inside a form, prefer a custom `render` control with `type="button"` for that action so it does not submit the surrounding form prematurely. See [Optional review](/docs/review/).
