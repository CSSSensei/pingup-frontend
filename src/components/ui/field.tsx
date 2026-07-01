import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconAlertCircle } from "@/components/ui/icons";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const autoId = useId();
  const child = isValidElement(children)
    ? (children as ReactElement<Record<string, unknown>>)
    : null;
  const controlId = htmlFor ?? (child?.props.id as string | undefined) ?? autoId;
  const errorId = `${controlId}-error`;
  const hintId = `${controlId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const control = child
    ? cloneElement(child, {
        id: controlId,
        "aria-invalid": error ? true : child.props["aria-invalid"],
        "aria-describedby":
          [child.props["aria-describedby"] as string | undefined, describedBy]
            .filter(Boolean)
            .join(" ") || undefined,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={controlId} className="text-[13px] font-bold text-fg-2">
        {label}
      </label>
      {control}
      {error ? (
        <span
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs font-semibold text-danger motion-safe:animate-[pu-fade_0.15s_ease-out]"
        >
          <IconAlertCircle size={13} className="flex-none" />
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
