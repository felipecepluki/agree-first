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

export default function AgreementDemo() {
  const [version, setVersion] = useState("1.4");
  const [record, setRecord] = useState<AcceptPayload>(previousRecord);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [appearance, setAppearance] = useState<"light" | "dark">("dark");
  const [resetCount, setResetCount] = useState(0);

  const recordedTerms = record.documents.find((doc) => doc.url === "/sample/terms.html")?.version ?? "—";

  function resetDemo() {
    setVersion("1.4");
    setRecord(previousRecord);
    setIsNewRecord(false);
    setResetCount((count) => count + 1);
  }

  return (
    <div className={`agreement-demo appearance-${appearance}`}>
      <div className="demo-toolbar">
        <span className="demo-live"><span aria-hidden="true" /> LIVE PACKAGE · SIMPLE FLOW</span>
        <button type="button" className="demo-reset" onClick={resetDemo}>Reset example ↺</button>
      </div>

      <div className="demo-columns">
        <div className="demo-form-panel">
          <div className="demo-panel-kicker">YOUR CURRENT DOCUMENTS</div>
          <div className="demo-heading-row">
            <h2>Review the versions</h2>
            <span className="demo-mini-badge">2 documents</span>
          </div>
          <p className="demo-description">Switch the Terms version to see when an earlier acceptance still matches.</p>

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

      <div className="demo-bottom">
        <span>Real agree-first behavior · record kept only in this page's memory</span>
        <div className="appearance-switch" role="group" aria-label="Demo appearance">
          <button type="button" aria-pressed={appearance === "light"} onClick={() => setAppearance("light")}>Light</button>
          <button type="button" aria-pressed={appearance === "dark"} onClick={() => setAppearance("dark")}>Dark</button>
        </div>
      </div>
    </div>
  );
}
