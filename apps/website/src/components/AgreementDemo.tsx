import { useState } from "react";
import { AgreeFirst, type AcceptPayload, type AgreeFirstDocument } from "agree-first";
import "../styles/demo.css";

const previousRecord: AcceptPayload = {
  id: "sample-terms-v13",
  timestamp: "2026-09-01T12:00:00.000Z",
  documents: [
    { title: "Terms of Service", url: "/sample/terms.html", version: "1.3", type: "terms" },
    { title: "Privacy Policy", url: "/sample/privacy.html", version: "2.0", type: "privacy" },
  ],
  scrollCompleted: [],
};

function documentsFor(version: string): AgreeFirstDocument[] {
  return [
    { title: "Terms of Service", url: "/sample/terms.html", version, type: "terms" },
    { title: "Privacy Policy", url: "/sample/privacy.html", version: "2.0", type: "privacy" },
  ];
}

const reviewParagraphs = [
  "This is sample document content for the interactive review. Your application supplies the actual text and declares its version; agree-first does not fetch or interpret a page behind the URL.",
  "The review view can hold more than one document. Each one has its own tab, link to the full document, progress indicator, and acceptance step.",
  "Scroll through this example with a mouse, touchpad, touch screen, or keyboard. Reaching the bottom is an interaction signal, not evidence that a person read or understood the document.",
  "The document owner decides when a version changes. A previously accepted version does not automatically cover a newer version of the same document.",
  "You can style the interface using the optional stylesheet and CSS variables, provide your own classes, or use the headless render prop for the surrounding UI.",
  "After both documents are reviewed, save the acceptance record in the demo. A real application would choose its own durable storage and legal review process.",
  "A stable URL identifies a document in a previous record. The application must change its declared version when the document itself changes.",
  "The modal remembers progress when you move between completed tabs. The next document becomes available only after the current step is completed.",
  "Keyboard users can move through the document area and navigate available tabs. Escape closes the modal and returns focus to the control that opened it.",
  "A timestamp records when the configured interaction was completed. It should be interpreted alongside your own product requirements, not as a legal guarantee.",
  "The example keeps records in page memory so you can reset and repeat the flow safely. It does not send any information to a server.",
  "Continue to the end of this sample to see the scroll progress reach completion and unlock the next action.",
];

const reviewDocuments: AgreeFirstDocument[] = [
  {
    title: "Terms of Service",
    url: "/sample/terms.html",
    version: "1.4",
    type: "terms",
    content: <div className="demo-review-document"><h2>Terms of Service</h2>{reviewParagraphs.map((text, index) => <p key={index}>{text}</p>)}</div>,
  },
  {
    title: "Privacy Policy",
    url: "/sample/privacy.html",
    version: "2.0",
    type: "privacy",
    content: <div className="demo-review-document"><h2>Privacy Policy</h2>{reviewParagraphs.map((text, index) => <p key={index}>{text}</p>)}</div>,
  },
];

