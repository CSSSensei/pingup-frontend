import { TABLE_H, TABLE_W } from "@/components/features/hall-map/table-shape";

export interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Кадр по крайним столам + запас; пропорция зажата в [4:3 … 16:9].
export function fitFrame(
  tables: { x: number; y: number }[],
  fallbackW: number,
  fallbackH: number,
): Frame {
  if (tables.length === 0) return { x: 0, y: 0, w: fallbackW, h: fallbackH };
  const reach = Math.hypot(TABLE_W, TABLE_H) / 2 + 140;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of tables) {
    minX = Math.min(minX, t.x - reach);
    minY = Math.min(minY, t.y - reach);
    maxX = Math.max(maxX, t.x + reach);
    maxY = Math.max(maxY, t.y + reach);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  let w = Math.max(maxX - minX, 1600);
  let h = Math.max(maxY - minY, 1000);
  const ar = w / h;
  if (ar < 4 / 3) w = h * (4 / 3);
  else if (ar > 16 / 9) h = w / (16 / 9);
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
