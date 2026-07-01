import type { RatingPoint } from "@/types/api";

const W = 600;
const H = 160;
const PAD_Y = 16;

// Лёгкий SVG-линейный график рейтинга (без chart-либы, как в демо): area + line + маркер последней точки.
export function RatingChart({ points }: { points: RatingPoint[] }) {
  const sorted = [...points].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );
  if (sorted.length < 2) return null;

  const ratings = sorted.map((p) => p.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const span = max - min || 1;

  const coords = sorted.map((p, i) => {
    const x = (i / (sorted.length - 1)) * W;
    const y = H - PAD_Y - ((p.rating - min) / span) * (H - 2 * PAD_Y);
    return { x, y };
  });

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const last = coords[coords.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block overflow-visible" role="img" aria-label="История рейтинга">
        <path d={area} fill="var(--color-primary-tint)" stroke="none" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={last.x} cy={last.y} r={4.5} fill="var(--color-primary)" stroke="#fff" strokeWidth={2} />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-muted">
        <span>мин {min}</span>
        <span>макс {max}</span>
      </div>
    </div>
  );
}
