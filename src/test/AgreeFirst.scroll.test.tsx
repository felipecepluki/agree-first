import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { AgreeFirst } from "../components/AgreeFirst";
import type { AgreeFirstDocument } from "../types";

const DOCUMENTS: AgreeFirstDocument[] = [
  { title: "Terms", content: <p>Terms content</p>, url: "/terms" },
  { title: "Privacy", content: <p>Privacy content</p>, url: "/privacy" },
];

const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");

function restoreDescriptor(property: "clientHeight" | "scrollHeight", descriptor?: PropertyDescriptor) {
  if (descriptor) Object.defineProperty(HTMLElement.prototype, property, descriptor);
  else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[property];
}

function setScrollTop(element: HTMLElement, value: number) {
  Object.defineProperty(element, "scrollTop", {
    configurable: true,
    writable: true,
    value,
  });
}

beforeEach(() => {
  Object.defineProperties(HTMLElement.prototype, {
    clientHeight: {
      configurable: true,
      get() {
        return this.classList.contains("af-modal-scroll-area") ? 200 : 0;
      },
    },
    scrollHeight: {
      configurable: true,
      get() {
        return this.classList.contains("af-modal-scroll-area") ? 1_000 : 0;
      },
    },
  });
});

afterEach(() => {
  restoreDescriptor("clientHeight", originalClientHeight);
  restoreDescriptor("scrollHeight", originalScrollHeight);
});

describe("AgreeFirst scroll flow", () => {
  it("requires scroll completion independently for every document", async () => {
    render(
      <AgreeFirst documents={DOCUMENTS} requireCheckbox={false}>
        Continue
      </AgreeFirst>
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const dialog = await screen.findByRole("dialog");
    const firstPanel = within(dialog).getByRole("tabpanel");
    const continueButton = within(dialog).getByRole("button", { name: "Accept & Continue →" });

    expect(continueButton).toBeDisabled();

    setScrollTop(firstPanel, 790);
    fireEvent.scroll(firstPanel);
    expect(continueButton).toBeDisabled();

    setScrollTop(firstPanel, 791);
    fireEvent.scroll(firstPanel);
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);

    expect(within(dialog).getByRole("tab", { name: "Privacy" })).toHaveAttribute("aria-selected", "true");

    const secondPanel = within(dialog).getByRole("tabpanel");
    const acceptButton = within(dialog).getByRole("button", { name: "I Accept" });

    expect(acceptButton).toBeDisabled();

    setScrollTop(secondPanel, 791);
    fireEvent.scroll(secondPanel);

    expect(acceptButton).toBeEnabled();
  });

  it("keeps the tab announcement hidden without the default stylesheet", async () => {
    render(
      <AgreeFirst documents={DOCUMENTS} requireCheckbox={false} requireScroll={false} unstyled classNames={{ modalFooter: "custom-footer" }}>
        Continue
      </AgreeFirst>
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const dialog = await screen.findByRole("dialog", { name: "Terms — 1 of 2" });
    const announcement = dialog.querySelector("[aria-live]");
    expect(announcement).toBeInTheDocument();
    expect(announcement).toHaveStyle({ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap" });

    const footer = dialog.querySelector(".custom-footer") as HTMLElement;
    expect(within(footer).getByRole("link", { name: /Read full document/ })).toBeInTheDocument();
    expect(within(footer).getByRole("button", { name: "Accept & Continue →" })).toBeInTheDocument();

    fireEvent.click(within(footer).getByRole("button", { name: "Accept & Continue →" }));
    expect(dialog).toHaveAccessibleName("Privacy — 2 of 2");
    expect(announcement).toHaveTextContent("Privacy — 2 of 2");
  });

  it("uses modal string overrides alongside app-provided checkbox, document, and button text", async () => {
    const translatedDocuments: AgreeFirstDocument[] = [
      { title: "Termos", content: <p>Conteúdo dos termos</p>, url: "/terms" },
      { title: "Privacidade", content: <p>Conteúdo de privacidade</p>, url: "/privacy" },
    ];
    render(
      <AgreeFirst
        documents={translatedDocuments}
        label="Eu concordo"
        strings={{
          modalTitle: "Documentos legais",
          acceptText: "Aceitar",
          acceptedText: "Aceito",
          continueText: "Continuar",
          scrollHint: "Role até o fim",
          readFullText: "Ler documento",
          closeText: "Fechar",
          tabsLabel: "Documentos",
          scrollProgressLabel: "Progresso da rolagem",
          formatDocumentPosition: (current, total) => `${current} de ${total}`,
        }}
      >
        Criar conta
      </AgreeFirst>
    );

    expect(screen.getByRole("button", { name: "Criar conta" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Eu concordo" }));
    const dialog = await screen.findByRole("dialog", { name: "Documentos legais" });
    expect(within(dialog).getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tablist", { name: "Documentos" })).toBeInTheDocument();
    expect(within(dialog).getByRole("progressbar", { name: "Progresso da rolagem" })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Ler documento" })).toBeInTheDocument();
    expect(within(dialog).getByText("Role até o fim")).toBeInTheDocument();
    expect(dialog.querySelector('[aria-live="polite"]')).toHaveTextContent("Termos — 1 de 2");

    const panel = within(dialog).getByRole("tabpanel", { name: "Termos" });
    setScrollTop(panel, 791);
    fireEvent.scroll(panel);
    fireEvent.click(within(dialog).getByRole("button", { name: "Continuar" }));
    expect(dialog.querySelector('[aria-live="polite"]')).toHaveTextContent("Privacidade — 2 de 2");
    fireEvent.click(within(dialog).getByRole("tab", { name: "Termos" }));
    expect(within(dialog).getByText("Aceito")).toBeInTheDocument();
  });
});
