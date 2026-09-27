<div align="center">

# agree-first

**Terms change. Your agreement flow should know.**

A small React library for versioned agreements—from a simple checkbox to an optional document review.

[Documentation](https://github.com/felipecepluki/agree-first/tree/main/apps/website/src/pages/docs) · [Playground](https://github.com/felipecepluki/agree-first/tree/main/apps/playground) · [npm](https://www.npmjs.com/package/agree-first)

React 18 & 19 · TypeScript · Zero runtime dependencies · Optional CSS

</div>

## Why agree-first?

A checkbox takes minutes. Remembering **which documents and versions** someone accepted—and knowing when to ask again—takes more. `agree-first` keeps that logic together without choosing your backend, form library, or design system.

- **Versioned records.** Capture document metadata and a timestamp when someone accepts.
- **Re-acceptance.** A new document or changed URL/version requires a new acceptance.
- **Two levels of UI.** Start with a checkbox and links; add a review modal only when useful.
- **Your presentation.** Use the optional stylesheet, customize its classes, or bring your own controls.

The library does not fetch documents, verify that they were read, or provide legal compliance.

## Install

```bash
npm install agree-first
```

`pnpm add agree-first`, `yarn add agree-first`, and `bun add agree-first` work too.

## Quick start

```tsx
import { AgreeFirst, type AcceptPayload } from "agree-first";
import "agree-first/styles"; // optional

const documents = [
  { title: "Terms of Service", url: "/terms", version: "1.4" },
  { title: "Privacy Policy", url: "/privacy", version: "2.0" },
];

export function AgreementField({
  saveAgreement,
}: {
  saveAgreement: (record: AcceptPayload) => void;
}) {
  return (
    <AgreeFirst
      documents={documents}
      onAccept={(record) => {
        if (record) saveAgreement(record);
      }}
    />
  );
}
```

No modal is required here. With link-only documents, checking the box creates an acceptance payload and calls `onAccept`. Save that record in your application if it must survive browsers or devices.

## When a document changes

```text
Accepted:  Terms v1.3
Current:   Terms v1.4
Outcome:   Ask for acceptance again
```

Provide the last record through `previousPayload`, or use `storageKey` for browser-local persistence. Matching uses each document's URL and declared version, not its text. URLs must be unique within a flow. Without a version, changes at the same URL cannot trigger re-acceptance automatically; removing a document does not require re-acceptance.

[Read the versioning guide →](https://github.com/felipecepluki/agree-first/blob/main/apps/website/src/pages/docs/versioning.mdx)

## Review is optional

If a flow calls for explicit document review, provide `content` for **every** document. That enables the modal, where scroll completion is required by default. You can disable that requirement with `requireScroll={false}` or add `minReadTimeMs` to a document. After review, the optional action button calls `onAccept`.

The simple checkbox flow does none of this unless you opt in. Scroll completion and minimum display time record UI interaction; neither proves reading or understanding.

[Explore the review flow →](https://github.com/felipecepluki/agree-first/blob/main/apps/website/src/pages/docs/review.mdx)

## Make it yours

Import `agree-first/styles` for a default look, or leave it out. CSS variables and `classNames` customize the provided UI; `unstyled` and `render` let your app supply its own controls. For complete control of the flow, use the exported `useAgreeFirst` hook. The built-in review modal remains part of `AgreeFirst` even when you replace the external controls.

[Styling](https://github.com/felipecepluki/agree-first/blob/main/apps/website/src/pages/docs/styling.md) · [API reference](https://github.com/felipecepluki/agree-first/blob/main/apps/website/src/pages/docs/api.md) · [Accessibility](https://github.com/felipecepluki/agree-first/blob/main/apps/website/src/pages/docs/accessibility.md) · [Integrations](https://github.com/felipecepluki/agree-first/tree/main/apps/website/src/pages/docs)

The documentation site lives in this repository and does not have a public deployment URL yet. You can inspect the [package size on Bundlephobia](https://bundlephobia.com/package/agree-first) or run the [local playground](https://github.com/felipecepluki/agree-first/tree/main/apps/playground) to try both flows in a browser.

## Contributing

See [CONTRIBUTING.md](https://github.com/felipecepluki/agree-first/blob/main/CONTRIBUTING.md) for the local workflow. Report vulnerabilities through the [private security channel](https://github.com/felipecepluki/agree-first/blob/main/SECURITY.md), not a public issue.

<div align="center">

[MIT](https://github.com/felipecepluki/agree-first/blob/main/LICENSE) © Felipe Cepluki

</div>
