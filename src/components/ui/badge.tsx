import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  EVENT_STATUS_BADGE,
  EVENT_STATUS_LABELS,
  GENDER_LABELS,
  PARTNER_STATUS_BADGE,
  PARTNER_STATUS_LABELS,
  REPORT_STATUS_BADGE,
  REPORT_STATUS_LABELS,
  SKILL_BADGE,
  SKILL_LABELS,
  TOURNAMENT_STATUS_BADGE,
  TOURNAMENT_STATUS_LABELS,
  USER_ROLE_BADGE,
  USER_ROLE_LABELS,
  type EventStatus,
  type Gender,
  type PartnerRequestStatus,
  type ReportStatus,
  type SkillLevel,
  type TournamentStatus,
} from "@/lib/enums";

const base =
  "inline-flex items-center gap-1 rounded-pill px-[9px] py-[3px] text-xs font-bold leading-tight whitespace-nowrap";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "soft";
}) {
  return (
    <span
      className={cn(
        base,
        tone === "neutral" ? "bg-surface-3 text-fg-2" : "bg-surface-2 text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LevelBadge({ level, plus = false }: { level: SkillLevel; plus?: boolean }) {
  return (
    <span className={cn(base, SKILL_BADGE[level])}>
      {SKILL_LABELS[level]}
      {plus ? "+" : ""}
    </span>
  );
}

// Диапазон уровней одним бейджем: один уровень — просто он, диапазон — минимальный со знаком «+».
export function LevelRangeBadge({ min, max }: { min: SkillLevel | null; max: SkillLevel | null }) {
  if (min) return <LevelBadge level={min} plus={max == null || max !== min} />;
  if (max) return <LevelBadge level={max} />;
  return null;
}

export function StatusBadge({ status }: { status: EventStatus }) {
  return <span className={cn(base, EVENT_STATUS_BADGE[status])}>{EVENT_STATUS_LABELS[status]}</span>;
}

export function GenderBadge({ gender }: { gender: Gender | "all" }) {
  return <Badge>{GENDER_LABELS[gender]}</Badge>;
}

export function PartnerStatusBadge({ status }: { status: PartnerRequestStatus }) {
  return <span className={cn(base, PARTNER_STATUS_BADGE[status])}>{PARTNER_STATUS_LABELS[status]}</span>;
}

export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  return (
    <span className={cn(base, TOURNAMENT_STATUS_BADGE[status])}>
      {TOURNAMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={cn(base, REPORT_STATUS_BADGE[status])}>{REPORT_STATUS_LABELS[status]}</span>
  );
}

export function UserRoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(base, USER_ROLE_BADGE[role] ?? "bg-surface-3 text-fg-2")}>
      {USER_ROLE_LABELS[role] ?? role}
    </span>
  );
}

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
  </svg>
);

export function RatingBadge({ rating, stale = false }: { rating: number; stale?: boolean }) {
  if (stale) {
    return (
      <Badge>
        <StarIcon />
        {rating} · неактуально
      </Badge>
    );
  }
  return (
    <span className={cn(base, "bg-skill-pro/12 text-skill-pro")}>
      <StarIcon />
      {rating}
    </span>
  );
}
