import { useId, useRef, useEffect, useCallback, useState, forwardRef } from "react";
import { createPortal } from "react-dom";
import { useScrollCompletion } from "../hooks/useScrollCompletion";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useAgreeFirst } from "../hooks/useAgreeFirst";
import type {
  AgreeFirstDocument,
  AgreeFirstClassNames,
  RenderProps,
  AgreeFirstProps,
} from "../types";

// Resolves a class string respecting unstyled mode.
// When unstyled=true, only user-provided overrides are applied.
function mkCls(unstyled: boolean) {
  return (defaultClass: string, override?: string) =>
    unstyled
      ? override ?? ""
      : [defaultClass, override].filter(Boolean).join(" ");
}

// ── Tab content ────────────────────────────────────────────────────────────────

interface TabContentProps {
  uid: string;
  doc: AgreeFirstDocument;
  tabIndex: number;
  totalDocs: number;
  initialCompleted: boolean;
  requireScroll: boolean;
  scrollHint: string;
  readFullText: string;
  cls: ReturnType<typeof mkCls>;
  classNames: AgreeFirstClassNames;
  onComplete: () => void;
  timeCompleted: boolean;
  onTimeComplete: () => void;
  minReadTimeMs?: number;
}

function TabContent({
  uid,
  doc,
  tabIndex,
  totalDocs,
  initialCompleted,
  requireScroll,
  scrollHint,
  readFullText,
  cls,
  classNames,
  onComplete,
  timeCompleted,
  onTimeComplete,
  minReadTimeMs,
}: TabContentProps) {
  const { hasScrolled, progress, containerRef } = useScrollCompletion(initialCompleted);
  const reported = useRef(initialCompleted);

  // Keep refs so the effects below don't need the callbacks in their dep arrays.
  // Without this, a parent re-render (e.g. scroll completion updating state) would
  // create new function references, causing useEffect to cancel and restart the timer.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onTimeCompleteRef = useRef(onTimeComplete);
  onTimeCompleteRef.current = onTimeComplete;

  useEffect(() => {
    if (hasScrolled && !reported.current) {
      reported.current = true;
      onCompleteRef.current();
    }
  }, [hasScrolled]);

  useEffect(() => {
    if (!minReadTimeMs || timeCompleted) return;
    const timer = setTimeout(() => onTimeCompleteRef.current(), minReadTimeMs);
    return () => clearTimeout(timer);
  }, [minReadTimeMs, timeCompleted]);

  const done = initialCompleted || hasScrolled;
  const displayProgress = initialCompleted ? 1 : progress;
  const hasTabs = totalDocs > 1;

  return (
    <>
      <div
        ref={containerRef}
        id={hasTabs ? `${uid}-panel` : undefined}
        role={hasTabs ? "tabpanel" : undefined}
        aria-labelledby={hasTabs ? `${uid}-tab-${tabIndex}` : undefined}
        className={cls("af-modal-scroll-area", classNames.modalScrollArea)}
        tabIndex={0}
        aria-label={hasTabs ? undefined : doc.title}
        onKeyDown={(e) => {
          // Only intercept when the scroll area itself is focused, not a child element
          if (e.target !== e.currentTarget) return;
          const el = e.currentTarget;
          const page = el.clientHeight * 0.8;
          switch (e.key) {
            case " ":
            case "PageDown": e.preventDefault(); el.scrollBy({ top: page, behavior: "smooth" }); break;
            case "PageUp":   e.preventDefault(); el.scrollBy({ top: -page, behavior: "smooth" }); break;
            case "ArrowDown": e.preventDefault(); el.scrollBy({ top: 60, behavior: "smooth" }); break;
            case "ArrowUp":   e.preventDefault(); el.scrollBy({ top: -60, behavior: "smooth" }); break;
            case "End":  e.preventDefault(); el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); break;
            case "Home": e.preventDefault(); el.scrollTo({ top: 0, behavior: "smooth" }); break;
          }
        }}
      >
        {doc.content}
      </div>

      <div
        className={cls("af-progress-bar", classNames.progressBar)}
        role="progressbar"
        aria-valuenow={Math.round(displayProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className={cls("af-progress-fill", classNames.progressFill)}
          style={{ width: `${displayProgress * 100}%` }}
        />
      </div>

      <div className={cls("af-modal-footer", classNames.modalFooter)}>
        <a
          className={cls("af-doc-link", classNames.docLink)}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {readFullText} ↗
        </a>
        {requireScroll && !done && (
          <span className={cls("af-scroll-hint", classNames.scrollHint)}>
            {scrollHint}
          </span>
        )}
      </div>
    </>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface TermsModalProps {
  documents: AgreeFirstDocument[];
  modalTitle: string;
  acceptText: string;
  continueText: string;
  scrollHint: string;
  readFullText: string;
  closeButtonLabel: string;
  requireScroll: boolean;
  activeTab: number;
  setActiveTab: (i: number) => void;
  scrollCompleted: Set<number>;
  markScrollCompleted: (i: number) => void;
  timeCompleted: Set<number>;
  markTimeCompleted: (i: number) => void;
  isFrontierTab: boolean;
  canAcceptCurrentTab: boolean;
  isTabAccessible: (i: number) => boolean;
  isTabAccepted: (i: number) => boolean;
  acceptTab: () => void;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  closeOnOverlayClick: boolean;
  isClosing: boolean;
  unstyled: boolean;
  classNames: AgreeFirstClassNames;
}

function TermsModal({
  documents,
  modalTitle,
  acceptText,
  continueText,
  scrollHint,
  readFullText,
  closeButtonLabel,
  requireScroll,
  activeTab,
  setActiveTab,
  scrollCompleted,
  markScrollCompleted,
  timeCompleted,
  markTimeCompleted,
  isFrontierTab,
  canAcceptCurrentTab,
  isTabAccessible,
  isTabAccepted,
  acceptTab,
  returnFocusTo,
  onClose,
  closeOnOverlayClick,
  isClosing,
  unstyled,
  classNames,
}: TermsModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const uid = useId().replace(/:/g, "");
  const cls = mkCls(unstyled);
  const isLastTab = activeTab === documents.length - 1;
  const hasTabs = documents.length > 1;

  const { containerRef } = useFocusTrap({ onEscape: onClose, returnFocusTo });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleComplete = useCallback(
    (index: number) => { markScrollCompleted(index); },
    [markScrollCompleted]
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className={[cls("af-overlay", classNames.overlay), isClosing ? "af-closing" : ""].filter(Boolean).join(" ")}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={containerRef}
        className={cls("af-modal", classNames.modal)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        tabIndex={-1}
      >
        {/* Screen-reader announcement for tab changes */}
        {hasTabs && (
          <div aria-live="polite" aria-atomic="true" className="af-sr-only">
            {`${documents[activeTab].title} — ${activeTab + 1} of ${documents.length}`}
          </div>
        )}

        {/* Header */}
        <div className={cls("af-modal-header", classNames.modalHeader)}>
          <span
            id={`${uid}-title`}
            className={cls("af-modal-title", classNames.modalTitle)}
          >
            {modalTitle}
          </span>
          <button
            className={cls("af-modal-close", classNames.modalClose)}
            onClick={onClose}
            aria-label={closeButtonLabel}
          >
            ✕
          </button>
        </div>

        {/* Tabs — N documents */}
        {hasTabs && (
          <div
            className={cls("af-tabs", classNames.tabs)}
            role="tablist"
            aria-label="Documents"
          >
            {documents.map((doc, i) => {
              const accepted = isTabAccepted(i);
              const accessible = isTabAccessible(i);
              const isActive = activeTab === i;
              return (
                <button
                  key={i}
                  id={`${uid}-tab-${i}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={isActive ? `${uid}-panel` : undefined}
                  disabled={!accessible}
                  className={[
                    cls("af-tab", classNames.tab),
                    isActive ? cls("af-tab--active", classNames.tabActive) : "",
                    accepted ? cls("af-tab--done", classNames.tabDone) : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => accessible && setActiveTab(i)}
                >
                  {accepted && <span aria-hidden="true">✓ </span>}
                  {doc.title}
                </button>
              );
            })}
          </div>
        )}

        {/* Active tab content — key remounts on tab switch */}
        <TabContent
          key={activeTab}
          uid={uid}
          doc={documents[activeTab]}
          tabIndex={activeTab}
          totalDocs={documents.length}
          initialCompleted={scrollCompleted.has(activeTab)}
          requireScroll={requireScroll}
          scrollHint={scrollHint}
          readFullText={readFullText}
          cls={cls}
          classNames={classNames}
          onComplete={() => handleComplete(activeTab)}
          timeCompleted={timeCompleted.has(activeTab)}
          onTimeComplete={() => markTimeCompleted(activeTab)}
          minReadTimeMs={documents[activeTab]?.minReadTimeMs}
        />

        {/* Accept row */}
        <div className={cls("af-modal-accept-row", classNames.modalAcceptRow)}>
          {isFrontierTab ? (
            <button
              className={cls("af-modal-accept", classNames.acceptButton)}
              onClick={acceptTab}
              disabled={!canAcceptCurrentTab}
              aria-disabled={!canAcceptCurrentTab}
            >
              {isLastTab ? acceptText : continueText}
            </button>
          ) : (
            <span className={cls("af-accepted-badge", classNames.acceptBadge)}>
              ✓ Accepted
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Default label ──────────────────────────────────────────────────────────────

function DefaultLabel({
  documents,
  linkClass,
}: {
  documents: AgreeFirstDocument[];
  linkClass?: string;
}) {
  const makeLink = (doc: AgreeFirstDocument) => (
    <a
      className={["af-label-link", linkClass].filter(Boolean).join(" ")}
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {doc.title}
    </a>
  );

  if (documents.length === 1) {
    return <>I have read and agree to the {makeLink(documents[0])}</>;
  }

  const links = documents.map((doc, i) => (
    <span key={i}>
      {i > 0 && (i === documents.length - 1 ? " and " : ", ")}
      {makeLink(doc)}
    </span>
  ));

  return <>I have read and agree to the {links}</>;
}

// ── AgreeFirst ─────────────────────────────────────────────────────────────────

/**
 * The ref is forwarded to a visually-hidden checkbox input, enabling:
 * - React Hook Form to focus the field on validation error
 * - Native HTML form submission (field appears in FormData)
 * Pass `name` to activate both behaviours.
 */
const CLOSE_ANIMATION_MS = 200;

export const AgreeFirst = forwardRef<HTMLInputElement, AgreeFirstProps>(
  function AgreeFirst(
    {
      documents,
      children,
      onAccept,
      onOpen,
      render,
      consentId,
      label,
      modalTitle,
      acceptText = "I Accept",
      continueText = "Accept & Continue →",
      scrollHint = "↓ Scroll to the bottom to continue",
      readFullText = "Read full document",
      requireScroll = true,
      requireCheckbox = true,
      unstyled = false,
      className,
      classNames = {},
      onScrollProgress,
      onDecline,
      previousPayload,
      storageKey,
      closeOnOverlayClick = true,
      strings,
      value,
      onChange,
      onBlur,
      name,
    }: AgreeFirstProps,
    ref
  ) {
    const cls = mkCls(unstyled);

    // strings object overrides individual props
    const resolvedAcceptText = strings?.acceptText ?? acceptText;
    const resolvedContinueText = strings?.continueText ?? continueText;
    const resolvedScrollHint = strings?.scrollHint ?? scrollHint;
    const resolvedReadFullText = strings?.readFullText ?? readFullText;
    const resolvedModalTitle = strings?.modalTitle ?? modalTitle;
    const resolvedCloseText = strings?.closeText ?? "Close";

    const {
      isModalOpen,
      openModal,
      closeModal,
      isAccepted,
      activeTab,
      setActiveTab,
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
    } = useAgreeFirst({
      documents,
      requireScroll,
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
    });

    // Save the element that triggered the modal so focus returns to it on close
    const triggerRef = useRef<HTMLElement | null>(null);

    const handleOpenModal = useCallback(() => {
      triggerRef.current = document.activeElement as HTMLElement;
      openModal();
    }, [openModal]);

    // Keep the modal mounted briefly after close so the exit animation can play
    const [renderedOpen, setRenderedOpen] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);

    useEffect(() => {
      if (isModalOpen) {
        setRenderedOpen(true);
        setAnimatingOut(false);
        return;
      }
      if (renderedOpen) {
        setAnimatingOut(true);
        const t = setTimeout(() => {
          setRenderedOpen(false);
          setAnimatingOut(false);
        }, CLOSE_ANIMATION_MS);
        return () => clearTimeout(t);
      }
    // renderedOpen intentionally omitted: we only want this to re-run when
    // isModalOpen changes, not when renderedOpen changes (that would loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen]);

    const defaultModalTitle =
      documents.length === 1 ? documents[0].title : "Terms & Privacy";

    const modal = renderedOpen ? (
      <TermsModal
        documents={documents}
        modalTitle={resolvedModalTitle ?? defaultModalTitle}
        acceptText={resolvedAcceptText}
        continueText={resolvedContinueText}
        scrollHint={resolvedScrollHint}
        readFullText={resolvedReadFullText}
        closeButtonLabel={resolvedCloseText}
        requireScroll={requireScroll}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollCompleted={scrollCompleted}
        markScrollCompleted={markScrollCompleted}
        timeCompleted={timeCompleted}
        markTimeCompleted={markTimeCompleted}
        isFrontierTab={isFrontierTab}
        canAcceptCurrentTab={canAcceptCurrentTab}
        isTabAccessible={isTabAccessible}
        isTabAccepted={isTabAccepted}
        acceptTab={acceptTab}
        returnFocusTo={triggerRef.current}
        onClose={closeModal}
        closeOnOverlayClick={closeOnOverlayClick}
        isClosing={animatingOut}
        unstyled={unstyled}
        classNames={classNames}
      />
    ) : null;

    // Headless / render-prop mode
    if (render) {
      const renderProps: RenderProps = {
        isAccepted,
        isModalOpen,
        openModal: handleOpenModal,
        closeModal,
        canSubmit,
        submit,
        reset,
        scrollProgress,
        needsReAcceptance,
        getPayload,
      };
      return (
        <>
          {render(renderProps)}
          {modal}
        </>
      );
    }

    // Default UI
    return (
      <div className={cls("af-container", [className, classNames.container].filter(Boolean).join(" "))}>
        {/*
          Hidden checkbox: forwards ref for RHF focus-on-error and enables native
          form submission. Only rendered when name prop is provided.
        */}
        {name && (
          <input
            ref={ref}
            type="checkbox"
            name={name}
            checked={isAccepted}
            onChange={() => {}}
            aria-hidden="true"
            tabIndex={-1}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
          />
        )}

        {requireCheckbox && (
          <label className={cls("af-checkbox-wrapper", classNames.checkboxWrapper)}>
            <input
              type="checkbox"
              className={cls("af-checkbox", classNames.checkbox)}
              checked={isAccepted}
              onChange={(e) => {
                if (e.target.checked) handleOpenModal();
              }}
            />
            <span
              className={cls("af-label", classNames.label)}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === "A") return;
                handleOpenModal();
              }}
            >
              {label ?? (
                <DefaultLabel
                  documents={documents}
                  linkClass={classNames.labelLink}
                />
              )}
            </span>
          </label>
        )}

        {children !== undefined && (
          <button
            className={cls("af-button", classNames.button)}
            onClick={() => {
              // When requireCheckbox=false, button opens modal until accepted, then submits
              if (!requireCheckbox && !isAccepted) handleOpenModal();
              else submit();
            }}
            disabled={requireCheckbox ? !canSubmit : false}
            aria-disabled={requireCheckbox ? !canSubmit : false}
          >
            {children}
          </button>
        )}

        {modal}
      </div>
    );
  }
);
