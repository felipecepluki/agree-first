import { useState, useRef, useCallback, useEffect } from "react";
import type { AcceptPayload, AgreeFirstDocument, UseAgreeFirstOptions } from "../types";

function generateConsentId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function matchesPrevious(docs: AgreeFirstDocument[], prev?: AcceptPayload): boolean {
  if (!prev || docs.length === 0) return false;
  return docs.every((doc) => {
    const prevDoc = prev.documents.find((d) => d.url === doc.url);
    return prevDoc !== undefined && prevDoc.version === doc.version;
  });
}

function readStorage(key: string): AcceptPayload | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AcceptPayload) : undefined;
  } catch {
    return undefined;
  }
}

function writeStorage(key: string, payload: AcceptPayload): void {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

export function useAgreeFirst({
  documents,
  requireScroll = true,
  consentId,
  onAccept,
  onOpen,
  onScrollProgress,
  onDecline,
  previousPayload,
  storageKey,
  value,
  onChange,
  onBlur,
}: UseAgreeFirstOptions) {
  const isControlled = value !== undefined;

  // useState initializer runs exactly once on mount — correct semantic for reading
  // external storage. useMemo with [] is not guaranteed to run only once by React.
  const [storedPayload] = useState<AcceptPayload | undefined>(() => {
    if (!storageKey || previousPayload || typeof window === "undefined") return undefined;
    return readStorage(storageKey);
  });

  const effectivePayload = previousPayload ?? storedPayload;
  const allMatch = matchesPrevious(documents, effectivePayload);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internalIsAccepted, setInternalIsAccepted] = useState(allMatch);
  const [activeTab, setActiveTab] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(allMatch ? documents.length : 0);
  const [scrollCompleted, setScrollCompleted] = useState<Set<number>>(new Set());
  const [timeCompleted, setTimeCompleted] = useState<Set<number>>(new Set());
  const reportedScrollCount = useRef(0);

  // In controlled mode, external value drives isAccepted; internal state tracks modal progress
  const isAccepted = isControlled ? (value as boolean) : internalIsAccepted;

  const onAcceptRef = useRef<((payload?: AcceptPayload) => void) | undefined>(onAccept);
  useEffect(() => { onAcceptRef.current = onAccept; });

  const onOpenRef = useRef<(() => void) | undefined>(onOpen);
  useEffect(() => { onOpenRef.current = onOpen; });

  const onScrollProgressRef = useRef<((progress: number) => void) | undefined>(onScrollProgress);
  useEffect(() => { onScrollProgressRef.current = onScrollProgress; });

  useEffect(() => {
    const count = scrollCompleted.size;
    if (count > reportedScrollCount.current) {
      onScrollProgressRef.current?.(count / documents.length);
    }
    reportedScrollCount.current = count;
  }, [scrollCompleted, documents.length]);

  const onDeclineRef = useRef<(() => void) | undefined>(onDecline);
  useEffect(() => { onDeclineRef.current = onDecline; });

  const onChangeRef = useRef<((accepted: boolean) => void) | undefined>(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  const onBlurRef = useRef<(() => void) | undefined>(onBlur);
  useEffect(() => { onBlurRef.current = onBlur; });

  const pendingPayload = useRef<AcceptPayload | null>(null);

  // Validate after all hooks so hook count stays consistent across renders
  if (documents.length === 0) {
    throw new Error("[agree-first] documents must not be empty");
  }

  useEffect(() => {
    if (allMatch && effectivePayload) {
      pendingPayload.current = effectivePayload;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled mode: sync internal state when external value resets to false
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (isControlled && prevValueRef.current === true && value === false) {
      setInternalIsAccepted(false);
      setActiveTab(0);
      setAcceptedCount(0);
      setScrollCompleted(new Set());
      setTimeCompleted(new Set());
      pendingPayload.current = null;
    }
    prevValueRef.current = value;
  });

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    onOpenRef.current?.();
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    if (!pendingPayload.current) {
      onDeclineRef.current?.();
    }
    // Always fires onBlur — marks field as touched in form libraries
    onBlurRef.current?.();
  }, []);

  const markScrollCompleted = useCallback((i: number) => {
    setScrollCompleted((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }, []);

  const markTimeCompleted = useCallback((i: number) => {
    setTimeCompleted((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }, []);

  const isFrontierTab = activeTab === acceptedCount;
  const canAcceptCurrentTab = (() => {
    if (!isFrontierTab) return false;
    const doc = documents[activeTab];
    const scrollOk = !requireScroll || scrollCompleted.has(activeTab);
    const timeOk = !doc?.minReadTimeMs || timeCompleted.has(activeTab);
    return scrollOk && timeOk;
  })();

  const isTabAccessible = useCallback(
    (i: number) => i <= acceptedCount,
    [acceptedCount]
  );

  const isTabAccepted = useCallback(
    (i: number) => i < acceptedCount,
    [acceptedCount]
  );

  const acceptTab = useCallback(() => {
    if (!canAcceptCurrentTab) return;

    const nextCount = acceptedCount + 1;
    setAcceptedCount(nextCount);

    if (nextCount === documents.length) {
      const payload: AcceptPayload = {
        id: consentId ?? generateConsentId(),
        timestamp: new Date().toISOString(),
        documents: documents.map((d: AgreeFirstDocument) => ({
          title: d.title,
          url: d.url,
          ...(d.version !== undefined ? { version: d.version } : {}),
          ...(d.type !== undefined ? { type: d.type } : {}),
        })),
        scrollCompleted: Array.from(scrollCompleted),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      };
      pendingPayload.current = payload;

      if (storageKey && typeof window !== "undefined") {
        writeStorage(storageKey, payload);
      }

      if (!isControlled) setInternalIsAccepted(true);
      onChangeRef.current?.(true);  // notify form library
      onBlurRef.current?.();         // modal closing — mark as touched

      setIsModalOpen(false);
    } else {
      setActiveTab(nextCount);
    }
  }, [canAcceptCurrentTab, acceptedCount, documents, scrollCompleted, activeTab, consentId, storageKey, isControlled]);

  const submit = useCallback(() => {
    onAcceptRef.current?.(pendingPayload.current ?? undefined);
  }, []);

  const getPayload = useCallback(() => pendingPayload.current, []);

  const canSubmit = isAccepted;

  const reset = useCallback(() => {
    setIsModalOpen(false);
    setInternalIsAccepted(false);
    setActiveTab(0);
    setAcceptedCount(0);
    setScrollCompleted(new Set());
    setTimeCompleted(new Set());
    pendingPayload.current = null;
    onChangeRef.current?.(false); // notify form library of reset
  }, []);

  const scrollProgress = scrollCompleted.size / documents.length;
  const needsReAcceptance = !!effectivePayload && !allMatch;

  return {
    isModalOpen,
    openModal,
    closeModal,
    isAccepted,
    activeTab,
    setActiveTab,
    acceptedCount,
    scrollCompleted,
    markScrollCompleted,
    timeCompleted,
    markTimeCompleted,
    isFrontierTab,
    canAcceptCurrentTab,
    isTabAccessible,
    isTabAccepted,
    acceptTab,
    submit,
    getPayload,
    canSubmit,
    reset,
    scrollProgress,
    needsReAcceptance,
  };
}
