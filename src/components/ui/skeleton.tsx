import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded bg-[length:400px_100%]",
        "bg-[linear-gradient(90deg,#ececee_25%,#f6f6f7_37%,#ececee_63%)]",
        className,
      )}
    />
  );
}
