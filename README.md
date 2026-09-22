# agree-first

Headless consent & terms modal for React. Tracks scroll completion across multiple documents and generates a timestamped consent payload on acceptance. Works standalone or inside any form library.

```bash
npm install agree-first
```

**React 18+ and 19+ supported. Next.js App Router compatible.**

---

## How it works

`agree-first` ships **two things**:

1. **A modal** — renders via `createPortal` into `document.body`. No extra library required. Has its own markup, scroll tracking, progress bar, tab navigation (multi-document), focus trap, and keyboard handling.
2. **A checkbox + submit button** — a minimal default UI, entirely optional.

You import the CSS if you want the built-in style. If you prefer your own UI (shadcn, HeroUI, Tailwind, etc.) you skip the CSS and use the `render` prop — `agree-first` then only manages state and renders the modal.

```
                     ┌─────────────────────────────────┐
      agree-first    │  State (hook)                   │
                     │  ├─ scroll tracking             │
                     │  ├─ tab progress                │
                     │  ├─ consent payload             │
                     │  └─ localStorage persistence    │
                     │                                 │
                     │  Modal (portal → document.body) │
                     │  ├─ focus trap                  │
                     │  ├─ Escape key                  │
                     │  ├─ progress bar                │
                     │  └─ multi-document tabs         │
                     └─────────────────────────────────┘
```

---

## Quick start

Import the default CSS (skip if using `unstyled` or `render` prop):

```tsx
import "agree-first/styles";
```

Default UI — no other library needed:

```tsx
import { AgreeFirst } from "agree-first";

const DOCS = [
  {
    title: "Terms of Service",
    content: <div>…</div>,
    url: "/terms",
    type: "terms",
    version: "2.1.0",
  },
  {
    title: "Privacy Policy",
    content: <div>…</div>,
    url: "/privacy",
    type: "privacy",
    version: "1.4.0",
  },
];

export function SignupForm() {
  return (
    <AgreeFirst
      documents={DOCS}
      onAccept={(payload) => payload && saveConsent(payload)}
    >
      Create account
    </AgreeFirst>
  );
}
```

---

## Headless / render prop

Use any checkbox and button from your preferred UI library. `agree-first` only manages state and renders the modal:

```tsx
import { AgreeFirst } from "agree-first";
import { Checkbox, Button } from "your-ui-library";

<AgreeFirst
  documents={DOCS}
  onAccept={(payload) => payload && saveConsent(payload)}
  render={({ isAccepted, openModal, canSubmit, submit }) => (
    <div>
      <Checkbox
        checked={isAccepted}
        onChange={(checked) => { if (checked && !isAccepted) openModal(); }}
        label="I have read and agree to the Terms of Service and Privacy Policy"
      />
      <Button disabled={!canSubmit} onClick={submit}>
        Create account
      </Button>
    </div>
  )}
/>
```

---

## Form library integration

`agree-first` works as a controlled field in React Hook Form, Formik, TanStack Form, and react-final-form via `value` / `onChange` / `onBlur` / `name` props.

### React Hook Form

```tsx
import { useForm, Controller } from "react-hook-form";

const { control, handleSubmit } = useForm({ defaultValues: { terms: false } });

<Controller
  name="terms"
  control={control}
  rules={{ validate: (v) => v || "You must accept the terms to continue" }}
  render={({ field: { value, onChange, onBlur, name, ref } }) => (
    <AgreeFirst
      ref={ref}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      documents={DOCS}
    />
  )}
/>
```

### Formik

```tsx
import { useField } from "formik";

function ConsentField({ name }: { name: string }) {
  const [field, , helpers] = useField<boolean>(name);
  return (
    <AgreeFirst
      name={name}
      value={field.value}
      onChange={(accepted) => helpers.setValue(accepted)}
      onBlur={() => helpers.setTouched(true)}
      documents={DOCS}
    />
  );
}
```

### TanStack Form

```tsx
<form.Field
  name="terms"
  validators={{ onChange: ({ value }) => !value ? "Required" : undefined }}
>
  {(field) => (
    <AgreeFirst
      name={field.name}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      documents={DOCS}
    />
  )}
</form.Field>
```

