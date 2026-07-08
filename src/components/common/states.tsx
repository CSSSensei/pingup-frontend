import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { IconAlertCircle } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { SUPPORT_URL } from "@/lib/links";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <h3 className="text-base font-bold text-fg">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Не удалось загрузить",
  description = "Проверьте соединение и попробуйте снова.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<IconAlertCircle size={30} className="text-danger" />}
      title={title}
      description={description}
      action={
        <div className="flex flex-col items-center gap-3">
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Повторить
            </Button>
          )}
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-muted underline-offset-2 hover:text-primary hover:underline"
          >
            Написать в поддержку
          </a>
        </div>
      }
    />
  );
}

export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="mt-3 h-3 w-56" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
        >
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-[21px] w-3/4" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VenueCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card"
        >
          <Skeleton className="h-[168px] w-full rounded-none" />
          <div className="flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-9" />
            </div>
            <Skeleton className="h-3.5 w-52" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlayerCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
        >
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-7 w-10" />
        </div>
      ))}
    </div>
  );
}
