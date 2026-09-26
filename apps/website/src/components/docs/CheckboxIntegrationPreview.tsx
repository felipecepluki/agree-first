import { useState } from "react";
import { AgreeFirst, type AcceptPayload } from "agree-first";

const documents = [
  { title: "Terms of Service", url: "/sample/terms.html", version: "1.4" },
  { title: "Privacy Policy", url: "/sample/privacy.html", version: "2.0" },
];

interface Props {
  variant: "shadcn" | "heroui";
}

export default function CheckboxIntegrationPreview({ variant }: Props) {
  const [record, setRecord] = useState<AcceptPayload | null>(null);
  const [run, setRun] = useState(0);

  return (
    <div className={`docs-ui-preview docs-ui-preview--${variant}`}>
      <div className="docs-ui-preview-heading">
        <span className="docs-ui-preview-dot" aria-hidden="true" />
        <span>Interactive preview</span>
        <small>agree-first · simple flow</small>
      </div>
      <div className="docs-ui-preview-stage">
        <div className="docs-ui-preview-card">
          <AgreeFirst
            key={run}
            documents={documents}
            onAccept={(payload) => setRecord(payload ?? null)}
            render={({ isAccepted, submit }) => (
              <div>
                <label className="docs-ui-preview-label">
                  <input
                    type="checkbox"
                    checked={isAccepted}
                    onChange={(event) => {
                      if (event.target.checked && !isAccepted) submit();
                    }}
                  />
                  <span>I agree to the documents below</span>
                </label>
                <p className="docs-ui-preview-links">
                  Review the <a href="/sample/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                  {" and "}
                  <a href="/sample/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </p>
              </div>
            )}
          />
          <p className="docs-ui-preview-status" role="status">
            {record ? "Accepted · a versioned payload was created." : "Select the checkbox to create an acceptance record."}
          </p>
          {record && (
            <details className="docs-ui-preview-record">
              <summary>Inspect acceptance payload</summary>
              <pre>{JSON.stringify(record, null, 2)}</pre>
            </details>
          )}
          <button
            type="button"
            className="docs-ui-preview-reset"
            onClick={() => { setRecord(null); setRun((value) => value + 1); }}
          >
            Reset preview
          </button>
        </div>
      </div>
    </div>
  );
}
