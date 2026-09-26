import { useState } from "react";
import { AgreeFirst, type AcceptPayload } from "agree-first";
import "agree-first/styles";

const previousRecord: AcceptPayload = {
  id: "previous-terms-v13",
  timestamp: "2026-09-01T12:00:00.000Z",
  documents: [{ title: "Terms of Service", url: "/sample/terms.html", version: "1.3" }],
  scrollCompleted: [],
};

export default function VersioningExample() {
  const [version, setVersion] = useState("1.3");
  const [record, setRecord] = useState(previousRecord);
  const [run, setRun] = useState(0);
  const acceptedVersion = record.documents[0].version;

  return (
    <div className="docs-example-content">
      <div className="docs-example-topline"><span>02 / RE-ACCEPTANCE</span><span>Previously accepted: v{acceptedVersion}</span></div>
      <div className="docs-example-options" role="group" aria-label="Current Terms version">
        <span>Current version</span>
        {["1.3", "1.4"].map((option) => (
          <button key={option} type="button" aria-pressed={version === option} onClick={() => setVersion(option)}>v{option}</button>
        ))}
      </div>
      <AgreeFirst
        key={`${version}-${run}`}
        documents={[{ title: "Terms of Service", url: "/sample/terms.html", version }]}
        previousPayload={record}
        onAccept={(payload) => { if (payload) setRecord(payload); }}
      />
      <p className="docs-example-status" role="status">
        {acceptedVersion === version ? "This version matches the last record." : "The version changed. Acceptance is required again."}
      </p>
      <button type="button" className="docs-example-reset" onClick={() => { setRecord(previousRecord); setVersion("1.3"); setRun((value) => value + 1); }}>
        Reset preview
      </button>
    </div>
  );
}
