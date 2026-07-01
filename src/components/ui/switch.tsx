"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-[27px] w-[46px] flex-none rounded-pill border-0 p-0 transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-border-strong",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[3px] size-[21px] rounded-full bg-white transition-transform",
          "shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
          checked && "translate-x-[19px]",
        )}
      />
    </button>
  );
}
