"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DeleteRestoreControls } from "@/components/features/admin/delete-restore-controls";
import { VenueStaffModal } from "@/components/features/admin/venue-staff-manager";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { IconBuilding, IconExternalLink, IconShieldCheck, IconUsers } from "@/components/ui/icons";
import { useAdminVenueActions, useAdminVenues } from "@/hooks/useAdmin";
import { useMe } from "@/hooks/useMe";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { isAdmin } from "@/lib/roles";
import type { AdminVenueFilterParams, VenueRead } from "@/types/api";

const LIMIT = 30;
type VerifiedFilter = "" | "verified" | "unverified";

export function AdminVenuesView() {
  const [verified, setVerified] = useState<VerifiedFilter>("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setOffset(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const filter: AdminVenueFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    ...(q ? { q } : {}),
    ...(verified === "verified" ? { is_verified: true } : {}),
    ...(verified === "unverified" ? { is_verified: false } : {}),
    ...(includeDeleted ? { include_deleted: true } : {}),
    limit: LIMIT,
    offset,
  };

  const query = useAdminVenues(filter);
  const actions = useAdminVenueActions();
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Залы" description="Верификация и модерация залов" />

      <div className="mb-5 space-y-3">
        <Input
          placeholder="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Select
            className="max-w-[190px]"
            aria-label="Верификация"
            value={verified}
            onChange={(e) => {
              setVerified(e.target.value as VerifiedFilter);
              setOffset(0);
            }}
          >
            <option value="">Все залы</option>
            <option value="verified">Проверенные</option>
            <option value="unverified">Непроверенные</option>
          </Select>
          <label className="flex items-center gap-2 text-sm font-semibold text-fg-2">
            <Switch
              checked={includeDeleted}
              onCheckedChange={(v) => {
                setIncludeDeleted(v);
                setOffset(0);
              }}
            />
            Показывать удалённые
          </label>
        </div>
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={<IconBuilding size={32} />} title="Залов нет" />
      ) : (
        <>
          <div className="space-y-2.5">
            {items.map((v) => (
              <VenueRow key={v.id} venue={v} actions={actions} />
            ))}
          </div>
          <Pager offset={offset} total={total} onChange={setOffset} />
        </>
      )}
    </div>
  );
}

function VenueRow({
  venue,
  actions,
}: {
  venue: VenueRead;
  actions: ReturnType<typeof useAdminVenueActions>;
}) {
  const { data: me } = useMe();
  const admin = isAdmin(me?.role);
  const [staffOpen, setStaffOpen] = useState(false);
  const deleted = venue.deleted_at != null;
  const busy =
    (actions.verify.isPending && actions.verify.variables?.id === venue.id) ||
    (actions.remove.isPending && actions.remove.variables?.id === venue.id) ||
    (actions.restore.isPending && actions.restore.variables === venue.id);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-bold text-fg">{venue.name}</p>
            {venue.is_verified ? (
              <Badge className="bg-status-confirmed/12 text-status-confirmed">
                <IconShieldCheck size={12} /> Проверен
              </Badge>
            ) : (
              <Badge className="bg-status-pending/12 text-status-pending">Не проверен</Badge>
            )}
            {deleted && (
              <Badge className="bg-status-cancelled/12 text-status-cancelled">Удалён</Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">{venue.address}</p>
          <p className="mt-0.5 text-xs text-muted">
            {venue.tables_count ? `${venue.tables_count} столов · ` : ""}
            {venue.reviews_count} отзывов · #{venue.id}
          </p>
        </div>
        <Link
          href={`/venues/${venue.slug}`}
          className="flex-none text-muted hover:text-fg"
          aria-label="Открыть зал"
        >
          <IconExternalLink size={16} />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {!deleted && (
          <Button
            variant={venue.is_verified ? "ghost" : "secondary"}
            size="sm"
            disabled={busy}
            onClick={() =>
              actions.verify.mutate(
                { id: venue.id, value: !venue.is_verified },
                {
                  onSuccess: () =>
                    toast.success(venue.is_verified ? "Верификация снята" : "Зал проверен"),
                },
              )
            }
          >
            {venue.is_verified ? "Снять проверку" : "Проверить"}
          </Button>
        )}
        {admin && !deleted && (
          <Button variant="ghost" size="sm" onClick={() => setStaffOpen(true)}>
            <IconUsers size={15} /> Персонал
          </Button>
        )}
        <DeleteRestoreControls
          deleted={deleted}
          entity="зал"
          busy={busy}
          onSoftDelete={() =>
            actions.remove.mutate(
              { id: venue.id },
              { onSuccess: () => toast.success("Зал удалён") },
            )
          }
          onHardDelete={() =>
            actions.remove.mutate(
              { id: venue.id, hard: true },
              { onSuccess: () => toast.success("Зал удалён навсегда") },
            )
          }
          onRestore={() =>
            actions.restore.mutate(venue.id, {
              onSuccess: () => toast.success("Зал восстановлен"),
            })
          }
        />
      </div>

      {admin && (
        <VenueStaffModal
          venueId={venue.id}
          venueName={venue.name}
          open={staffOpen}
          onClose={() => setStaffOpen(false)}
        />
      )}
    </div>
  );
}

export function Pager({
  offset,
  total,
  onChange,
  limit = LIMIT,
}: {
  offset: number;
  total: number;
  onChange: (next: number) => void;
  limit?: number;
}) {
  if (total <= limit) return null;
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <Button
        variant="secondary"
        size="sm"
        disabled={offset === 0}
        onClick={() => onChange(Math.max(0, offset - limit))}
      >
        Назад
      </Button>
      <span className="text-xs text-muted">
        {offset + 1}–{Math.min(offset + limit, total)} из {total}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={offset + limit >= total}
        onClick={() => onChange(offset + limit)}
      >
        Вперёд
      </Button>
    </div>
  );
}
