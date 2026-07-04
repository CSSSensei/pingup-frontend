import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { IconClock, IconPaddle, IconPin, IconShieldCheck, IconStar } from "@/components/ui/icons";
import { formatDistance } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import {
  coverPhoto,
  reviewsLabel,
  tablesCount,
  tablesLabel,
  venueRatingLabel,
  workingHoursLabel,
} from "@/lib/venues";
import type { VenueRead } from "@/types/api";

const stripes =
  "repeating-linear-gradient(45deg, var(--color-surface-2), var(--color-surface-2) 11px, var(--color-surface-3) 11px, var(--color-surface-3) 22px)";

export function VenueCard({ venue }: { venue: VenueRead }) {
  const cover = mediaUrl(coverPhoto(venue));
  const rating = venueRatingLabel(venue);
  const hours = workingHoursLabel(venue.working_hours);
  const tables = tablesCount(venue);
  const hasMap = venue.map_tables_count > 0;

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-colors hover:border-border-strong"
    >
      <div className="relative h-[118px]" style={cover ? undefined : { background: stripes }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={venue.name} className="size-full object-cover" />
        ) : (
          <>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-wider text-muted">
              фото зала
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/ball.svg"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="absolute right-3 -bottom-3.5 drop-shadow-md select-none"
            />
          </>
        )}
        {venue.is_verified && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-pill bg-surface/95 px-2 py-1 text-[11.5px] font-extrabold text-skill-beginner shadow-card">
            <IconShieldCheck size={13} />
            Проверен
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15.5px] leading-tight font-extrabold text-fg">{venue.name}</h3>
          {rating && (
            <span className="inline-flex flex-none items-center gap-1 text-[13.5px] font-extrabold text-skill-pro">
              <IconStar size={15} />
              {rating}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[13.5px] text-fg-2">
          <IconPin size={15} className="flex-none text-muted" />
          <span className="truncate">{venue.address}</span>
          {venue.distance_km != null && <Badge tone="soft">{formatDistance(venue.distance_km)}</Badge>}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {tables != null && (
            <Badge>
              {hasMap && <IconPaddle size={12} className="text-primary" />}
              {tablesLabel(tables)}
            </Badge>
          )}
          <Badge tone="soft">{reviewsLabel(venue.reviews_count)}</Badge>
        </div>

        {hours && (
          <div className="mt-auto flex items-center gap-1.5 text-[12.5px] text-muted">
            <IconClock size={14} className="flex-none" />
            <span className="truncate">{hours}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
