import React from "react";
import { act, renderHook } from "@testing-library/react";
import { reducer, useToast } from "./use-toast";

describe("use-toast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("reducer adds, updates, dismisses and removes toasts", () => {
    const initial = { toasts: [] as any[] };
    const added = reducer(initial, {
      type: "ADD_TOAST",
      toast: { id: "1", open: true, title: "t" },
    } as any);

    expect(added.toasts).toHaveLength(1);

    const updated = reducer(added, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "t2" },
    } as any);
    expect(updated.toasts[0].title).toBe("t2");

    const dismissed = reducer(updated, { type: "DISMISS_TOAST", toastId: "1" } as any);
    expect(dismissed.toasts[0].open).toBe(false);

    const removed = reducer(dismissed, { type: "REMOVE_TOAST", toastId: "1" } as any);
    expect(removed.toasts).toHaveLength(0);
  });

  it("hook exposes toast and dismiss helpers", () => {
    const { result, unmount } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "Hello" } as any);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });

    expect(result.current.toasts[0].open).toBe(false);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.toasts).toHaveLength(0);

    unmount();
  });
});

