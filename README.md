# agree-first

Versioned agreement flows for React. Track which terms, privacy policies, and other documents a user accepted, and request acceptance again when a document version changes. Use a link-only checkbox or an optional review modal. No runtime dependencies; CSS is optional.

```bash
npm install agree-first
```

Also works with `pnpm add agree-first`, `yarn add agree-first`, or `bun add agree-first`.

React 18 and 19 are tested in CI. SSR and hydration have smoke tests; the package entry point is marked `"use client"` for Next.js App Router. A full Next.js application integration is not part of this test matrix.

To try both flows in a browser without publishing, use the [local Vite playground](https://github.com/felipecepluki/agree-first/tree/main/apps/playground).

---

## Why agree-first?

A checkbox is easy. Keeping track of multiple document versions, returning users, re-acceptance, persistence, and a consistent acceptance record is the repetitive part. `agree-first` manages that flow while you own the documents, their versions, and your UI. It does not fetch or interpret the documents at their URLs.

---

## Quick start

The common case needs only document links. Omitting `content` uses the simple agreement flow: checking the box immediately creates an acceptance payload and calls `onAccept`. No modal or forced scrolling appears.

```tsx
import { AgreeFirst } from "agree-first";
import "agree-first/styles"; // optional default theme

const DOCS = [
  {
    title: "Terms of Service",
    url: "/terms",
    version: "2026-09-23",
  },
  {
    title: "Privacy Policy",
    url: "/privacy",
    version: "2026-09-23",
  },
];

export function AgreementField() {
  return (
    <AgreeFirst
      documents={DOCS}
      onAccept={(payload) => { if (payload) saveAgreement(payload); }}
    />
  );
}
```

The default UI is a checkbox with links to each document. `saveAgreement` is your application function; persist the payload server-side if you need a durable record. Import `"agree-first/styles"` for the default look, or omit it and use `unstyled` / `classNames` / `render` for your own styling. Acceptance is recorded when the box is checked; unchecking it is not a revocation workflow. If you also supply `children`, that optional button does not call `onAccept` again in the simple flow; use your form's submit handler for the surrounding action.

---

## Versioning and re-acceptance

Pass the last `AcceptPayload` as `previousPayload`, or use `storageKey` for convenient browser-local persistence. On mount, each current document's `url` and `version` is compared with the previous payload. When every current pair matches, the agreement starts accepted. Otherwise it needs acceptance again.

```text
Previously accepted: /terms version 1.3
Current document:   /terms version 1.4
Result:             acceptance required again
```

Adding a document or changing its URL/version requires re-acceptance. Removing one does **not**: the current set is checked against the old record, and extra old documents are ignored. Order and title changes do not matter. Each document **must have a stable, unique URL within the flow**: URL is its identity for matching, so two entries with the same URL cannot be distinguished reliably, even if their titles or versions differ. If both records omit `version`, they match indefinitely for the same URL; supply and update a version whenever document changes should trigger re-acceptance. Comparison is based on declared metadata, not on fetching or hashing URL content.

`previousPayload` takes precedence over `storageKey` when both are provided. Invalid or unavailable local storage never grants acceptance. The initial accepted state is read on mount; if your application's document URLs/versions, previous record, or `storageKey` change later, remount the component with a new `key` derived from those inputs. Changing props in place does not restart an accepted flow. In controlled mode, also reset the parent's `value` to `false` when the current documents require re-acceptance; a new `key` cannot override a `value={true}` supplied by the parent. `reset()` clears in-memory progress, not the stored or server-side record.

---

## Optional review flow

Add `content` to **every** document to use the existing modal. The modal shows documents in order; `requireScroll` defaults to `true` for this flow. Set it to `false` to remove the scroll gate. `minReadTimeMs` can add a minimum display time per document. These are interaction requirements, not proof that someone read or understood the text.

```tsx
import "agree-first/styles"; // optional default theme

const REVIEW_DOCS = [
  { title: "Terms of Service", url: "/terms", version: "2026-09-23", content: <TermsText /> },
  { title: "Privacy Policy", url: "/privacy", version: "2026-09-23", content: <PrivacyText /> },
];

<AgreeFirst
  documents={REVIEW_DOCS}
  requireScroll
  onAccept={(payload) => { if (payload) saveAgreement(payload); }}
>
  Create account
</AgreeFirst>
```

With `content`, the checkbox opens the review modal. After accepting every document, the optional button calls `onAccept`. Supplying `requireScroll={false}` skips the scroll requirement but **not** the modal. Do not mix documents with and without `content` in one flow; `minReadTimeMs` also requires `content`.

---

## Headless / custom UI

Use your own components (including Tailwind, shadcn, or Radix-based UI) with the `render` prop. For link-only documents, call `submit()` when the user checks your control; that records acceptance and calls `onAccept` without opening a modal:

```tsx
import { AgreeFirst } from "agree-first";

<AgreeFirst
  documents={DOCS}
  onAccept={(payload) => { if (payload) saveAgreement(payload); }}
  render={({ isAccepted, submit }) => (
    <label>
      <input type="checkbox" checked={isAccepted} onChange={(event) => {
        if (event.target.checked && !isAccepted) submit();
      }} />
      I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
    </label>
  )}
/>
```

For documents with `content`, `render` still supplies `openModal()` and `canSubmit`: open the review modal first, then call `submit()` on your form action. The modal structure remains provided by this package, but its stylesheet is optional and its classes can be replaced.

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

In controlled mode, the parent owns the checkbox state: update `value` promptly from `onChange`, and do asynchronous server persistence in `onAccept`. If the parent delays updating `value`, the checkbox remains unchecked until that update; repeated clicks during the delay do not emit duplicate `onAccept` calls in the simple flow. The package does not provide a loading or server-retry state. `storageKey`, when supplied, is written at acceptance time rather than after a server response.

When `value` changes from `true` to `false` (e.g. `form.reset()`), `agree-first` resets its in-memory progress and a new acceptance can be recorded. This is a form reset, **not** a revocation workflow; it does not delete a prior stored/server-side agreement record.

---

## Returning users and persistence

The `render` prop exposes `needsReAcceptance` when a supplied `previousPayload` or stored record no longer matches. A previous matching record starts accepted without calling `onAccept` again:

```tsx
const savedPayload = await db.getLastAgreement(userId);

<AgreeFirst
  documents={DOCS}
  previousPayload={savedPayload}
  onAccept={(payload) => { if (payload) saveAgreement(payload); }}
  render={({ needsReAcceptance, isAccepted, submit }) => (
    <>
      {needsReAcceptance && (
        <p>Our documents have changed. Please accept the current versions.</p>
      )}
      <label>
        <input type="checkbox" checked={isAccepted} onChange={(event) => {
          if (event.target.checked && !isAccepted) submit();
        }} />
        I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
      </label>
    </>
  )}
/>
```

### Auto-persist with `storageKey`

For a browser-local record, `storageKey` reads and writes to `localStorage` automatically:

```tsx
<AgreeFirst
  documents={DOCS}
  storageKey="my_app_agreement"
  onAccept={(payload) => payload && saveToServer(payload)}
/>
```

On the next mount, matching document versions become accepted after browser storage is read. In server-rendered apps, the checkbox initially matches server markup and then updates after hydration. Changed versions require a new acceptance. `localStorage` is optional convenience, not a secure or cross-device source of truth. Use `previousPayload` from your backend for that. The package does not make network requests or resolve remote document URLs.

---

## i18n / strings

`strings` overrides the package's built-in modal copy and accessibility labels in one object:

```tsx
<AgreeFirst
  documents={REVIEW_DOCS}
  strings={{
    acceptText:   "Eu Aceito",
    acceptedText: "Aceito",
    continueText: "Aceitar e Continuar →",
    scrollHint:   "↓ Role até o final para continuar",
    readFullText: "Ler documento completo",
    closeText:    "Fechar",
    tabsLabel:    "Documentos",
    scrollProgressLabel: "Progresso da rolagem",
    formatDocumentPosition: (current, total) => `${current} de ${total}`,
  }}
>
  Criar conta
</AgreeFirst>
```

The modal keys are `acceptText`, `acceptedText`, `continueText`, `scrollHint`, `readFullText`, `closeText`, `tabsLabel`, `scrollProgressLabel`, `formatDocumentPosition`, and `modalTitle`. The first five change visible copy; `closeText`, `tabsLabel`, and `scrollProgressLabel` change accessible labels; `formatDocumentPosition` changes the position in the heading and tab announcement. By default, the heading follows the active document. Set `modalTitle` for a fixed heading. Individual props (`acceptText`, `scrollHint`, etc.) still work — `strings` takes precedence when both are provided.

`strings` does **not** translate content supplied by the app: use `label` for the default checkbox prompt, `documents[].title` and `documents[].content` for the documents, and `children` for the optional submit button. In `render` mode, your render function owns its external UI text. The checkmark and external-link arrow are decorative symbols, not translatable words.

---

## Minimum display time

Require the document tab to stay open for at least N milliseconds before the accept button unlocks (in addition to, or instead of scroll completion). This does not establish that it was read:

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
| `documents` | `AgreeFirstDocument[]` | — | **Required.** One or more documents. Omit `content` on all for the simple flow; provide it on all for review. |
| `children` | `ReactNode` | — | Submit button label (default UI). Omit to hide the button. |
| `onAccept` | `(payload?: AcceptPayload) => void` | — | Called on direct acceptance in the simple flow, or on `submit()` after review. Receives the acceptance payload. |
| `onOpen` | `() => void` | — | Called when the review modal opens. |
| `render` | `(props: RenderProps) => ReactNode` | — | Supply your own external checkbox and controls; the optional review modal remains built in. |
| `consentId` | `string` | auto-generated | Custom ID stored in the payload. |
| `label` | `ReactNode` | auto-generated | Custom checkbox label text (default UI). |
| `requireScroll` | `boolean` | `true` | In review flow, lock acceptance until the current document is scrolled to the bottom; ignored in the simple flow. |
| `requireCheckbox` | `boolean` | `true` | Show the default checkbox; when `false`, the optional button is the action. |
| `modalTitle` | `string` | active document title (and position when multiple) | Override the modal heading with a fixed title. |
| `acceptText` | `string` | `"I Accept"` | Accept button label on the last tab. |
| `continueText` | `string` | `"Accept & Continue →"` | Accept button label between tabs. |
| `scrollHint` | `string` | `"↓ Scroll to the bottom to continue"` | Hint shown before scroll completes. |
| `readFullText` | `string` | `"Read full document"` | Footer link label. |
| `strings` | `AgreeFirstStrings` | — | Override modal text and accessibility labels at once (i18n). Takes precedence over individual string props. |
| `previousPayload` | `AcceptPayload` | — | Last accepted payload. Takes precedence over `storageKey`; enables version matching and initial accepted state. |
| `storageKey` | `string` | — | localStorage key for automatic persistence. |
| `closeOnOverlayClick` | `boolean` | `true` | Set to `false` to prevent closing by clicking the backdrop. |
| `onDecline` | `() => void` | — | Called when the modal is closed without full acceptance. |
| `onScrollProgress` | `(progress: number) => void` | — | Fires as documents are scrolled. `progress` is `0–1` across all docs. |
| `value` | `boolean` | — | Controlled accepted state (form library integration). |
| `onChange` | `(accepted: boolean) => void` | — | Fires `true` on accept, `false` on reset. |
| `onBlur` | `() => void` | — | Fires on acceptance and when the review modal closes. Marks a form field as touched. |
| `name` | `string` | — | Field name forwarded to a hidden input (native forms + RHF focus). |
| `unstyled` | `boolean` | `false` | Remove all default classes. Apply your own via `classNames`. |
| `className` | `string` | — | Extra class on the outer container (default UI). |
| `classNames` | `AgreeFirstClassNames` | — | Override individual element classes. |

See [i18n / strings](#i18n--strings) for the full key list and the text supplied outside the modal.

---

## `AgreeFirstDocument`

```ts
interface AgreeFirstDocument {
  title: string;
  content?: ReactNode;                                // omit for simple flow; supply for review
  url: string;                                        // reference/link, never fetched by the package
  version?: string;                                   // declare and update for reliable re-acceptance
  type?: "terms" | "privacy" | "policy" | "custom";
  minReadTimeMs?: number;                              // review flow only, minimum time on this tab (ms)
}
```

---

## `RenderProps`

Passed to the `render` function:

```ts
interface RenderProps {
  isAccepted: boolean;        // true after acceptance or a matching previous payload
  isModalOpen: boolean;       // true while the review modal is visible
  openModal: () => void;      // open the review modal (no-op for link-only documents)
  closeModal: () => void;     // close the modal without accepting (fires onDecline if not yet accepted)
  canSubmit: boolean;         // true when isAccepted — safe to enable a separate form button
  submit: () => void;         // simple: accept and call onAccept; review: call onAccept after accepting tabs
  reset: () => void;          // reset all state (use for "re-read" flows)
  scrollProgress: number;     // 0–1, fraction of documents fully scrolled
  needsReAcceptance: boolean; // true when a previous record does not match current documents
  getPayload: () => AcceptPayload | null; // read the payload without calling onAccept
}
```

---

## Acceptance payload — `AcceptPayload`

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

The public type name remains `AcceptPayload` for compatibility. Store this server-side if your product needs a durable acceptance record. In the simple flow, `scrollCompleted` is empty. The payload records configured UI interactions; it does not by itself prove reading, understanding, or legal compliance.

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
| `hasScrolled` | `boolean` | `true` within 10 px of the bottom, or immediately if content fits |
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
  documents: REVIEW_DOCS,
  requireScroll: true,
  onAccept: (payload) => { if (payload) saveAgreement(payload); },
  storageKey: "agreement_v1",
  onDecline: () => handleDismissal(),
});
```

This is a low-level hook. For URL-only documents, `submit()` records direct acceptance; for review documents, complete the tabs before submitting. The hook does not render links, a checkbox, or a modal for you.

---

## Customization

### CSS custom properties

Override the theme without touching `classNames`:

```css
:root {
  /* Colors */
  --af-accent:          #6366f1;   /* primary color (buttons, links, progress) */
  --af-accent-hover:    #4f46e5;
  --af-accent-foreground: #ffffff; /* text on primary buttons */
  --af-success:         #10b981;   /* "accepted" badge and tab check */
  --af-bg:              #ffffff;   /* modal background */
  --af-bg-subtle:       #f8fafc;   /* progress bar track */
  --af-bg-hover:        #f1f5f9;   /* hover states */
  --af-text:            #0f172a;   /* headings */
  --af-text-muted:      #475569;   /* body text */
  --af-text-faint:      #64748b;   /* hints, inactive tabs */
  --af-text-icon:       #64748b;   /* close button icon */
  --af-border:          #e2e8f0;
  --af-shadow:          rgba(0, 0, 0, 0.20);
  --af-overlay-bg:      rgba(0, 0, 0, 0.50);

  /* Typography */
  --af-font-family:     system-ui, -apple-system, sans-serif;
  --af-font-size:       15px;

  /* Layout and document content */
  --af-modal-width: min(100%, 52rem); /* e.g. min(100%, 60rem) for a wider card */
  --af-modal-max-height: 90dvh;
  --af-radius:          16px;      /* border-radius of the modal card */
  --af-modal-padding-inline: clamp(16px, 3vw, 28px);
  --af-modal-padding-block: 20px;
  --af-content-text-align: justify; /* use left or start if preferred */
  --af-content-text-align-mobile: start;

  /* Scrollbar */
  --af-scrollbar-size: 10px;
  --af-scrollbar-track: transparent;
  --af-scrollbar-thumb: #cbd5e1;
  --af-scrollbar-thumb-hover: #94a3b8;
  --af-close-button-size: 42px;
  --af-close-icon-size: 20px;
  --af-link-underline-offset: 4px;
}
```

The modal is rendered in a portal under `document.body`, so define theme variables on `:root`, `html`, `body`, or a selector that also contains the portal. Dark mode is handled automatically via `prefers-color-scheme: dark`. To override the dark tokens in an app that uses class-based theming, re-declare the variables under your dark selector:

```css
.dark {
  --af-accent:      #818cf8;
  --af-accent-foreground: #111827;
  --af-success:     #34d399;
  --af-bg:          #171f2d;
  --af-bg-subtle:   #111827;
  --af-bg-hover:    #263247;
  --af-text:        #f9fafb;
  --af-text-muted:  #cbd5e1;
  --af-text-faint:  #94a3b8;
  --af-text-icon:   #cbd5e1;
  --af-border:      #334155;
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

`unstyled` removes the package's visual classes. The modal structure and accessibility behavior remain. In this mode, your app must style the classes supplied through `classNames`, including the tabs, scroll area, progress bar, and footer. The live tab announcement stays visually hidden without the package stylesheet.

---

## Accessibility

- Focus trapped inside the modal while open
- `Escape` closes the modal and returns focus to the trigger element
- Tab order cycles within the modal
- Multi-document tabs use `role="tablist"` / `role="tab"` / `role="tabpanel"`
- On a tab, `ArrowLeft` / `ArrowRight` move between available documents (wrapping at the ends); `Home` / `End` go to the first / last available tab. Locked documents are skipped.
- Progress bar uses `role="progressbar"` with `aria-valuenow`
- Live region announces tab changes to screen readers
- All interactive elements have `:focus-visible` outlines
- Keyboard scroll when the document area is focused: `Space` / `PageDown` scroll down, `PageUp` scrolls up, `ArrowDown` / `ArrowUp` scroll by line, `End` jumps to bottom, `Home` jumps to top

---

## Compliance notice

`agree-first` helps implement an agreement flow and records its configured UI interactions. It is not legal advice and does not guarantee compliance with LGPD, GDPR, or any other regulation. Consult qualified counsel for your product's legal requirements.

---

## Scope and possible future work

The document owner declares each version; `agree-first` manages acceptance and re-acceptance. A future remote manifest could let an application provide document metadata (`id`, `title`, `version`, `effectiveAt`, `url`) from its own service, but no manifest fetcher, crawler, HTML parser, or legal-document monitor is included now. A React Native/Expo implementation would be a separate decision if real demand emerges; this package uses browser DOM, CSS, portals, `localStorage`, and DOM focus/scroll APIs.

---

## Size baseline

After `npm run build`, run `npm run size:report` to measure the built JavaScript, optional CSS, and estimated npm package size. CI prints the same report on every push and pull request. The package-size estimate includes both JavaScript formats, source maps, types, CSS, and documentation; it is not the amount a browser downloads.

Initial baseline (commit `b6266de`, version 0.1.0): ESM JavaScript **12.13 KiB raw / 4.70 KiB gzip**; optional CSS **7.75 KiB raw / 2.06 KiB gzip**; npm tarball **about 53 KiB** (14 files). React and React DOM are peer dependencies, not included in these bundles. Gzip values are estimates for individual files, not a measurement of an app's final bundle.

For now these numbers are informational, not CI limits. Compare future reports with this baseline; after one or two more measurements, consider a moderate threshold if it would catch meaningful regressions without blocking harmless changes.

---

## License

MIT © Felipe Cepluki
