import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAgreeFirst } from "../hooks/useAgreeFirst";
import type { AcceptPayload, AgreeFirstDocument } from "../types";

const DOCS: AgreeFirstDocument[] = [
  { title: "Terms of Service", content: null as any, url: "https://example.com/tos", version: "1.0" },
];

const MULTI_DOCS: AgreeFirstDocument[] = [
  { title: "Terms of Service", content: null as any, url: "https://example.com/tos", version: "1.0" },
  { title: "Privacy Policy", content: null as any, url: "https://example.com/privacy", version: "2.0" },
];

beforeEach(() => {
  localStorage.clear();
});

describe("useAgreeFirst", () => {
  it("initial state: not accepted, modal closed", () => {
    const { result } = renderHook(() => useAgreeFirst({ documents: DOCS }));

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.acceptedCount).toBe(0);
    expect(result.current.activeTab).toBe(0);
    expect(result.current.scrollCompleted.size).toBe(0);
    expect(result.current.needsReAcceptance).toBe(false);
    expect(result.current.scrollProgress).toBe(0);
  });

  it("openModal sets isModalOpen to true", () => {
    const { result } = renderHook(() => useAgreeFirst({ documents: DOCS }));

    act(() => { result.current.openModal(); });

    expect(result.current.isModalOpen).toBe(true);
  });

  it("closeModal sets isModalOpen to false", () => {
    const { result } = renderHook(() => useAgreeFirst({ documents: DOCS }));

    act(() => { result.current.openModal(); });
    act(() => { result.current.closeModal(); });

    expect(result.current.isModalOpen).toBe(false);
  });

  it("markScrollCompleted → canAcceptCurrentTab becomes true", () => {
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: true })
    );

    expect(result.current.canAcceptCurrentTab).toBe(false);

    act(() => { result.current.markScrollCompleted(0); });

    expect(result.current.canAcceptCurrentTab).toBe(true);
    expect(result.current.scrollCompleted.has(0)).toBe(true);
  });

  it("acceptTab on single doc → isAccepted becomes true and payload generated", () => {
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: true })
    );

    act(() => { result.current.markScrollCompleted(0); });
    act(() => { result.current.acceptTab(); });

    expect(result.current.isAccepted).toBe(true);
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.acceptedCount).toBe(1);
  });

  it("acceptTab on multi-doc → advances to next tab", () => {
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: MULTI_DOCS, requireScroll: true })
    );

    act(() => { result.current.markScrollCompleted(0); });
    act(() => { result.current.acceptTab(); });

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.activeTab).toBe(1);
    expect(result.current.acceptedCount).toBe(1);
  });

  it("submit calls onAccept with correct payload", () => {
    const onAccept = vi.fn();
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: true, onAccept })
    );

    act(() => { result.current.markScrollCompleted(0); });
    act(() => { result.current.acceptTab(); });
    act(() => { result.current.submit(); });

    expect(onAccept).toHaveBeenCalledOnce();
    const payload = onAccept.mock.calls[0][0] as AcceptPayload;
    expect(payload).toBeDefined();
    expect(payload.documents).toHaveLength(1);
    expect(payload.documents[0].url).toBe("https://example.com/tos");
    expect(payload.documents[0].version).toBe("1.0");
    expect(payload.scrollCompleted).toContain(0);
    expect(typeof payload.timestamp).toBe("string");
    expect(typeof payload.id).toBe("string");
  });

  it("reset resets all state", () => {
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: true })
    );

    act(() => { result.current.openModal(); });
    act(() => { result.current.markScrollCompleted(0); });
    act(() => { result.current.acceptTab(); });
    act(() => { result.current.reset(); });

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.activeTab).toBe(0);
    expect(result.current.acceptedCount).toBe(0);
    expect(result.current.scrollCompleted.size).toBe(0);
    expect(result.current.timeCompleted.size).toBe(0);
  });

  it("previousPayload with matching versions → auto-accepts", () => {
    const previousPayload: AcceptPayload = {
      id: "c_prev_123",
      timestamp: "2026-01-01T00:00:00.000Z",
      documents: [{ title: "Terms of Service", url: "https://example.com/tos", version: "1.0" }],
      scrollCompleted: [0],
    };

    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, previousPayload })
    );

    expect(result.current.isAccepted).toBe(true);
    expect(result.current.acceptedCount).toBe(DOCS.length);
    expect(result.current.needsReAcceptance).toBe(false);
  });

  it("previousPayload with version mismatch → needsReAcceptance = true", () => {
    const previousPayload: AcceptPayload = {
      id: "c_prev_456",
      timestamp: "2026-01-01T00:00:00.000Z",
      documents: [{ title: "Terms of Service", url: "https://example.com/tos", version: "0.9" }],
      scrollCompleted: [0],
    };

    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, previousPayload })
    );

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.needsReAcceptance).toBe(true);
  });

  it("onDecline is called when closing without accepting", () => {
    const onDecline = vi.fn();
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, onDecline })
    );

    act(() => { result.current.openModal(); });
    act(() => { result.current.closeModal(); });

    expect(onDecline).toHaveBeenCalledOnce();
  });

  it("onDecline is NOT called after accepting", () => {
    const onDecline = vi.fn();
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: false, onDecline })
    );

    act(() => { result.current.acceptTab(); });
    act(() => { result.current.closeModal(); });

    expect(onDecline).not.toHaveBeenCalled();
  });

  it("scrollProgress updates as docs are scrolled", () => {
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: MULTI_DOCS, requireScroll: true })
    );

    expect(result.current.scrollProgress).toBe(0);

    act(() => { result.current.markScrollCompleted(0); });
    expect(result.current.scrollProgress).toBe(0.5);

    act(() => { result.current.markScrollCompleted(1); });
    expect(result.current.scrollProgress).toBe(1);
  });

  it("canAcceptCurrentTab is false when requireScroll=false but minReadTimeMs not elapsed", () => {
    const timedDocs: AgreeFirstDocument[] = [
      { title: "Terms", content: null as any, url: "https://example.com/tos", minReadTimeMs: 5000 },
    ];
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: timedDocs, requireScroll: false })
    );

    expect(result.current.canAcceptCurrentTab).toBe(false);

    act(() => { result.current.markTimeCompleted(0); });

    expect(result.current.canAcceptCurrentTab).toBe(true);
  });

  it("reset also resets timeCompleted", () => {
    const timedDocs: AgreeFirstDocument[] = [
      { title: "Terms", content: null as any, url: "https://example.com/tos", minReadTimeMs: 1000 },
    ];
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: timedDocs, requireScroll: false })
    );

    act(() => { result.current.markTimeCompleted(0); });
    expect(result.current.timeCompleted.size).toBe(1);

    act(() => { result.current.reset(); });
    expect(result.current.timeCompleted.size).toBe(0);
  });

  it("canSubmit is false until terms are accepted in modal", () => {
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: false })
    );

    // Should NOT be submittable before accepting in modal
    expect(result.current.canSubmit).toBe(false);

    act(() => { result.current.acceptTab(); });

    expect(result.current.canSubmit).toBe(true);
  });

  it("getPayload returns null before accept and payload after", () => {
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: false })
    );

    expect(result.current.getPayload()).toBeNull();

    act(() => { result.current.acceptTab(); });

    const payload = result.current.getPayload();
    expect(payload).not.toBeNull();
    expect(payload?.documents[0].url).toBe("https://example.com/tos");
  });

  it("storageKey: saves payload to localStorage after accept", () => {
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: false, storageKey: "test_consent" })
    );

    act(() => { result.current.acceptTab(); });

    const stored = localStorage.getItem("test_consent");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!) as AcceptPayload;
    expect(parsed.documents[0].url).toBe("https://example.com/tos");
  });

  it("storageKey: auto-accepts on remount when stored payload matches", () => {
    const storedPayload: AcceptPayload = {
      id: "c_stored",
      timestamp: "2026-01-01T00:00:00.000Z",
      documents: [{ title: "Terms of Service", url: "https://example.com/tos", version: "1.0" }],
      scrollCompleted: [0],
    };
    localStorage.setItem("test_consent", JSON.stringify(storedPayload));

    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, storageKey: "test_consent" })
    );

    expect(result.current.isAccepted).toBe(true);
    expect(result.current.needsReAcceptance).toBe(false);
  });

  it("storageKey: needsReAcceptance=true when stored version is outdated", () => {
    const outdatedPayload: AcceptPayload = {
      id: "c_old",
      timestamp: "2026-01-01T00:00:00.000Z",
      documents: [{ title: "Terms of Service", url: "https://example.com/tos", version: "0.8" }],
      scrollCompleted: [0],
    };
    localStorage.setItem("test_consent", JSON.stringify(outdatedPayload));

    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, storageKey: "test_consent" })
    );

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.needsReAcceptance).toBe(true);
  });

  it("empty documents throws", () => {
    expect(() =>
      renderHook(() => useAgreeFirst({ documents: [] }))
    ).toThrow("[agree-first] documents must not be empty");
  });

  // ── Form library integration ─────────────────────────────────────────────────

  it("onOpen fires when modal is opened", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, onOpen })
    );

    expect(onOpen).not.toHaveBeenCalled();

    act(() => { result.current.openModal(); });

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("onChange(true) fires after all tabs accepted", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: false, onChange })
    );

    act(() => { result.current.acceptTab(); });

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("onChange(false) fires on reset", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: false, onChange })
    );

    act(() => { result.current.acceptTab(); });
    act(() => { result.current.reset(); });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("onBlur fires when modal closes after accept", () => {
    const onBlur = vi.fn();
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, requireScroll: false, onBlur })
    );

    act(() => { result.current.acceptTab(); });

    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("onBlur fires when modal is dismissed without accepting", () => {
    const onBlur = vi.fn();
    const { result } = renderHook(() =>
      useAgreeFirst({ documents: DOCS, onBlur })
    );

    act(() => { result.current.openModal(); });
    act(() => { result.current.closeModal(); });

    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("controlled mode: isAccepted follows external value", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: boolean }) =>
        useAgreeFirst({ documents: DOCS, value }),
      { initialProps: { value: false } }
    );

    expect(result.current.isAccepted).toBe(false);

    rerender({ value: true });
    expect(result.current.isAccepted).toBe(true);

    rerender({ value: false });
    expect(result.current.isAccepted).toBe(false);
  });

  it("controlled mode: external reset (true→false) resets internal modal state", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: boolean }) =>
        useAgreeFirst({ documents: DOCS, requireScroll: false, value }),
      { initialProps: { value: false } }
    );

    // Simulate acceptance via modal
    act(() => { result.current.acceptTab(); });
    expect(result.current.acceptedCount).toBe(1);

    // Simulate the form library reflecting onChange(true) back into value
    rerender({ value: true });
    expect(result.current.acceptedCount).toBe(1);

    // Simulate form.reset() — value goes true → false
    rerender({ value: false });

    expect(result.current.acceptedCount).toBe(0);
    expect(result.current.scrollCompleted.size).toBe(0);
    expect(result.current.getPayload()).toBeNull();
  });
});
