import { useState } from "react";
import { AgreeFirst, type AcceptPayload } from "agree-first";
import { reviewDocuments, shortDocument, simpleDocuments } from "./documents";

const SIMPLE_STORAGE_KEY = "agree-first-playground-simple";
const REVIEW_STORAGE_KEY = "agree-first-playground-review";
const REVIEW_DOCS = reviewDocuments();

function readStoredPayload(key: string): AcceptPayload | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AcceptPayload) : null;
  } catch {
    return null;
  }
}

function PayloadPreview({ payload }: { payload: AcceptPayload | null }) {
  return (
    <div className="payload-preview">
      <div className="payload-heading">
        <span>Acceptance payload</span>
        <span className="payload-indicator">{payload ? "Recorded" : "Waiting"}</span>
      </div>
      <pre aria-live="polite">{payload ? JSON.stringify(payload, null, 2) : "Accept the documents to inspect the record here."}</pre>
    </div>
  );
}

function App() {
  const [termsVersion, setTermsVersion] = useState("1.0");
  const [simplePayload, setSimplePayload] = useState<AcceptPayload | null>(() => readStoredPayload(SIMPLE_STORAGE_KEY));
  const [reviewPayload, setReviewPayload] = useState<AcceptPayload | null>(() => readStoredPayload(REVIEW_STORAGE_KEY));
  const [reviewScroll, setReviewScroll] = useState(true);
  const [reviewKey, setReviewKey] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [simpleKey, setSimpleKey] = useState(0);

  const clearSimple = () => {
    window.localStorage.removeItem(SIMPLE_STORAGE_KEY);
    setSimplePayload(null);
    setTermsVersion("1.0");
    // The package reads storage on mount; this remounts the demo after clearing it.
    setSimpleKey((key) => key + 1);
  };
  const clearReview = () => {
    window.localStorage.removeItem(REVIEW_STORAGE_KEY);
    setReviewPayload(null);
    setReviewSubmitted(false);
    setReviewKey((key) => key + 1);
  };

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="topbar">
          <a className="brand" href="#top" aria-label="agree-first playground home">
            <span className="brand-symbol" aria-hidden="true">a<span>.</span></span>
            <span>agree-first <small>/ playground</small></span>
          </a>
          <a className="top-link" href="/unstyled.html">Custom styling <span aria-hidden="true">↗</span></a>
        </div>
        <div id="top" className="hero-content">
          <p className="eyebrow">Versioned agreement flows for React</p>
          <h1>Try the package in a real browser.</h1>
          <p className="hero-copy">A local consumer app for the two ways to use agree-first: a simple checkbox with versioned links, and an optional document review flow. No publishing required.</p>
          <div className="hero-actions">
            <a className="hero-primary" href="#simple">Try simple agreement <span aria-hidden="true">↓</span></a>
            <a className="hero-secondary" href="#review">Explore review flow <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="feature-strip" aria-label="Package features">
          <span>Multiple documents</span><span>Versioning</span><span>Local persistence</span><span>Optional review</span>
        </div>
      </header>

      <section id="simple" className="demo-section" aria-labelledby="simple-heading">
        <div className="section-intro">
          <div>
            <p className="eyebrow">01 / The common case</p>
            <h2 id="simple-heading">A checkbox is enough.</h2>
            <p>Checking it records acceptance immediately. The document links open separately; there is no modal or forced scroll in this flow.</p>
          </div>
          <span className="section-tag">Simple agreement</span>
        </div>
        <div className="demo-grid">
          <div className="demo-card interaction-card">
            <div className="card-topline"><span>Live component</span><span className="live-dot">Interactive</span></div>
            <h3>Accept current documents</h3>
            <p>Terms v{termsVersion} · Privacy v1.0</p>
            <div className="component-surface">
              <AgreeFirst
                key={`${termsVersion}-${simpleKey}`}
                documents={simpleDocuments(termsVersion)}
                storageKey={SIMPLE_STORAGE_KEY}
                onAccept={(payload) => setSimplePayload(payload ?? null)}
              />
            </div>
            <div className="control-row">
              <button type="button" className="control-button" onClick={() => setTermsVersion((version) => version === "1.0" ? "1.1" : "1.0")}>Switch Terms to v{termsVersion === "1.0" ? "1.1" : "1.0"}</button>
              <button type="button" className="text-button" onClick={clearSimple}>Clear local record</button>
            </div>
            <p className="helper-copy">Accept v1.0, switch to v1.1, and notice that acceptance is required again. Reload to test localStorage.</p>
          </div>
          <PayloadPreview payload={simplePayload} />
        </div>
      </section>

      <section id="review" className="demo-section" aria-labelledby="review-heading">
        <div className="section-intro">
          <div>
            <p className="eyebrow">02 / When you need more</p>
            <h2 id="review-heading">Review is optional.</h2>
            <p>Content activates the modal. This example has two documents, scroll progress, and a short minimum display time on the first document.</p>
          </div>
          <span className="section-tag">Review flow</span>
        </div>
        <div className="demo-grid">
          <div className="demo-card interaction-card">
            <div className="card-topline"><span>Default package UI</span><span className="live-dot">Interactive</span></div>
            <h3>Review before continuing</h3>
            <p>Complete each document, then use the Continue button to receive the callback.</p>
            <div className="component-surface">
              <AgreeFirst
                key={`${reviewKey}-${reviewScroll}`}
                documents={REVIEW_DOCS}
                storageKey={REVIEW_STORAGE_KEY}
                requireScroll={reviewScroll}
                onAccept={(payload) => { setReviewPayload(payload ?? null); setReviewSubmitted(true); }}
              >
                Continue demo
              </AgreeFirst>
            </div>
            {reviewSubmitted && <p className="success-note" role="status">Continue callback received. The payload is shown beside the demo.</p>}
            <div className="control-row">
              <label className="toggle-control"><input type="checkbox" checked={reviewScroll} onChange={(event) => setReviewScroll(event.target.checked)} /> Require scroll</label>
              <button type="button" className="text-button" onClick={clearReview}>Clear local record</button>
            </div>
            <p className="helper-copy">The first document also waits 1.5 seconds. Closing with Escape should restore focus. Switching scroll mode remounts this demo.</p>
          </div>
          <PayloadPreview payload={reviewPayload} />
        </div>
      </section>

      <section className="bottom-grid" aria-label="More ways to test">
        <div className="demo-card small-card">
          <p className="eyebrow">Edge case</p>
          <h2>Short content</h2>
          <p>A document that fits inside the viewport should unlock without scrolling.</p>
          <AgreeFirst documents={shortDocument} requireCheckbox={false}>Open short document</AgreeFirst>
        </div>
        <div className="demo-card small-card">
          <p className="eyebrow">Style freedom</p>
          <h2>No package CSS</h2>
          <p>Open the separate page that imports no agree-first stylesheet and supplies every visible class from this app.</p>
          <a className="card-link" href="/unstyled.html">See custom styling <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer className="site-footer">
        <p>Local test content only. Interaction tracking is not proof of reading or legal compliance.</p>
        <a href="https://github.com/felipecepluki/agree-first">View source <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  );
}

export default App;
