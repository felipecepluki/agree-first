import { useState } from "react";
import { AgreeFirst, type AcceptPayload } from "agree-first";
import "agree-first/styles";

const documents = [
  { title: "Terms of Service", url: "/sample/terms.html", version: "1.4" },
  { title: "Privacy Policy", url: "/sample/privacy.html", version: "2.0" },
];

export default function SimpleAgreementExample() {
  const [record, setRecord] = useState<AcceptPayload | null>(null);
  const [run, setRun] = useState(0);

  return (
    <div className="docs-example-content">
      <div className="docs-example-topline"><span>01 / SIMPLE AGREEMENT</span><span>No modal · no scroll gate</span></div>
      <AgreeFirst key={run} documents={documents} onAccept={(payload) => setRecord(payload ?? null)} />
      <p className="docs-example-status" role="status">
        {record ? "Accepted. The callback received a versioned record." : "Try the checkbox, then inspect the record below."}
      </p>
      {record && (
        <details className="docs-example-record">
          <summary>Inspect acceptance payload</summary>
          <pre>{JSON.stringify(record, null, 2)}</pre>
        </details>
      )}
      <button type="button" className="docs-example-reset" onClick={() => { setRecord(null); setRun((value) => value + 1); }}>
        Reset preview
      </button>
    </div>
  );
}
