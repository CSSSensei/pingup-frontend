"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// Пока active: переносит фокус внутрь контейнера, зацикливает Tab/Shift+Tab
// на его фокусируемых элементах и возвращает фокус вызвавшему при закрытии.
// Контейнеру нужен tabIndex={-1} — фолбэк, когда внутри нет фокусируемых.
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;

    const prevFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );

    (focusables()[0] ?? node).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const cur = document.activeElement;
      if (e.shiftKey && (cur === first || !node.contains(cur))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (cur === last || !node.contains(cur))) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => {
      node.removeEventListener("keydown", onKeyDown);
      prevFocused?.focus?.();
    };
  }, [active]);

  return ref;
}
