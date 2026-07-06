"use client";

import { useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { BallSpinner } from "@/components/ui/spinner";

export function SearchSelect<T>({
  query,
  onQueryChange,
  items,
  isLoading = false,
  getKey,
  renderItem,
  onPick,
  placeholder,
  disabled = false,
  minChars = 2,
  emptyText = "Ничего не найдено",
}: {
  query: string;
  onQueryChange: (v: string) => void;
  items: T[];
  isLoading?: boolean;
  getKey: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
  onPick: (item: T) => void;
  placeholder?: string;
  disabled?: boolean;
  minChars?: number;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const show = open && query.trim().length >= minChars;

  return (
    <div className="relative">
      <Input
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {show && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-pop">
          {isLoading ? (
            <div className="flex justify-center py-3">
              <BallSpinner size={18} />
            </div>
          ) : items.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">{emptyText}</p>
          ) : (
            items.map((it) => (
              <button
                key={getKey(it)}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(it);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2"
              >
                {renderItem(it)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
