"use client";

import { useId, useMemo, useState } from "react";

import { inputClass } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_SUGGESTIONS = 8;

function filterOptions(options: string[], query: string): string[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return options.slice(0, MAX_SUGGESTIONS);
  const out: string[] = [];
  for (const opt of options) {
    const low = opt.toLowerCase();
    if (tokens.every((t) => low.includes(t))) {
      out.push(opt);
      if (out.length === MAX_SUGGESTIONS) break;
    }
  }
  return out;
}

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  id?: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  invalid?: boolean;
  onBlur?: () => void;
  autoCapitalize?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export function Combobox({
  value,
  onChange,
  options,
  id,
  placeholder,
  maxLength,
  className,
  invalid,
  onBlur,
  autoCapitalize,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
}: ComboboxProps) {
  const isInvalid = invalid || ariaInvalid === true || ariaInvalid === "true";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  const suggestions = useMemo(() => filterOptions(options, value), [options, value]);
  const showList =
    open && suggestions.length > 0 && !(suggestions.length === 1 && suggestions[0] === value);

  function commit(v: string) {
    onChange(v);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setActive(0);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        if (active >= 0) {
          e.preventDefault();
          commit(suggestions[active]);
        }
        break;
      case "Escape":
        setOpen(false);
        setActive(-1);
        break;
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={isInvalid || undefined}
        autoComplete="off"
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        className={cn(inputClass, isInvalid && "border-danger focus:border-danger")}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
          onBlur?.();
        }}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded border border-border bg-surface py-1 shadow-card"
        >
          {suggestions.map((opt, i) => (
            <li
              key={opt}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(opt);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "cursor-pointer px-3.5 py-2 text-[15px] font-medium",
                i === active ? "bg-primary-tint text-primary" : "text-fg",
              )}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
