import type { AgreeFirstDocument } from "agree-first";

const reviewParagraphs = [
  "This is sample content for testing the interaction, not a legal document. Open the linked page to confirm that document URLs remain under the application’s control.",
  "Try the mouse wheel, touch, Page Down, End, and browser zoom. Reaching the bottom is only an interaction signal; it does not prove reading or understanding.",
  "Close this dialog with Escape and check that focus returns to the control that opened it. Then reopen it and continue through both documents.",
  "Switch back to a completed tab after accepting a document. Its progress should remain complete while the next document keeps its own progress.",
];

function ReviewContent({ title }: { title: string }) {
  return (
    <article>
      <h2>{title}</h2>
      {Array.from({ length: 4 }, (_, group) =>
        reviewParagraphs.map((paragraph, index) => (
          <p key={`${group}-${index}`}>{paragraph}</p>
        )),
      )}
    </article>
  );
}

export function simpleDocuments(version: string): AgreeFirstDocument[] {
  return [
    { title: "Terms of Service", url: "/terms.html", version, type: "terms" },
    { title: "Privacy Policy", url: "/privacy.html", version: "1.0", type: "privacy" },
  ];
}

export function reviewDocuments(): AgreeFirstDocument[] {
  return [
    {
      title: "Terms of Service",
      url: "/terms.html",
      version: "1.0",
      type: "terms",
      minReadTimeMs: 1500,
      content: <ReviewContent title="Terms of Service" />,
    },
    {
      title: "Privacy Policy",
      url: "/privacy.html",
      version: "1.0",
      type: "privacy",
      content: <ReviewContent title="Privacy Policy" />,
    },
  ];
}

export const shortDocument: AgreeFirstDocument[] = [
  {
    title: "Short policy",
    url: "/short.html",
    version: "1.0",
    content: <p>This sample fits inside the viewport. The accept action should unlock without scrolling.</p>,
  },
];
