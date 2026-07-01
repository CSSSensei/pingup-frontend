import { cn } from "@/lib/utils";

export function BallSpinner({ size = 18, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/ball.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("animate-ball select-none", className)}
    />
  );
}
