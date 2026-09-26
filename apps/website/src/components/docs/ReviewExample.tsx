import { useState } from "react";
import { AgreeFirst, type AcceptPayload, type AgreeFirstDocument } from "agree-first";
import "agree-first/styles";

const paragraphs = [
  "This sample content belongs to the application. agree-first does not fetch or interpret the document URL.",
  "Each document has a separate review step. Scroll to the end of this panel to enable its accept action.",
  "The document owner declares its version. Changing that version can require another acceptance later.",
  "You can revisit a completed tab without repeating the scroll step. Keyboard users can focus this area and scroll it.",
  "A completed scroll is only a UI interaction signal. It does not prove that somebody read or understood the text.",
  "In a real app, use your own document text and save the final payload through your own backend.",
];

const documents: AgreeFirstDocument[] = [
  { title: "Terms of Service", url: "/sample/terms.html", version: "1.4", content: <div><h2>Terms of Service</h2>{paragraphs.map((text, index) => <p key={index}>{text}</p>)}</div> },
  { title: "Privacy Policy", url: "/sample/privacy.html", version: "2.0", content: <div><h2>Privacy Policy</h2>{paragraphs.map((text, index) => <p key={index}>{text}</p>)}</div> },
];

export default function ReviewExample() {
  const [record, setRecord] = useState<AcceptPayload | null>(null);
  const [run, setRun] = useState(0);

  return (
    <div className="docs-example-content">
      <div className="docs-example-topline"><span>03 / OPTIONAL REVIEW</span><span>Two documents · scroll required</span></div>
      <AgreeFirst key={run} documents={documents} requireScroll onAccept={(payload) => setRecord(payload ?? null)}>
        Complete review
      </AgreeFirst>
      <p className="docs-example-status" role="status">
        {record ? "Review submitted. The callback received an acceptance record." : "Check the box, review both documents, then use Complete review."}
      </p>
      {record && <details className="docs-example-record"><summary>Inspect acceptance payload</summary><pre>{JSON.stringify(record, null, 2)}</pre></details>}
      <button type="button" className="docs-example-reset" onClick={() => { setRecord(null); setRun((value) => value + 1); }}>
        Reset preview
      </button>
    </div>
  );
}
