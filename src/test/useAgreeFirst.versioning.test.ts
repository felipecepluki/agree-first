import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAgreeFirst } from "../hooks/useAgreeFirst";
import type { AcceptPayload, AgreeFirstDocument } from "../types";

const terms: AgreeFirstDocument = { title: "Terms", url: "/terms", version: "1.3" };
const privacy: AgreeFirstDocument = { title: "Privacy", url: "/privacy", version: "2.0" };

function previous(documents: AcceptPayload["documents"]): AcceptPayload {
  return {
    id: "a-previous",
    timestamp: "2026-09-20T12:00:00.000Z",
    documents,
    scrollCompleted: [],
  };
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("versioned agreement matching", () => {
  it("accepts the same URLs and versions across multiple documents, regardless of order", () => {
    const payload = previous([
      { title: "Old Privacy title", url: "/privacy", version: "2.0" },
      { title: "Old Terms title", url: "/terms", version: "1.3" },
    ]);
    const { result } = renderHook(() => useAgreeFirst({ documents: [terms, privacy], previousPayload: payload }));

    expect(result.current.isAccepted).toBe(true);
    expect(result.current.needsReAcceptance).toBe(false);
    expect(result.current.getPayload()).toEqual(payload);
  });

  it("requires re-acceptance when one of multiple documents has a new version", () => {
    const payload = previous([
      { title: "Terms", url: "/terms", version: "1.2" },
      { title: "Privacy", url: "/privacy", version: "2.0" },
    ]);
    const { result } = renderHook(() => useAgreeFirst({ documents: [terms, privacy], previousPayload: payload }));

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.needsReAcceptance).toBe(true);
  });

  it("requires acceptance for a newly added document", () => {
    const payload = previous([{ title: "Terms", url: "/terms", version: "1.3" }]);
    const { result } = renderHook(() => useAgreeFirst({ documents: [terms, privacy], previousPayload: payload }));

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.needsReAcceptance).toBe(true);
  });

  it("does not require re-acceptance when an old document is removed", () => {
    const payload = previous([
      { title: "Terms", url: "/terms", version: "1.3" },
      { title: "Privacy", url: "/privacy", version: "2.0" },
    ]);
    const { result } = renderHook(() => useAgreeFirst({ documents: [terms], previousPayload: payload }));

    expect(result.current.isAccepted).toBe(true);
    expect(result.current.needsReAcceptance).toBe(false);
  });

  it("matches omitted versions only when both records omit them", () => {
    const unversioned = { title: "Terms", url: "/terms" };
    const payload = previous([unversioned]);
    const matching = renderHook(() => useAgreeFirst({ documents: [unversioned], previousPayload: payload }));
    expect(matching.result.current.isAccepted).toBe(true);
    matching.unmount();

    const changed = renderHook(() => useAgreeFirst({ documents: [terms], previousPayload: payload }));
    expect(changed.result.current.isAccepted).toBe(false);
    expect(changed.result.current.needsReAcceptance).toBe(true);
  });

  it("does not trust an incomplete previous payload", () => {
    const incomplete = { documents: [{ title: "Terms", url: "/terms", version: "1.3" }] } as AcceptPayload;
    const { result } = renderHook(() => useAgreeFirst({ documents: [terms], previousPayload: incomplete }));

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.needsReAcceptance).toBe(true);
  });

  it("uses previousPayload ahead of an older localStorage record", () => {
    localStorage.setItem("agreement", JSON.stringify(previous([{ title: "Terms", url: "/terms", version: "1.2" }])));
    const payload = previous([{ title: "Terms", url: "/terms", version: "1.3" }]);
    const { result } = renderHook(() => useAgreeFirst({ documents: [terms], previousPayload: payload, storageKey: "agreement" }));

    expect(result.current.isAccepted).toBe(true);
    expect(result.current.getPayload()).toEqual(payload);
  });

  it("ignores invalid JSON and does not crash on a parseable but malformed stored payload", () => {
    localStorage.setItem("agreement", "{invalid");
    const invalidJson = renderHook(() => useAgreeFirst({ documents: [terms], storageKey: "agreement" }));
    expect(invalidJson.result.current.isAccepted).toBe(false);
    invalidJson.unmount();

    localStorage.setItem("agreement", JSON.stringify({ documents: [null] }));
    const invalidShape = renderHook(() => useAgreeFirst({ documents: [terms], storageKey: "agreement" }));
    expect(invalidShape.result.current.isAccepted).toBe(false);
    expect(invalidShape.result.current.needsReAcceptance).toBe(true);
  });

  it("keeps working when localStorage reads and writes are unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    const onAccept = vi.fn();
    const { result } = renderHook(() => useAgreeFirst({ documents: [terms], storageKey: "agreement", onAccept }));

    expect(result.current.isAccepted).toBe(false);
    act(() => result.current.submit());
    expect(result.current.isAccepted).toBe(true);
    expect(onAccept).toHaveBeenCalledOnce();
  });

  it("rejects a mixed list and review timing without content", () => {
    expect(() => renderHook(() => useAgreeFirst({ documents: [terms, { ...privacy, content: null }] })))
      .toThrow("provide content for every document");
    expect(() => renderHook(() => useAgreeFirst({ documents: [{ ...terms, minReadTimeMs: 1000 }] })))
      .toThrow("minReadTimeMs requires document content");
  });
});