export default function AgreementDemo() {
  const [mode, setMode] = useState<"simple" | "review">("simple");
  const [version, setVersion] = useState("1.4");
  const [record, setRecord] = useState<AcceptPayload>(previousRecord);
  const [reviewRecord, setReviewRecord] = useState<AcceptPayload | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [appearance, setAppearance] = useState<"light" | "dark">("dark");
  const [resetCount, setResetCount] = useState(0);

  const recordedTerms = record.documents.find((doc) => doc.url === "/sample/terms.html")?.version ?? "—";

  function resetDemo() {
    setVersion("1.4");
    setRecord(previousRecord);
    setReviewRecord(null);
    setIsNewRecord(false);
    setResetCount((count) => count + 1);
  }

  return (
    <div className={`agreement-demo appearance-${appearance}`}>
      <div className="demo-toolbar">
        <span className="demo-live"><span aria-hidden="true" /> LIVE PACKAGE</span>
        <div className="demo-mode-switch" role="group" aria-label="Choose agreement flow">
          <button type="button" aria-pressed={mode === "simple"} onClick={() => setMode("simple")}>Simple agreement</button>
          <button type="button" aria-pressed={mode === "review"} onClick={() => setMode("review")}>Optional review</button>
        </div>
        <button type="button" className="demo-reset" onClick={resetDemo}>Reset example ↺</button>
      </div>

      {mode === "simple" ? <>
      <div className="demo-comparison" aria-label="How document versions affect acceptance">
        <div><span>LAST ACCEPTED</span><strong>Terms v{recordedTerms}</strong></div>
        <span className="demo-comparison-arrow" aria-hidden="true">→</span>
        <div><span>CURRENT DOCUMENT</span><strong>Terms v{version}</strong></div>
        <span className="demo-comparison-arrow" aria-hidden="true">→</span>
        <div className={recordedTerms === version ? "comparison-matched" : "comparison-changed"}><span>RESULT</span><strong>{recordedTerms === version ? "Accepted" : "Ask again"}</strong></div>
      </div>
      <div className="demo-columns">
        <div className="demo-form-panel">
          <div className="demo-panel-kicker">YOUR CURRENT DOCUMENTS</div>
          <div className="demo-heading-row">
            <h2>Try a version change</h2>
            <span className="demo-mini-badge">2 documents</span>
          </div>
          <p className="demo-description">Select v1.3 to match the saved record, then v1.4 to request acceptance again.</p>

          <div className="version-selector" role="group" aria-label="Terms of Service version">
            <span>Terms version</span>
            {["1.3", "1.4"].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={version === option}
                onClick={() => setVersion(option)}
              >
                v{option}
              </button>
            ))}
          </div>

          <div className="demo-field-surface">
            <AgreeFirst
              key={`${version}-${resetCount}`}
              documents={documentsFor(version)}
              previousPayload={record}
              onAccept={(payload) => {
                if (payload) {
                  setRecord(payload);
                  setIsNewRecord(true);
                }
              }}
              render={({ isAccepted, needsReAcceptance, submit }) => (
                <div className="demo-agreement-field">
                  <label className="demo-check-label">
                    <input
                      type="checkbox"
                      checked={isAccepted}
                      onChange={(event) => {
                        if (event.target.checked && !isAccepted) submit();
                      }}
                    />
                    <span>I agree to the current documents</span>
                  </label>
                  <div className="demo-document-links">
                    <a href="/sample/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service ↗</a>
                    <a href="/sample/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy ↗</a>
                  </div>
                  <p className={`demo-result ${isAccepted ? "is-accepted" : "is-pending"}`} role="status">
                    <span className="result-dot" aria-hidden="true" />
                    {isAccepted ? "Current versions accepted" : needsReAcceptance ? "Terms changed — acceptance required again" : "Acceptance required"}
                  </p>
                </div>
              )}
            />
          </div>
          <p className="demo-explanation">No modal or scroll is required here. The links open sample pages, and acceptance updates the record on the right.</p>
        </div>

        <div className="demo-record-panel">
          <div className="demo-panel-kicker">ACCEPTANCE RECORD</div>
          <div className="record-card-heading">
            <span className="record-icon" aria-hidden="true">↳</span>
            <div><strong>{isNewRecord ? "New payload received" : "Previous payload loaded"}</strong><small>{isNewRecord ? "From the onAccept callback" : "Sample record from an earlier visit"}</small></div>
          </div>
          <div className="record-line"><span>Terms of Service</span><strong>v{recordedTerms}</strong></div>
          <div className="record-line"><span>Privacy Policy</span><strong>v2.0</strong></div>
          <div className="record-line"><span>Accepted at</span><strong>{new Date(record.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</strong></div>
          <details className="payload-details">
            <summary>Inspect the acceptance payload <span aria-hidden="true">⌄</span></summary>
            <pre>{JSON.stringify(record, null, 2)}</pre>
          </details>
        </div>
      </div>
      </> : <div className="demo-columns demo-review-columns">
        <div className="demo-form-panel">
          <div className="demo-panel-kicker">OPTIONAL REVIEW FLOW</div>
          <div className="demo-heading-row"><h2>Two documents, one flow.</h2><span className="demo-mini-badge">Live modal</span></div>
          <p className="demo-description">Open the real package modal. Scroll through each document, accept both, then save the resulting payload.</p>
          <div className="demo-review-preview">
            <div className="demo-review-preview-top"><span>01 / TERMS OF SERVICE</span><span>02 / PRIVACY POLICY</span></div>
            <div className="demo-review-preview-body"><strong>Review before accepting</strong><p>Tabs, progress, keyboard controls and focus handling are provided by agree-first.</p></div>
            <AgreeFirst
              key={`review-${resetCount}`}
              documents={reviewDocuments}
              requireScroll
              onAccept={(payload) => { if (payload) setReviewRecord(payload); }}
              render={({ isAccepted, openModal, submit }) => (
                <button
                  className="demo-review-action"
                  type="button"
                  disabled={reviewRecord !== null}
                  onClick={isAccepted ? submit : openModal}
                >
                  {reviewRecord ? "Record saved ✓" : isAccepted ? "Save acceptance record" : "Open review modal"}
                  {!reviewRecord && <span aria-hidden="true">↗</span>}
                </button>
              )}
            />
          </div>
          <p className="demo-explanation">Sample text only. Scroll completion is optional in your own app, and it is not proof of reading.</p>
        </div>
        <div className="demo-record-panel">
          <div className="demo-panel-kicker">REVIEW RECORD</div>
          <div className="record-card-heading">
            <span className="record-icon" aria-hidden="true">↳</span>
            <div><strong>{reviewRecord ? "Review payload received" : "Waiting for acceptance"}</strong><small>{reviewRecord ? "From the onAccept callback" : "Open the modal to begin"}</small></div>
          </div>
          <div className="demo-review-steps">
            <div><span>01</span> Open the modal</div>
            <div><span>02</span> Complete both documents</div>
            <div><span>03</span> Save the acceptance record</div>
          </div>
          {reviewRecord && <>
            <div className="record-line"><span>Documents</span><strong>{reviewRecord.documents.length}</strong></div>
            <div className="record-line"><span>Scroll completed</span><strong>{reviewRecord.scrollCompleted.length} of 2</strong></div>
            <details className="payload-details"><summary>Inspect the acceptance payload <span aria-hidden="true">⌄</span></summary><pre>{JSON.stringify(reviewRecord, null, 2)}</pre></details>
          </>}
        </div>
      </div>}

      <div className="demo-bottom">
        <span>Real agree-first behavior · records stay only in this page's memory</span>
        <div className="appearance-switch" role="group" aria-label="Demo appearance">
          <button type="button" aria-pressed={appearance === "light"} onClick={() => setAppearance("light")}>Light</button>
          <button type="button" aria-pressed={appearance === "dark"} onClick={() => setAppearance("dark")}>Dark</button>
        </div>
      </div>
    </div>
  );
}
