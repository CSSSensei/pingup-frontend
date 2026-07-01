import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded border border-border bg-surface px-3.5 py-2.5 text-base font-medium text-fg sm:text-[15px]",
        "outline-none transition-colors placeholder:text-zinc-400 focus:border-primary",
        "resize-y disabled:opacity-60",
        invalid && "border-danger focus:border-danger",
        className,
      )}
      {...props}
    />
  );
});
