import { cn } from "@/lib/utils";

const SHIMMER_GRADIENT =
  "linear-gradient(90deg, var(--color-surface-3) 25%, var(--color-surface-2) 37%, var(--color-surface-3) 63%)";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      style={{ backgroundImage: SHIMMER_GRADIENT }}
      className={cn("rounded bg-[length:400px_100%] motion-safe:animate-shimmer", className)}
    />
  );
}
