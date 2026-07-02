"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

const STAR_PATH =
  "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z";

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      className={className}
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

// Дробный дисплей: пустые звёзды снизу, залитые — оверлеем, обрезанным по проценту.
export function StarRating({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / 5)) * 100;
  return (
    <span className={cn("relative inline-flex leading-none", className)}>
      <span className="flex gap-0.5 text-border-strong">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-skill-pro"
        style={{ width: `${pct}%` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} className="flex-none" />
        ))}
      </span>
    </span>
  );
}

const LABELS = ["", "Плохо", "Так себе", "Нормально", "Хорошо", "Отлично"];

export function StarInput({
  value,
  onChange,
  size = 30,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Стрелки должны и менять выбор, и вести фокус за ним (roving tabindex, WAI-ARIA radio).
  const move = (next: number) => {
    onChange(next);
    btnRefs.current[next - 1]?.focus();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        id={id}
        role="radiogroup"
        aria-label="Оценка"
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className="flex gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            ref={(el) => {
              btnRefs.current[n - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} — ${LABELS[n]}`}
            tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                move(Math.min(5, (value || 0) + 1));
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                move(Math.max(1, (value || 1) - 1));
              }
            }}
            className={cn(
              "rounded p-0.5 leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              n <= shown ? "text-skill-pro" : "text-border-strong hover:text-skill-pro/50",
            )}
          >
            <Star size={size} />
          </button>
        ))}
      </div>
      <span className="h-4 text-xs font-semibold text-muted">{shown ? LABELS[shown] : ""}</span>
    </div>
  );
}
