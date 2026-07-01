import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconAlertCircle } from "@/components/ui/icons";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  children?: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, children, error, ...props },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-relaxed font-medium text-fg-2">
        <input
          ref={ref}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "mt-px size-4 flex-none accent-primary",
            error && "outline outline-2 outline-offset-1 outline-danger",
            className,
          )}
          {...props}
        />
        {children ? <span>{children}</span> : null}
      </label>
      {error ? (
        <span
          id={errorId}
          role="alert"
          className="flex items-center gap-1 pl-[26px] text-xs font-semibold text-danger motion-safe:animate-[pu-fade_0.15s_ease-out]"
        >
          <IconAlertCircle size={13} className="flex-none" />
          {error}
        </span>
      ) : null}
    </div>
  );
});
