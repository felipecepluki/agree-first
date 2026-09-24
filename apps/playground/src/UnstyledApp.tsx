import { useState } from "react";
import { AgreeFirst, type AcceptPayload, type AgreeFirstClassNames } from "agree-first";
import { reviewDocuments } from "./documents";

const customClasses: AgreeFirstClassNames = {
  container: "custom-field",
  checkboxWrapper: "custom-checkbox-row",
  checkbox: "custom-checkbox",
  label: "custom-label",
  labelLink: "custom-label-link",
  button: "custom-action",
  overlay: "custom-overlay",
  modal: "custom-modal",
  modalHeader: "custom-modal-header",
  modalTitle: "custom-modal-title",
  modalClose: "custom-modal-close",
  tabs: "custom-tabs",
  tab: "custom-tab",
  tabActive: "custom-tab-active",
  tabDone: "custom-tab-done",
  modalScrollArea: "custom-scroll-area",
  progressBar: "custom-progress-bar",
  progressFill: "custom-progress-fill",
  modalFooter: "custom-modal-footer",
  modalAcceptRow: "custom-accept-row",
  acceptButton: "custom-accept-button",
  acceptBadge: "custom-accepted-badge",
  docLink: "custom-doc-link",
  scrollHint: "custom-scroll-hint",
};

function UnstyledApp() {
  const [payload, setPayload] = useState<AcceptPayload | null>(null);

  return (
    <main className="custom-page">
      <nav className="custom-nav">
        <a href="/">← Back to playground</a>
        <span>agree-first / custom styling</span>
      </nav>
      <section className="custom-hero">
        <p className="custom-eyebrow">No package stylesheet imported</p>
        <h1>Your UI, the same agreement flow.</h1>
        <p>This page uses <code>unstyled</code> and <code>classNames</code>. The modal, tabs, controls, and colors below are styled entirely by this consumer app. Replace the classes with your own CSS or design system.</p>
      </section>
      <section className="custom-card" aria-labelledby="custom-demo-title">
        <div className="custom-card-header"><span className="custom-pill">Live demo</span><h2 id="custom-demo-title">Review the sample policies</h2></div>
        <p>Two documents · scrolling required · no package CSS</p>
        <AgreeFirst
          documents={reviewDocuments()}
          unstyled
          classNames={customClasses}
          onAccept={(nextPayload) => setPayload(nextPayload ?? null)}
        >
          Continue demo
        </AgreeFirst>
      </section>
      <section className="custom-card custom-record" aria-labelledby="custom-record-title">
        <h2 id="custom-record-title">Callback payload</h2>
        <pre aria-live="polite">{payload ? JSON.stringify(payload, null, 2) : "Finish both documents and click Continue demo."}</pre>
      </section>
      <p className="custom-disclaimer">Demo content only. Scroll completion records interaction, not reading or legal compliance.</p>
    </main>
  );
}

export default UnstyledApp;
