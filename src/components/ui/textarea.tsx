import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, "aria-invalid": ariaInvalid, rows = 4, ...props },
  ref,
) {
  const isInvalid = invalid || ariaInvalid === true || ariaInvalid === "true";
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={isInvalid || undefined}
      className={cn(
        "w-full rounded border border-border bg-surface px-3.5 py-2.5 text-base font-medium text-fg sm:text-[15px]",
        "outline-none transition-colors focus:border-primary",
        "resize-y disabled:cursor-not-allowed disabled:opacity-50",
        isInvalid && "border-danger focus:border-danger",
        className,
      )}
      {...props}
    />
  );
});
