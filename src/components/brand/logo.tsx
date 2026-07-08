import { cn } from "@/lib/utils";

export function Logo({
  variant = "wordmark",
  className,
  alt = "pingup",
}: {
  variant?: "wordmark" | "mark";
  className?: string;
  alt?: string;
}) {
  const src =
    variant === "mark" ? "/brand/logo-mark.svg" : "/brand/logo-wordmark.svg";
  return (
    <img
      src={src}
      alt={alt}
      className={cn("select-none", className)}
      draggable={false}
    />
  );
}
