"use client";

import Link from "next/link";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { VenueModerationSection } from "@/components/features/venue-moderation-section";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { IconBuilding, IconExternalLink, IconPhone, IconSend } from "@/components/ui/icons";
import { useCancelVenueBooking, useManagedVenues, useVenueBookings } from "@/hooks/useMyVenues";
import { formatDateTime } from "@/lib/format";
import type { ManagedVenueRead, VenueBookingRead, VenueStaffRole } from "@/types/api";

const ROLE_LABELS: Record<VenueStaffRole, string> = {
  caretaker: "Завхоз",
  moderator: "Модератор зала",
};

export function MyVenuesView() {
  const query = useManagedVenues();
  const venues = query.data ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <PageHeader title="Мои залы" description="Залы, за которые вы отвечаете" />

      {query.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : venues.length === 0 ? (
        <EmptyState
          icon={<IconBuilding size={32} />}
          title="Залов нет"
          description="Вас пока не назначили ответственным ни за один зал."
        />
      ) : (
        <div className="space-y-4">
          {venues.map((v) => (
            <ManagedVenueCard key={v.venue_id} venue={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function ManagedVenueCard({ venue }: { venue: ManagedVenueRead }) {
  const isCaretaker = venue.roles.includes("caretaker");
  const isModerator = venue.roles.includes("moderator");
  const bookings = useVenueBookings(venue.venue_id, isCaretaker);
  const items = bookings.data ?? [];

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-fg">{venue.name}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {venue.roles.map((r) => (
              <Badge key={r} className="bg-primary-tint text-primary">
                {ROLE_LABELS[r]}
              </Badge>
            ))}
          </div>
        </div>
        <Link
          href={`/venues/${venue.slug}`}
          className="flex-none text-muted hover:text-fg"
          aria-label="Открыть зал"
        >
          <IconExternalLink size={16} />
        </Link>
      </div>

      {isCaretaker && (
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="mb-2 text-sm font-bold text-fg-2">Предстоящие брони</h3>
          {bookings.isPending ? (
            <Skeleton className="h-20 w-full" />
          ) : bookings.isError ? (
            <ErrorState onRetry={() => bookings.refetch()} />
          ) : items.length === 0 ? (
            <p className="py-2 text-sm text-muted">Активных броней нет.</p>
          ) : (
            <div className="divide-y divide-border">
              {items.map((b) => (
                <BookingRow key={b.id} booking={b} venueId={venue.venue_id} />
              ))}
            </div>
          )}
        </div>
      )}

      {isModerator && <VenueModerationSection venueId={venue.venue_id} />}
    </section>
  );
}

function BookingRow({ booking, venueId }: { booking: VenueBookingRead; venueId: number }) {
  const [open, setOpen] = useState(false);
  const cancel = useCancelVenueBooking(venueId);

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">
            {booking.table_label ?? "Стол"} · {formatDateTime(booking.starts_at)}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            до {formatDateTime(booking.ends_at)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Отменить
        </Button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {booking.booker_slug ? (
          <Link
            href={`/players/${booking.booker_slug}`}
            className="font-semibold text-fg-2 hover:text-primary hover:underline"
          >
            {booking.booker_name ?? `#${booking.user_id}`}
          </Link>
        ) : (
          <span className="font-semibold text-fg-2">
            {booking.booker_name ?? `#${booking.user_id}`}
          </span>
        )}
        {booking.booker_telegram && (
          <a
            href={`https://t.me/${booking.booker_telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <IconSend size={13} /> @{booking.booker_telegram}
          </a>
        )}
        {booking.booker_phone && (
          <a
            href={`tel:${booking.booker_phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <IconPhone size={13} /> {booking.booker_phone}
          </a>
        )}
      </div>

      <ConfirmDialog
        open={open}
        title="Отменить бронь?"
        message="Бронирующий получит уведомление об отмене."
        confirmLabel="Отменить бронь"
        destructive
        loading={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(booking.id, {
            onSuccess: () => {
              toast.success("Бронь отменена");
              setOpen(false);
            },
          })
        }
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
