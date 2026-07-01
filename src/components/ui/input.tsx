import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const inputClass = cn(
  "h-11 w-full rounded border border-border bg-surface px-3.5 text-[15px] font-medium text-fg",
  "outline-none transition-colors placeholder:text-zinc-400 focus:border-primary",
  "disabled:opacity-60",
);

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, invalid && "border-danger focus:border-danger", className)}
      {...props}
    />
  );
});
