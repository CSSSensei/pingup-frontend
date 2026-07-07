import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, invalid, "aria-invalid": ariaInvalid, ...props },
  ref,
) {
  const isInvalid = invalid || ariaInvalid === true || ariaInvalid === "true";
  return (
    <select
      ref={ref}
      aria-invalid={isInvalid || undefined}
      className={cn(
        "h-11 w-full cursor-pointer rounded border border-border bg-surface px-3.5 text-base sm:text-[15px]",
        "font-medium text-fg outline-none transition-colors focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isInvalid && "border-danger focus:border-danger",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
