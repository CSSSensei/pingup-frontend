"use client";

import Link from "next/link";
import { useState } from "react";

import { EventCard } from "@/components/features/event-card";
import { HallMapSection } from "@/components/features/hall-map/hall-map-section";
import { ReportButton } from "@/components/features/report-button";
import { ReviewsSection } from "@/components/features/reviews-section";
import { VenueHours } from "@/components/features/schedule/venue-hours";
import { VenuesMap } from "@/components/maps/venues-map";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  IconClock,
  IconExternalLink,
  IconPencil,
  IconPhone,
  IconPin,
  IconRoute,
  IconShieldCheck,
  IconStar,
} from "@/components/ui/icons";
import { useEvents } from "@/hooks/useEvents";
import { useMe } from "@/hooks/useMe";
import { useVerifyVenue } from "@/hooks/useVenues";
import { isModerator } from "@/lib/roles";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { parseWeekSchedule } from "@/lib/schedule";
import {
  reviewsLabel,
  routeUrl,
  tablesCount,
  tablesLabel,
  venueRatingLabel,
  websiteLabel,
  websiteUrl,
  workingHoursLabel,
} from "@/lib/venues";
import type { VenuePhoto, VenueRead } from "@/types/api";

function Gallery({ photos, name }: { photos: VenuePhoto[]; name: string }) {
  const sorted = [...photos].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  );
  const [idx, setIdx] = useState(0);
  const current = sorted[Math.min(idx, sorted.length - 1)];

  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl(current.url) ?? ""}
        alt={name}
        className="h-56 w-full rounded-lg border border-border object-cover sm:h-72"
      />
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`Фото ${i + 1}`}
              aria-pressed={i === idx}
              onClick={() => setIdx(i)}
              className={cn(
                "flex-none overflow-hidden rounded border-2 transition-colors",
                i === idx ? "border-primary" : "border-transparent hover:border-border-strong",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(photo.url) ?? ""} alt="" className="h-14 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VenueEvents({ venueId }: { venueId: number }) {
  // Фиксируем нижнюю границу на маунте — меняющийся queryKey зациклил бы рефетчи.
  const [dateFrom] = useState(() => new Date().toISOString());
  const query = useEvents({ venue_id: venueId, date_from: dateFrom, limit: 5 });

  if (query.isPending || query.isError || query.data.items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-extrabold text-fg">Ближайшие события в зале</h2>
      <div className="space-y-3">
        {query.data.items.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

export function VenueDetail({ venue }: { venue: VenueRead }) {
  const { data: me } = useMe();
  const canEdit = isModerator(me?.role);
  const verify = useVerifyVenue();
  const rating = venueRatingLabel(venue);
  const schedule = parseWeekSchedule(venue.working_hours);
  const hours = schedule ? null : workingHoursLabel(venue.working_hours);
  const tables = tablesCount(venue);
  const phoneHref = venue.phone ? `tel:${venue.phone.replace(/[^+\d]/g, "")}` : null;

  return (
    <div className="space-y-4">
      {venue.photos.length > 0 && <Gallery photos={venue.photos} name={venue.name} />}

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          {venue.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-skill-beginner/12 px-[9px] py-[3px] text-xs font-bold text-skill-beginner">
              <IconShieldCheck size={13} />
              Проверен
            </span>
          )}
          {tables != null && <Badge>{tablesLabel(tables)}</Badge>}
        </div>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-fg">{venue.name}</h1>
          {rating && (
            <span className="inline-flex items-center gap-1.5 text-base font-extrabold text-skill-pro">
              <IconStar size={18} />
              {rating}
              <span className="text-[13px] font-semibold text-muted">
                · {reviewsLabel(venue.reviews_count)}
              </span>
            </span>
          )}
        </div>

        <div className="mt-3 space-y-2 text-[14px] font-medium text-fg-2">
          <p className="flex items-center gap-2">
            <IconPin size={16} className="flex-none text-muted" />
            {venue.address}
          </p>
          {schedule ? (
            <VenueHours schedule={schedule} />
          ) : (
            hours && (
              <p className="flex items-center gap-2">
                <IconClock size={16} className="flex-none text-muted" />
                {hours}
              </p>
            )
          )}
          {venue.phone && (
            <p className="flex items-center gap-2">
              <IconPhone size={16} className="flex-none text-muted" />
              <a href={phoneHref ?? undefined} className="hover:text-primary">
                {venue.phone}
              </a>
            </p>
          )}
          {venue.website && (
            <p className="flex items-center gap-2">
              <IconExternalLink size={16} className="flex-none text-muted" />
              <a
                href={websiteUrl(venue.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-primary"
              >
                {websiteLabel(venue.website)}
              </a>
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <a
            href={routeUrl(venue)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({})}
          >
            <IconRoute size={16} />
            Маршрут
          </a>
          {phoneHref && (
            <a href={phoneHref} className={buttonStyles({ variant: "secondary" })}>
              <IconPhone size={16} />
              Позвонить
            </a>
          )}
          {canEdit && (
            <Link
              href={`/venues/${venue.slug}/edit`}
              className={buttonStyles({ variant: "secondary" })}
            >
              <IconPencil size={16} />
              Редактировать зал
            </Link>
          )}
          {canEdit && (
            <Button
              variant={venue.is_verified ? "ghost" : "secondary"}
              disabled={verify.isPending}
              onClick={() =>
                verify.mutate(
                  { venueId: venue.id, isVerified: !venue.is_verified },
                  {
                    onSuccess: () =>
                      toast.success(venue.is_verified ? "Верификация снята" : "Зал проверен"),
                  },
                )
              }
            >
              <IconShieldCheck size={16} />
              {venue.is_verified ? "Снять проверку" : "Отметить проверенным"}
            </Button>
          )}
        </div>
      </div>

      {venue.description && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-2 text-lg font-extrabold text-fg">О зале</h2>
          <p className="text-[14px] leading-relaxed whitespace-pre-line text-fg-2">
            {venue.description}
          </p>
        </section>
      )}

      {venue.price_info && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-2 text-lg font-extrabold text-fg">Цены</h2>
          <p className="text-[14px] leading-relaxed whitespace-pre-line text-fg-2">
            {venue.price_info}
          </p>
        </section>
      )}

      <HallMapSection venue={venue} />

      <VenuesMap
        points={[
          {
            id: venue.id,
            slug: venue.slug,
            name: venue.name,
            address: venue.address,
            lat: venue.lat,
            lng: venue.lng,
          },
        ]}
        zoom={15}
        showCard={false}
        className="h-64 sm:h-80"
      />

      <VenueEvents venueId={venue.id} />

      <ReviewsSection
        targetType="venue"
        targetId={venue.id}
        loginNext={`/venues/${venue.slug}`}
        denormAvg={Number(venue.rating_avg)}
        denormCount={venue.reviews_count}
      />

      <div className="flex justify-end">
        <ReportButton targetType="venue" targetId={venue.id} loginNext={`/venues/${venue.slug}`} />
      </div>
    </div>
  );
}
