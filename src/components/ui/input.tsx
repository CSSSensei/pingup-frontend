import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const inputClass = cn(
  "h-11 w-full rounded border border-border bg-surface px-3.5 text-base font-medium text-fg sm:text-[15px]",
  "outline-none transition-colors focus:border-primary",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, "aria-invalid": ariaInvalid, ...props },
  ref,
) {
  const isInvalid = invalid || ariaInvalid === true || ariaInvalid === "true";
  return (
    <input
      ref={ref}
      aria-invalid={isInvalid || undefined}
      className={cn(inputClass, isInvalid && "border-danger focus:border-danger", className)}
      {...props}
    />
  );
});
