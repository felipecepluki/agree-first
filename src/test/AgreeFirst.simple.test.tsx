import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AgreeFirst } from "../components/AgreeFirst";
import type { AcceptPayload, AgreeFirstDocument } from "../types";

const documents: AgreeFirstDocument[] = [
  { title: "Terms of Service", url: "/terms", version: "1.3" },
  { title: "Privacy Policy", url: "/privacy", version: "2026-09-23" },
];

beforeEach(() => window.localStorage.clear());

describe("AgreeFirst simple agreement", () => {
  it("accepts URL-only documents from the checkbox without opening a modal or loading CSS", () => {
    const onAccept = vi.fn();
    const onChange = vi.fn();
    render(<AgreeFirst documents={documents} onAccept={onAccept} onChange={onChange} storageKey="agreement" unstyled />);

    const checkbox = screen.getByRole("checkbox", { name: /I agree to the Terms of Service and Privacy Policy/ });
    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("class", "");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onAccept).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);

    const payload = onAccept.mock.calls[0][0] as AcceptPayload;
    expect(payload.documents).toEqual([
      { title: "Terms of Service", url: "/terms", version: "1.3" },
      { title: "Privacy Policy", url: "/privacy", version: "2026-09-23" },
    ]);
    expect(payload.scrollCompleted).toEqual([]);
    expect(payload.timestamp).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("agreement")!)).toEqual(payload);
  });

  it("opens a document link without accepting the agreement", () => {
    const onAccept = vi.fn();
    render(<AgreeFirst documents={documents} onAccept={onAccept} />);

    fireEvent.click(screen.getByRole("link", { name: "Terms of Service" }));

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(onAccept).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not emit a second acceptance from an optional button", () => {
    const onAccept = vi.fn();
    render(<AgreeFirst documents={documents} onAccept={onAccept}>Continue</AgreeFirst>);

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(onAccept).toHaveBeenCalledOnce();
  });

  it("starts accepted for matching stored versions without emitting a new acceptance", () => {
    const onAccept = vi.fn();
    localStorage.setItem("agreement", JSON.stringify({
      id: "previous",
      timestamp: "2026-09-20T12:00:00.000Z",
      documents: documents.map(({ title, url, version }) => ({ title, url, version })),
      scrollCompleted: [],
    }));

    render(<AgreeFirst documents={documents} storageKey="agreement" onAccept={onAccept} />);

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(onAccept).not.toHaveBeenCalled();
  });

  it("re-accepts an outdated stored version and replaces the local record", () => {
    const onAccept = vi.fn();
    localStorage.setItem("agreement", JSON.stringify({
      id: "previous",
      timestamp: "2026-09-20T12:00:00.000Z",
      documents: [
        { title: "Terms of Service", url: "/terms", version: "1.2" },
        { title: "Privacy Policy", url: "/privacy", version: "2026-09-23" },
      ],
      scrollCompleted: [],
    }));

    render(
      <AgreeFirst
        documents={documents}
        storageKey="agreement"
        onAccept={onAccept}
        render={({ isAccepted, needsReAcceptance, submit }) => (
          <button onClick={submit}>{isAccepted ? "Accepted" : needsReAcceptance ? "Accept updated documents" : "Accept"}</button>
        )}
      />
    );
    expect(screen.getByRole("button", { name: "Accept updated documents" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Accept updated documents" }));

    expect(onAccept).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Accepted" })).toBeInTheDocument();
    expect((JSON.parse(localStorage.getItem("agreement")!) as AcceptPayload).documents[0].version).toBe("1.3");
  });

  it("lets a custom render prop accept a URL-only agreement using submit", () => {
    const onAccept = vi.fn();
    render(
      <AgreeFirst
        documents={documents}
        onAccept={onAccept}
        render={({ isAccepted, submit, getPayload }) => (
          <div>
            <button onClick={submit}>{isAccepted ? "Accepted" : "I agree"}</button>
            <output>{getPayload()?.documents.length ?? 0}</output>
          </div>
        )}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "I agree" }));

    expect(screen.getByRole("button", { name: "Accepted" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(onAccept).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the simple flow controlled and calls onAccept once in Strict Mode", () => {
    const onAccept = vi.fn();
    const onChange = vi.fn();
    const { rerender } = render(
      <StrictMode>
        <AgreeFirst documents={documents} value={false} onChange={onChange} onAccept={onAccept} />
      </StrictMode>
    );

    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onAccept).toHaveBeenCalledOnce();

    rerender(
      <StrictMode>
        <AgreeFirst documents={documents} value={true} onChange={onChange} onAccept={onAccept} />
      </StrictMode>
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("keeps a supplied content document in the existing review flow", async () => {
    const onAccept = vi.fn();
    render(
      <AgreeFirst documents={[{ ...documents[0], content: <p>Terms</p> }]} requireScroll={false} onAccept={onAccept}>
        Continue
      </AgreeFirst>
    );

    fireEvent.click(screen.getByRole("checkbox"));
    const dialog = await screen.findByRole("dialog");
    expect(onAccept).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "I Accept" }));
    expect(dialog).toBeInTheDocument();
    expect(onAccept).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onAccept).toHaveBeenCalledOnce();
  });
});
