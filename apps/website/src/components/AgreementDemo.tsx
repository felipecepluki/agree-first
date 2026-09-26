import { useState } from "react";
import { AgreeFirst, type AcceptPayload } from "agree-first";
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

export default function AgreementDemo() {
  const [termsVersion, setTermsVersion] = useState<"1.4" | "1.5">("1.4");
  const [record, setRecord] = useState<AcceptPayload>(previousRecord);
  const [run, setRun] = useState(0);
  const acceptedVersion = record.documents.find((doc) => doc.url === "/sample/terms.html")?.version ?? "—";
  const isCurrentVersionAccepted = acceptedVersion === termsVersion;

  function resetDemo() {
    setTermsVersion("1.4");
    setRecord(previousRecord);
    setRun((value) => value + 1);
  }

  return (
    <div className="agreement-demo">
      <div className="demo-toolbar">
        <span className="demo-live"><span aria-hidden="true" /> LIVE PACKAGE</span>
        <span className="demo-toolbar-note">A real versioned agreement</span>
        <button type="button" className="demo-reset" onClick={resetDemo}>Start over ↺</button>
      </div>

      <div className="demo-body">
        <div className="demo-heading">
          <span className="demo-kicker">VERSIONING IN ACTION</span>
          <h2>New terms? Ask again.</h2>
          <p>The last record includes Terms v{acceptedVersion}. Your app now declares v{termsVersion}. Watch the agreement follow the document version.</p>
        </div>

        <div className="demo-version-flow" role="group" aria-label="Previously accepted and current Terms versions">
          <div>
            <span>LAST ACCEPTED</span>
            <strong>Terms <em>v{acceptedVersion}</em></strong>
          </div>
          <span className="demo-flow-arrow" aria-hidden="true">→</span>
          <div>
            <span>CURRENT DOCUMENT</span>
            <strong>Terms <em>v{termsVersion}</em></strong>
          </div>
          <span className={`demo-flow-state ${isCurrentVersionAccepted ? "is-current" : "is-changed"}`}>
            {isCurrentVersionAccepted ? "Up to date" : "New version"}
          </span>
        </div>

        <div className="demo-agreement-surface">
          <AgreeFirst
            key={`${termsVersion}-${run}`}
            documents={[
              { title: "Terms of Service", url: "/sample/terms.html", version: termsVersion, type: "terms" },
              { title: "Privacy Policy", url: "/sample/privacy.html", version: "2.0", type: "privacy" },
            ]}
            previousPayload={record}
            onAccept={(payload) => { if (payload) setRecord(payload); }}
            render={({ isAccepted, needsReAcceptance, submit }) => (
              <div className="demo-agreement-field">
                <label className="demo-check-label">
                  <input
                    type="checkbox"
                    checked={isAccepted}
                    onChange={(event) => { if (event.target.checked && !isAccepted) submit(); }}
                  />
                  <span>I agree to the current documents</span>
                </label>
                <div className="demo-document-links">
                  <a href="/sample/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service ↗</a>
                  <a href="/sample/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy ↗</a>
                </div>
                <p className={`demo-result ${isAccepted ? "is-accepted" : "is-pending"}`} role="status">
                  <span aria-hidden="true">{isAccepted ? "✓" : "↻"}</span>
                  {isAccepted ? "Current versions accepted" : needsReAcceptance ? "Version changed — acceptance needed" : "Acceptance needed"}
                </p>
              </div>
            )}
          />
        </div>

        <div className="demo-footer">
          <div>
            <strong>{isCurrentVersionAccepted ? "Acceptance recorded" : "Waiting for acceptance"}</strong>
            <span>{isCurrentVersionAccepted ? `Terms v${acceptedVersion} and Privacy v2.0 are in the record.` : "Only Terms changed. Privacy remains at v2.0."}</span>
          </div>
          {isCurrentVersionAccepted && termsVersion === "1.4" && (
            <button type="button" className="demo-next-version" onClick={() => setTermsVersion("1.5")}>Publish v1.5 <span aria-hidden="true">→</span></button>
          )}
          <details className="demo-payload">
            <summary>View payload <span aria-hidden="true">⌄</span></summary>
            <pre>{JSON.stringify(record, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
}
