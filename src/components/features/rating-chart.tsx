"use client";

import { useRef, useState } from "react";

import { formatDayMonthYear, formatMonthYearShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RatingPoint } from "@/types/api";

type Win = 5 | 10 | "all";

const WINS: { key: Win; label: string }[] = [
  { key: 5, label: "5" },
  { key: 10, label: "10" },
  { key: "all", label: "Все" },
];

const VBW = 640;
const VBH = 220;
const PAD_L = 42; // место под подписи оси Y
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 28; // место под подписи оси X
const PLOT_W = VBW - PAD_L - PAD_R;
const PLOT_H = VBH - PAD_T - PAD_B;
const YEAR_MS = 365 * 24 * 3600 * 1000;

export function RatingChart({
  points,
  currentRating,
  title,
}: {
  points: RatingPoint[];
  currentRating?: number | null;
  title?: string;
}) {
  const [win, setWin] = useState<Win>("all");
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const all = [...points].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );
  if (all.length < 2) return null;

  const visible = win === "all" ? all : all.slice(-win);
  const n = visible.length;

  const ratings = visible.map((p) => p.rating);
  const { ticks: yTickVals, lo: yLo, hi: yHi } = yScale(
    Math.min(...ratings),
    Math.max(...ratings),
  );
  const span = yHi - yLo || 1;

  const xAt = (i: number) => PAD_L + (n === 1 ? 0 : (i / (n - 1)) * PLOT_W);
  const yAt = (r: number) => PAD_T + (1 - (r - yLo) / span) * PLOT_H;

  const line = visible
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)} ${yAt(p.rating).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${(PAD_L + PLOT_W).toFixed(1)} ${PAD_T + PLOT_H} L${PAD_L} ${PAD_T + PLOT_H} Z`;

  const cur = currentRating ?? visible[n - 1].rating;
  let refRating: number;
  let winLabel: string;
  if (win === "all") {
    const yearAgo = Date.now() - YEAR_MS;
    const older = all.filter((p) => new Date(p.recorded_at).getTime() <= yearAgo);
    if (older.length) {
      refRating = older[older.length - 1].rating;
      winLabel = "за год";
    } else {
      refRating = all[0].rating;
      winLabel = "за всё время";
    }
  } else {
    refRating = visible[0].rating;
    winLabel = n >= win ? `за последние ${win} замеров` : "за всё время";
  }
  const delta = cur - refRating;

  const xTickIdx = xLabelIndices(n);

  const drawKey = `${win}:${n}:${visible[0].recorded_at}:${visible[n - 1].recorded_at}`;

  function onMove(e: React.PointerEvent) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const vbX = ((e.clientX - rect.left) / rect.width) * VBW;
    const i = clamp(Math.round(((vbX - PAD_L) / PLOT_W) * (n - 1)), 0, n - 1);
    setHover({
      i,
      x: (xAt(i) / VBW) * rect.width,
      y: (yAt(visible[i].rating) / VBH) * rect.height,
    });
  }

  const hi = hover ? visible[hover.i] : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {title && <h3 className="mb-1.5 text-sm font-bold text-fg-2">{title}</h3>}
          <div className="flex flex-wrap items-center gap-2">
            <DeltaBadge delta={delta} />
            <span className="text-xs text-muted">{winLabel}</span>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Период графика рейтинга"
          className="inline-flex gap-0.5 rounded bg-surface-3 p-[3px]"
        >
          {WINS.map((w) => {
            const active = win === w.key;
            return (
              <button
                key={String(w.key)}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setWin(w.key);
                  setHover(null);
                }}
                className={cn(
                  "rounded-[6px] px-2.5 py-1 text-xs font-bold transition-colors",
                  active ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg-2",
                )}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={wrapRef} className="relative">
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          width="100%"
          className="block select-none"
          role="img"
          aria-label={`Рейтинг ${cur}, изменение ${winLabel}: ${delta >= 0 ? "+" : "−"}${Math.abs(delta)}`}
        >
          {yTickVals.map((t) => {
            const y = yAt(t);
            return (
              <g key={t}>
                <line
                  x1={PAD_L}
                  y1={y}
                  x2={PAD_L + PLOT_W}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
                <text
                  x={PAD_L - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="var(--color-muted)"
                >
                  {t}
                </text>
              </g>
            );
          })}

          <line
            x1={PAD_L}
            y1={PAD_T + PLOT_H}
            x2={PAD_L + PLOT_W}
            y2={PAD_T + PLOT_H}
            stroke="var(--color-border-strong)"
            strokeWidth={1}
          />
          {xTickIdx.map((i) => {
            const x = xAt(i);
            const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={PAD_T + PLOT_H}
                  x2={x}
                  y2={PAD_T + PLOT_H + 4}
                  stroke="var(--color-border-strong)"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={VBH - 8}
                  textAnchor={anchor}
                  fontSize={11}
                  fill="var(--color-muted)"
                >
                  {formatMonthYearShort(visible[i].recorded_at)}
                </text>
              </g>
            );
          })}

          <path
            key={`area-${drawKey}`}
            className="rating-area-in"
            d={area}
            fill="var(--color-primary-tint)"
            stroke="none"
          />
          <path
            key={`line-${drawKey}`}
            className="rating-line-draw"
            pathLength={1}
            d={line}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {hover && hi && (
            <g pointerEvents="none">
              <line
                x1={xAt(hover.i)}
                y1={PAD_T}
                x2={xAt(hover.i)}
                y2={PAD_T + PLOT_H}
                stroke="var(--color-border-strong)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={xAt(hover.i)}
                cy={yAt(hi.rating)}
                r={5}
                fill="var(--color-primary)"
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
            </g>
          )}
          {!hover && (
            <circle
              key={`dot-${drawKey}`}
              className="rating-dot-in"
              cx={xAt(n - 1)}
              cy={yAt(visible[n - 1].rating)}
              r={4.5}
              fill="var(--color-primary)"
              stroke="var(--color-surface)"
              strokeWidth={2}
            />
          )}

          <rect
            x={0}
            y={0}
            width={VBW}
            height={VBH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
            onPointerCancel={() => setHover(null)}
          />
        </svg>

        {hover && hi && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md bg-fg px-2.5 py-1.5 text-center whitespace-nowrap text-white shadow-pop"
            style={{ left: hover.x, top: hover.y }}
          >
            <div className="text-sm font-extrabold leading-none">{hi.rating}</div>
            <div className="mt-1 text-[10.5px] font-medium text-white/70">
              {formatDayMonthYear(hi.recorded_at)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const cls =
    delta > 0
      ? "bg-status-confirmed/12 text-status-confirmed"
      : delta < 0
        ? "bg-status-declined/12 text-status-declined"
        : "bg-surface-3 text-muted";
  const text = delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : "0";
  return (
    <span className={cn("rounded-pill px-2 py-[2px] text-xs font-bold", cls)}>{text}</span>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// Округляет шаг оси до «красивого» (1/2/5 × 10ⁿ), чтобы деления были круглыми.
function niceStep(range: number, targetTicks: number): number {
  const rough = range / Math.max(1, targetTicks - 1);
  const exp = Math.floor(Math.log10(rough));
  const base = 10 ** exp;
  const frac = rough / base;
  const niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return niceFrac * base;
}

// Шкала Y с круглыми делениями и небольшим паддингом сверху/снизу.
// Рейтинги целочисленные — шаг не опускаем ниже 1.
function yScale(dataMin: number, dataMax: number): { ticks: number[]; lo: number; hi: number } {
  if (dataMin === dataMax) return { ticks: [dataMin], lo: dataMin - 1, hi: dataMin + 1 };
  const step = Math.max(1, niceStep(dataMax - dataMin, 5));
  const lo = Math.floor(dataMin / step) * step;
  const hi = Math.ceil(dataMax / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v));
  return { ticks, lo, hi };
}

function xLabelIndices(n: number): number[] {
  if (n <= 1) return [0];
  const labels = Math.min(4, n);
  const out: number[] = [];
  for (let k = 0; k < labels; k++) out.push(Math.round((k * (n - 1)) / (labels - 1)));
  return Array.from(new Set(out));
}
