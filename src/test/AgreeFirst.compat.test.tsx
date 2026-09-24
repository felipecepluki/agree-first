import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgreeFirst } from "../components/AgreeFirst";
import type { AgreeFirstDocument } from "../types";

const documents: AgreeFirstDocument[] = [
  { title: "Terms", content: <p>Terms content</p>, url: "/terms" },
];

const element = () => (
  <AgreeFirst documents={documents} requireCheckbox={false} storageKey="ssr-consent">
    Open
  </AgreeFirst>
);

const simpleElement = () => (
  <AgreeFirst documents={[{ title: "Terms", url: "/terms", version: "1.0" }]} storageKey="ssr-simple" />
);

function renderWithoutBrowser() {
  vi.stubGlobal("window", undefined);
  vi.stubGlobal("document", undefined);
  try {
    return renderToString(element());
  } finally {
    vi.unstubAllGlobals();
  }
}

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
});

describe("AgreeFirst React compatibility", () => {
  it("renders initial markup without window or document", () => {
    const markup = renderWithoutBrowser();

    expect(markup).toContain("Open");
    expect(markup).not.toContain('role="dialog"');
  });

  it("hydrates server markup without a recoverable error and opens the modal", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderWithoutBrowser();
    document.body.appendChild(container);
    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, element(), {
          onRecoverableError: (error) => recoverableErrors.push(error),
        });
      });

      expect(recoverableErrors).toEqual([]);
      fireEvent.click(within(container).getByRole("button", { name: "Open" }));
      expect(await screen.findByRole("dialog", { name: "Terms" })).toBeInTheDocument();
      expect(recoverableErrors).toEqual([]);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  it("server-renders and hydrates the link-only flow without a recoverable error", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    let markup: string;
    try {
      markup = renderToString(simpleElement());
    } finally {
      vi.unstubAllGlobals();
    }

    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.appendChild(container);
    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, simpleElement(), {
          onRecoverableError: (error) => recoverableErrors.push(error),
        });
      });
      expect(recoverableErrors).toEqual([]);
      expect(within(container).getByRole("checkbox", { name: "I agree to the Terms" })).toBeInTheDocument();
      expect(recoverableErrors).toEqual([]);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  it("hydrates a returning link-only agreement with a matching local record", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    let markup: string;
    try {
      markup = renderToString(simpleElement());
    } finally {
      vi.unstubAllGlobals();
    }

    localStorage.setItem("ssr-simple", JSON.stringify({
      id: "previous",
      timestamp: "2026-09-20T12:00:00.000Z",
      documents: [{ title: "Terms", url: "/terms", version: "1.0" }],
      scrollCompleted: [],
    }));
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.appendChild(container);
    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, simpleElement(), {
          onRecoverableError: (error) => recoverableErrors.push(error),
        });
      });
      expect(recoverableErrors).toEqual([]);
      expect(within(container).getByRole("checkbox")).toBeChecked();
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  it("runs scroll and minimum-time effects once in Strict Mode", () => {
    const onOpen = vi.fn();
    const onScrollProgress = vi.fn();
    const onChange = vi.fn();
    const timedDocuments: AgreeFirstDocument[] = [
      { ...documents[0], minReadTimeMs: 100 },
    ];
    render(
      <StrictMode>
        <AgreeFirst
          documents={timedDocuments}
          onOpen={onOpen}
          onScrollProgress={onScrollProgress}
          onChange={onChange}
          requireCheckbox={false}
        >
          Open
        </AgreeFirst>
      </StrictMode>
    );

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog", { name: "Terms" });
    const accept = within(dialog).getByRole("button", { name: "I Accept" });
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onScrollProgress).toHaveBeenCalledOnce();
    expect(onScrollProgress).toHaveBeenCalledWith(1);
    expect(accept).toBeDisabled();

    act(() => vi.advanceTimersByTime(99));
    expect(accept).toBeDisabled();
    act(() => vi.advanceTimersByTime(1));
    expect(accept).toBeEnabled();
    fireEvent.click(accept);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