### react-final-form

```tsx
import { Field } from "react-final-form";

<Field name="terms" type="checkbox">
  {({ input }) => (
    <AgreeFirst
      name={input.name}
      value={!!input.checked}
      onChange={(accepted) => input.onChange(accepted)}
      onBlur={input.onBlur}
      documents={DOCS}
    />
  )}
</Field>
```

When `value` changes from `true` to `false` (e.g. `form.reset()`), `agree-first` automatically resets internal modal progress — the user will need to read and accept again.

---

## Returning users — version detection

Pass the user's last accepted payload and `agree-first` auto-accepts if nothing changed, or sets `needsReAcceptance = true` if a document version was updated:

```tsx
const savedPayload = await db.getLastConsent(userId);

<AgreeFirst
  documents={DOCS}
  previousPayload={savedPayload}
  render={({ needsReAcceptance, isAccepted, openModal, submit, canSubmit }) => (
    <>
      {needsReAcceptance && (
        <p>Our Terms have been updated. Please review and accept again.</p>
      )}
      <Checkbox checked={isAccepted} onChange={() => openModal()} />
      <Button disabled={!canSubmit} onClick={submit}>Continue</Button>
    </>
  )}
/>
```

### Auto-persist with `storageKey`

Skip the manual `previousPayload` management — `storageKey` reads and writes to `localStorage` automatically:

```tsx
<AgreeFirst
  documents={DOCS}
  storageKey="my_app_consent_v1"
  onAccept={(payload) => payload && saveToServer(payload)}
>
  Continue
</AgreeFirst>
```

On next visit, if document versions match, the user is auto-accepted. If a version changed, `needsReAcceptance` is `true` and the flow restarts.

---

## i18n / strings

Override all UI text in one object instead of passing individual string props:

```tsx
<AgreeFirst
  documents={DOCS}
  strings={{
    acceptText:   "Eu Aceito",
    continueText: "Aceitar e Continuar →",
    scrollHint:   "↓ Role até o final para continuar",
    readFullText: "Ler documento completo",
    modalTitle:   "Termos e Privacidade",
    closeText:    "Fechar",
  }}
>
  Criar conta
</AgreeFirst>
```

Individual props (`acceptText`, `scrollHint`, etc.) still work — `strings` takes precedence when both are provided.

---

## Minimum read time

Require the user to spend at least N milliseconds on a document before the accept button unlocks (in addition to, or instead of, scroll enforcement):

```tsx
const DOCS = [
  {
    title: "Terms of Service",
    content: <div>…</div>,
    url: "/terms",
    minReadTimeMs: 15_000, // 15 seconds
  },
];

<AgreeFirst documents={DOCS} requireScroll={false}>
  Continue
</AgreeFirst>
```

---

