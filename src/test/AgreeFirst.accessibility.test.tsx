import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgreeFirst } from "../components/AgreeFirst";
import type { AgreeFirstDocument } from "../types";

const documents: AgreeFirstDocument[] = [
  { title: "Terms", content: <p>Terms content</p>, url: "/terms" },
  { title: "Privacy", content: <p>Privacy content</p>, url: "/privacy" },
  { title: "Cookies", content: <p>Cookies content</p>, url: "/cookies" },
];

async function openDialog() {
  const trigger = screen.getByRole("button", { name: "Open" });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog");
  await waitFor(() => expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus());
  return { trigger, dialog };
}

function finishClose() {
  act(() => vi.advanceTimersByTime(200));
}

beforeEach(() => {
  // jsdom does not advance animation frames unless the test provides a scheduler.
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 0)
  );
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => window.clearTimeout(handle));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("AgreeFirst accessibility and keyboard behavior", () => {
  it("labels the dialog and tabs, links the selected tab to its panel, and announces tab changes", async () => {
    render(<AgreeFirst documents={documents} requireCheckbox={false} requireScroll={false}>Open</AgreeFirst>);
    const { dialog } = await openDialog();

    expect(dialog).toHaveAccessibleName("Terms — 1 of 3");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const tablist = within(dialog).getByRole("tablist", { name: "Documents" });
    const terms = within(tablist).getByRole("tab", { name: "Terms" });
    const privacy = within(tablist).getByRole("tab", { name: "Privacy" });
    expect(terms).toHaveAttribute("aria-selected", "true");
    expect(terms).toHaveAttribute("tabindex", "0");
    expect(privacy).toBeDisabled();
    const panel = within(dialog).getByRole("tabpanel", { name: "Terms" });
    expect(terms).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", terms.id);
    expect(within(dialog).getByRole("progressbar", { name: "Scroll progress" })).toHaveAttribute("aria-valuenow");

    fireEvent.click(within(dialog).getByRole("button", { name: "Accept & Continue →" }));

    expect(dialog).toHaveAccessibleName("Privacy — 2 of 3");
    expect(privacy).toHaveAttribute("aria-selected", "true");
    expect(privacy).toHaveAttribute("tabindex", "0");
    expect(within(dialog).getByRole("tabpanel", { name: "Privacy" })).toHaveAttribute("aria-labelledby", privacy.id);
    const liveRegion = dialog.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent("Privacy — 2 of 3");
  });

  it("uses arrow keys and Home/End to move focus between available tabs, skipping locked tabs", async () => {
    render(<AgreeFirst documents={documents} requireCheckbox={false} requireScroll={false}>Open</AgreeFirst>);
    const { dialog } = await openDialog();
    const terms = within(dialog).getByRole("tab", { name: "Terms" });
    const privacy = within(dialog).getByRole("tab", { name: "Privacy" });
    const cookies = within(dialog).getByRole("tab", { name: "Cookies" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Accept & Continue →" }));
    expect(cookies).toBeDisabled();

    terms.focus();
    fireEvent.keyDown(terms, { key: "ArrowRight" });
    expect(privacy).toHaveFocus();
    expect(privacy).toHaveAttribute("aria-selected", "true");
    expect(terms).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(privacy, { key: "ArrowRight" });
    expect(terms).toHaveFocus();
    fireEvent.keyDown(terms, { key: "ArrowLeft" });
    expect(privacy).toHaveFocus();
    fireEvent.keyDown(privacy, { key: "Home" });
    expect(terms).toHaveFocus();
    fireEvent.keyDown(terms, { key: "End" });
    expect(privacy).toHaveFocus();
    expect(cookies).toBeDisabled();
  });

  it("moves focus to the next tab after accepting a document, so Escape still closes the dialog", async () => {
    render(<AgreeFirst documents={documents} requireCheckbox={false} requireScroll={false}>Open</AgreeFirst>);
    const { trigger, dialog } = await openDialog();
    const continueButton = within(dialog).getByRole("button", { name: "Accept & Continue →" });
    continueButton.focus();
    fireEvent.click(continueButton);

    const privacy = within(dialog).getByRole("tab", { name: "Privacy" });
    await waitFor(() => expect(privacy).toHaveFocus());

    vi.useFakeTimers();
    fireEvent.keyDown(privacy, { key: "Escape" });
    finishClose();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("traps Tab and Shift+Tab at the dialog boundaries", async () => {
    render(<AgreeFirst documents={documents} requireCheckbox={false} requireScroll={false}>Open</AgreeFirst>);
    const { dialog } = await openDialog();
    const close = within(dialog).getByRole("button", { name: "Close" });
    const last = within(dialog).getByRole("button", { name: "Accept & Continue →" });

    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(close).toHaveFocus();

    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });

  it("closes with Escape and restores focus after the exit animation", async () => {
    render(<AgreeFirst documents={documents} requireCheckbox={false} requireScroll={false}>Open</AgreeFirst>);
    const { trigger, dialog } = await openDialog();

    vi.useFakeTimers();
    fireEvent.keyDown(within(dialog).getByRole("button", { name: "Close" }), { key: "Escape" });
    finishClose();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on an overlay click, but not an inside click or when overlay closing is disabled", async () => {
    const { rerender } = render(
      <AgreeFirst documents={documents} requireCheckbox={false} requireScroll={false} closeOnOverlayClick={false}>Open</AgreeFirst>
    );
    const { trigger, dialog } = await openDialog();
    const overlay = dialog.parentElement as HTMLElement;

    fireEvent.click(dialog);
    fireEvent.click(overlay);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(<AgreeFirst documents={documents} requireCheckbox={false} requireScroll={false}>Open</AgreeFirst>);
    vi.useFakeTimers();
    fireEvent.click(overlay);
    finishClose();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("scrolls with keyboard controls only when the document area itself receives the key", async () => {
    const doc: AgreeFirstDocument = {
      title: "Terms",
      content: <button>Inside document</button>,
      url: "/terms",
    };
    render(<AgreeFirst documents={[doc]} requireCheckbox={false} requireScroll={false}>Open</AgreeFirst>);
    const { dialog } = await openDialog();
    const area = within(dialog).getByRole("generic", { name: "Terms" });
    const scrollBy = vi.fn();
    const scrollTo = vi.fn();
    Object.defineProperties(area, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 800 },
      scrollBy: { configurable: true, value: scrollBy },
      scrollTo: { configurable: true, value: scrollTo },
    });

    area.focus();
    fireEvent.keyDown(area, { key: " " });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 160, behavior: "smooth" });
    fireEvent.keyDown(area, { key: "PageDown" });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 160, behavior: "smooth" });
    fireEvent.keyDown(area, { key: "PageUp" });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -160, behavior: "smooth" });
    fireEvent.keyDown(area, { key: "ArrowDown" });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 60, behavior: "smooth" });
    fireEvent.keyDown(area, { key: "ArrowUp" });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -60, behavior: "smooth" });
    fireEvent.keyDown(area, { key: "End" });
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: "smooth" });
    fireEvent.keyDown(area, { key: "Home" });
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });

    const calls = scrollBy.mock.calls.length;
    fireEvent.keyDown(within(dialog).getByRole("button", { name: "Inside document" }), { key: "ArrowDown" });
    expect(scrollBy).toHaveBeenCalledTimes(calls);
  });
});
