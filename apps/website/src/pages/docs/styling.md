---
layout: ../../layouts/DocsLayout.astro
title: Styling & headless UI
description: Use agree-first's optional CSS, theme variables, class names, or render prop with your own design system.
---

# Styling & headless UI

The package includes a default look, but its CSS is optional. You can theme it, replace its classes, or render your own external controls.

## Use the default stylesheet

```tsx
import { AgreeFirst } from "agree-first";
import "agree-first/styles";
```

The default modal supports light and dark system themes. Theme colors, spacing, width, typography, text alignment, and scrollbar appearance use CSS custom properties:

```css
:root {
  --af-accent: #5749e9;
  --af-accent-foreground: #fff;
  --af-modal-width: min(100%, 56rem);
  --af-content-text-align: start;
  --af-scrollbar-thumb: #a9a2df;
}
```

The modal is rendered in a portal under `document.body`. Put theme variables on `:root`, `html`, `body`, or another selector that also contains the portal. See the [full CSS variable list in the README](https://github.com/felipecepluki/agree-first#css-custom-properties).

## Supply your own classes

Omit `agree-first/styles` and pass `unstyled` with `classNames` to style the package's controls and modal using your own CSS, Tailwind classes, or design system.

```tsx
<AgreeFirst
  documents={reviewDocuments}
  unstyled
  classNames={{
    container: "my-field",
    checkboxWrapper: "my-checkbox-row",
    modal: "my-dialog",
    tabs: "my-tabs",
    tab: "my-tab",
    modalScrollArea: "my-scroll-area",
    modalFooter: "my-dialog-footer",
    acceptButton: "my-accept-button",
  }}
>
  Continue
</AgreeFirst>
```

In `unstyled` mode, the package does not supply its default layout classes. Style the pieces you use; behavior and accessible markup still come from the component. The [local playground's custom-styling page](https://github.com/felipecepluki/agree-first/tree/main/apps/playground) is a working example without the package stylesheet.

## Render your own external UI

The `render` prop lets you use your own checkbox and links. For link-only documents, call `submit()` when the checkbox is checked:

```tsx
<AgreeFirst
  documents={documents}
  onAccept={(payload) => payload && saveAgreement(payload)}
  render={({ isAccepted, submit }) => (
    <label>
      <input
        type="checkbox"
        checked={isAccepted}
        onChange={(event) => {
          if (event.target.checked && !isAccepted) submit();
        }}
      />
      I agree to the <a href="/terms">Terms of Service</a>
    </label>
  )}
/>
```

For review documents, `render` also provides `openModal()` and `canSubmit`. The package still renders its review modal; `render` replaces the external controls, not the modal's internal structure. A full modal restyle uses `unstyled` and `classNames` too.

Text can be changed with `label`, `children`, `documents[].title`/`content`, and `strings`. See [API reference](/docs/api/) for the exact overrides.