## Props — `AgreeFirst`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `documents` | `AgreeFirstDocument[]` | — | **Required.** One or more documents to present. |
| `children` | `ReactNode` | — | Submit button label (default UI). Omit to hide the button. |
| `onAccept` | `(payload?: AcceptPayload) => void` | — | Called on submit. Receives the full consent payload. |
| `onOpen` | `() => void` | — | Called when the modal opens. Use for analytics. |
| `render` | `(props: RenderProps) => ReactNode` | — | Headless mode — bring your own checkbox and button. |
| `consentId` | `string` | auto-generated | Custom ID stored in the payload. |
| `label` | `ReactNode` | auto-generated | Custom checkbox label text (default UI). |
| `requireScroll` | `boolean` | `true` | Lock the accept button until the user scrolls to the bottom. |
| `requireCheckbox` | `boolean` | `true` | Show the checkbox and lock submit until it is checked. |
| `modalTitle` | `string` | document title | Modal heading. |
| `acceptText` | `string` | `"I Accept"` | Accept button label on the last tab. |
| `continueText` | `string` | `"Accept & Continue →"` | Accept button label between tabs. |
| `scrollHint` | `string` | `"↓ Scroll to the bottom to continue"` | Hint shown before scroll completes. |
| `readFullText` | `string` | `"Read full document"` | Footer link label. |
| `strings` | `AgreeFirstStrings` | — | Override all text labels at once (i18n). Takes precedence over individual string props. |
| `previousPayload` | `AcceptPayload` | — | Last accepted payload. Enables version detection and auto-accept. |
| `storageKey` | `string` | — | localStorage key for automatic persistence. |
| `closeOnOverlayClick` | `boolean` | `true` | Set to `false` to prevent closing by clicking the backdrop. |
| `onDecline` | `() => void` | — | Called when the modal is closed without full acceptance. |
| `onScrollProgress` | `(progress: number) => void` | — | Fires as documents are scrolled. `progress` is `0–1` across all docs. |
| `value` | `boolean` | — | Controlled accepted state (form library integration). |
| `onChange` | `(accepted: boolean) => void` | — | Fires `true` on accept, `false` on reset. |
| `onBlur` | `() => void` | — | Fires when the modal closes (any reason). Marks field as touched. |
| `name` | `string` | — | Field name forwarded to a hidden input (native forms + RHF focus). |
| `unstyled` | `boolean` | `false` | Remove all default classes. Apply your own via `classNames`. |
| `className` | `string` | — | Extra class on the outer container (default UI). |
| `classNames` | `AgreeFirstClassNames` | — | Override individual element classes. |

---

## `AgreeFirstDocument`

```ts
interface AgreeFirstDocument {
  title: string;
  content: ReactNode;
  url: string;
  version?: string;                                    // used for version detection
  type?: "terms" | "privacy" | "policy" | "custom";
  minReadTimeMs?: number;                              // minimum time on this tab (ms)
}
```

---

## `RenderProps`

Passed to the `render` function:

```ts
interface RenderProps {
  isAccepted: boolean;        // true after all documents accepted in the modal
  isModalOpen: boolean;       // true while the modal is visible
  openModal: () => void;      // open the modal
  closeModal: () => void;     // close the modal without accepting (fires onDecline if not yet accepted)
  canSubmit: boolean;         // true when isAccepted — safe to enable your submit button
  submit: () => void;         // call on form submit — triggers onAccept
  reset: () => void;          // reset all state (use for "re-read" flows)
  scrollProgress: number;     // 0–1, fraction of documents fully scrolled
  needsReAcceptance: boolean; // true when previousPayload/storageKey version is outdated
  getPayload: () => AcceptPayload | null; // read the payload without calling onAccept
}
```

---

## Consent payload — `AcceptPayload`

Returned by `onAccept` and `getPayload()`:

```ts
interface AcceptPayload {
  id: string;                // consentId or auto-generated "c_<timestamp>_<random>"
  timestamp: string;         // ISO 8601
  documents: Array<{
    title: string;
    url: string;
    version?: string;
    type?: string;
  }>;
  scrollCompleted: number[]; // indexes of documents scrolled to the bottom
  userAgent?: string;
}
```

Store this server-side if it is useful to your product's consent records. The payload records interactions in this UI; it does not by itself prove that someone read a document or establish legal compliance.

---

## `useScrollCompletion` hook

Tracks whether a scrollable element has been scrolled to the bottom. Useful standalone — attach the returned `containerRef` to any scrollable `div`:

```tsx
import { useScrollCompletion } from "agree-first";

function LegalText() {
  const { hasScrolled, progress, containerRef } = useScrollCompletion();

  return (
    <>
      <div ref={containerRef} style={{ height: 300, overflowY: "auto" }}>
        {/* long content */}
      </div>
      <button disabled={!hasScrolled}>Continue</button>
    </>
  );
}
```

| Return | Type | Description |
|--------|------|-------------|
| `hasScrolled` | `boolean` | `true` once the user scrolls within 10 px of the bottom |
| `progress` | `number` | `0–1` scroll fraction |
| `containerRef` | `RefObject<HTMLDivElement>` | Attach to the scrollable element |

---

## `useAgreeFirst` hook

Use the underlying hook directly for full control:

