import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full cursor-pointer rounded border border-border bg-surface px-3 text-[15px]",
          "font-semibold text-fg outline-none transition-colors focus:border-primary",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
