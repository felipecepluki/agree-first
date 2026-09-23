import type { ReactNode } from "react";

export interface AgreeFirstDocument {
  title: string;
  content: ReactNode;
  url: string;
  version?: string;
  type?: "terms" | "privacy" | "policy" | "custom";
  minReadTimeMs?: number;
}

export interface AcceptPayload {
  id: string;
  timestamp: string;
  documents: Array<{
    title: string;
    url: string;
    version?: string;
    type?: string;
  }>;
  scrollCompleted: number[];
  userAgent?: string;
}

export interface AgreeFirstClassNames {
  // Outer
  container?: string;
  checkboxWrapper?: string;
  checkbox?: string;
  label?: string;
  labelLink?: string;
  button?: string;
  // Modal
  overlay?: string;
  modal?: string;
  modalHeader?: string;
  modalTitle?: string;
  modalClose?: string;
  modalScrollArea?: string;
  modalFooter?: string;
  // Tabs
  tabs?: string;
  tab?: string;
  tabActive?: string;
  tabDone?: string;
  // Progress
  progressBar?: string;
  progressFill?: string;
  // Accept row
  modalAcceptRow?: string;
  acceptButton?: string;
  acceptBadge?: string;
  docLink?: string;
  scrollHint?: string;
}

export interface AgreeFirstStrings {
  acceptText?: string;
  acceptedText?: string;
  continueText?: string;
  scrollHint?: string;
  readFullText?: string;
  modalTitle?: string;
  closeText?: string;
  tabsLabel?: string;
  scrollProgressLabel?: string;
  formatDocumentPosition?: (current: number, total: number) => string;
}

export interface RenderProps {
  isAccepted: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  canSubmit: boolean;
  submit: () => void;
  reset: () => void;
  scrollProgress: number;
  needsReAcceptance: boolean;
  getPayload: () => AcceptPayload | null;
}

export interface UseAgreeFirstOptions {
  documents: AgreeFirstDocument[];
  requireScroll?: boolean;
  consentId?: string;
  onAccept?: (payload?: AcceptPayload) => void;
  onOpen?: () => void;
  onScrollProgress?: (progress: number) => void;
  onDecline?: () => void;
  previousPayload?: AcceptPayload;
  storageKey?: string;
  value?: boolean;
  onChange?: (accepted: boolean) => void;
  onBlur?: () => void;
}

export interface AgreeFirstProps {
  documents: AgreeFirstDocument[];
  children?: ReactNode;
  onAccept?: (payload?: AcceptPayload) => void;
  onOpen?: () => void;
  render?: (props: RenderProps) => ReactNode;
  consentId?: string;
  label?: ReactNode;
  modalTitle?: string;
  acceptText?: string;
  continueText?: string;
  scrollHint?: string;
  readFullText?: string;
  requireScroll?: boolean;
  requireCheckbox?: boolean;
  unstyled?: boolean;
  className?: string;
  classNames?: AgreeFirstClassNames;
  onScrollProgress?: (progress: number) => void;
  onDecline?: () => void;
  previousPayload?: AcceptPayload;
  storageKey?: string;
  closeOnOverlayClick?: boolean;
  strings?: AgreeFirstStrings;
  value?: boolean;
  onChange?: (accepted: boolean) => void;
  onBlur?: () => void;
  name?: string;
}