```tsx
import { useAgreeFirst } from "agree-first";

const {
  isModalOpen, openModal, closeModal,
  isAccepted, canSubmit, submit, reset,
  getPayload,
  activeTab, setActiveTab,
  scrollCompleted, markScrollCompleted,
  acceptTab, canAcceptCurrentTab,
  scrollProgress, needsReAcceptance,
} = useAgreeFirst({
  documents: DOCS,
  requireScroll: true,
  onAccept: (payload) => saveConsent(payload),
  storageKey: "consent_v1",
  onDecline: () => analytics.track("terms_dismissed"),
});
```

---

## Customization

### CSS custom properties

Override the theme without touching `classNames`:

```css
:root {
  /* Colors */
  --af-accent:          #6366f1;   /* primary color (buttons, links, progress) */
  --af-accent-hover:    #4f46e5;
  --af-success:         #10b981;   /* "accepted" badge and tab check */
  --af-bg:              #ffffff;   /* modal background */
  --af-bg-subtle:       #f3f4f6;   /* progress bar track */
  --af-bg-hover:        #f3f4f6;   /* hover states */
  --af-text:            #111827;   /* headings */
  --af-text-muted:      #374151;   /* body text */
  --af-text-faint:      #9ca3af;   /* hints, inactive tabs */
  --af-text-icon:       #6b7280;   /* close button icon */
  --af-border:          #f3f4f6;
  --af-shadow:          rgba(0, 0, 0, 0.20);
  --af-overlay-bg:      rgba(0, 0, 0, 0.50);

  /* Typography */
  --af-font-family:     system-ui, -apple-system, sans-serif;
  --af-font-size:       14px;

  /* Modal sizing */
  --af-modal-max-width: 720px;     /* increase for wider layouts, e.g. 960px */
  --af-modal-max-height: 90dvh;
  --af-radius:          16px;      /* border-radius of the modal card */
}
```

Dark mode is handled automatically via `prefers-color-scheme: dark`. To override the dark tokens in an app that uses class-based theming, re-declare the variables under your dark selector:

```css
.dark {
  --af-accent:      #818cf8;
  --af-success:     #34d399;
  --af-bg:          #1f2937;
  --af-bg-subtle:   #111827;
  --af-bg-hover:    #374151;
  --af-text:        #f9fafb;
  --af-text-muted:  #d1d5db;
  --af-text-faint:  #6b7280;
  --af-text-icon:   #9ca3af;
  --af-border:      #374151;
  /* … */
}
```

### `classNames` — per-element class overrides

```tsx
<AgreeFirst
  classNames={{
    overlay: "",        modal: "",         modalHeader: "",
    modalTitle: "",     modalClose: "",    modalScrollArea: "",
    modalFooter: "",    modalAcceptRow: "", tabs: "",
    tab: "",            tabActive: "",     tabDone: "",
    progressBar: "",    progressFill: "",  acceptButton: "",
    acceptBadge: "",    docLink: "",       scrollHint: "",
    container: "",      checkboxWrapper: "", checkbox: "",
    label: "",          labelLink: "",     button: "",
  }}
/>
```

### Fully unstyled

```tsx
import { AgreeFirst } from "agree-first";
// no CSS import

<AgreeFirst unstyled classNames={{ modal: "my-modal", … }}>
  Continue
</AgreeFirst>
```

---

## Accessibility

- Focus trapped inside the modal while open
- `Escape` closes the modal and returns focus to the trigger element
- Tab order cycles within the modal
- Multi-document tabs use `role="tablist"` / `role="tab"` / `role="tabpanel"`
- Progress bar uses `role="progressbar"` with `aria-valuenow`
- Live region announces tab changes to screen readers
- All interactive elements have `:focus-visible` outlines
- Keyboard scroll when the document area is focused: `Space` / `PageDown` scroll down, `PageUp` scrolls up, `ArrowDown` / `ArrowUp` scroll by line, `End` jumps to bottom, `Home` jumps to top

---

## Compliance notice

`agree-first` helps implement a consent flow and records its UI state. It is not legal advice and does not guarantee compliance with LGPD, GDPR, or any other regulation. Consult qualified counsel for your product's legal requirements.

---

## License

MIT © Felipe Cepluki
