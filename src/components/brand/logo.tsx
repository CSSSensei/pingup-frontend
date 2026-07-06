import { cn } from "@/lib/utils";

export function Logo({
  variant = "wordmark",
  className,
}: {
  variant?: "wordmark" | "mark";
  className?: string;
}) {
  const src = variant === "mark" ? "/brand/logo-mark.svg" : "/brand/logo-wordmark.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="pingup" className={cn("select-none", className)} draggable={false} />
  );
}
