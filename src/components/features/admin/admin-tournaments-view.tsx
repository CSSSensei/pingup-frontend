"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DeleteRestoreControls } from "@/components/features/admin/delete-restore-controls";
import { Pager } from "@/components/features/admin/admin-venues-view";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Badge, TournamentStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { IconExternalLink, IconTrophy } from "@/components/ui/icons";
import { useAdminTournamentActions, useAdminTournaments } from "@/hooks/useAdmin";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import {
  TOURNAMENT_STATUSES,
  TOURNAMENT_STATUS_LABELS,
  type TournamentStatus,
} from "@/lib/enums";
import { formatDate } from "@/lib/format";
import type { AdminTournamentFilterParams, TournamentRead } from "@/types/api";

const LIMIT = 30;
type OfficialFilter = "" | "official" | "unofficial";

export function AdminTournamentsView() {
  const [status, setStatus] = useState<TournamentStatus | "">("");
  const [official, setOfficial] = useState<OfficialFilter>("");
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

  const filter: AdminTournamentFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(official === "official" ? { is_official: true } : {}),
    ...(official === "unofficial" ? { is_official: false } : {}),
    ...(includeDeleted ? { include_deleted: true } : {}),
    limit: LIMIT,
    offset,
  };

  const query = useAdminTournaments(filter);
  const actions = useAdminTournamentActions();
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const reset = () => setOffset(0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Турниры" description="Официальные турниры и модерация" />

      <div className="mb-5 space-y-3">
        <Input
          placeholder="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="max-w-[200px]"
            aria-label="Статус"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TournamentStatus | "");
              reset();
            }}
          >
            <option value="">Все статусы</option>
            {TOURNAMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TOURNAMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select
            className="max-w-[180px]"
            aria-label="Официальность"
            value={official}
            onChange={(e) => {
              setOfficial(e.target.value as OfficialFilter);
              reset();
            }}
          >
            <option value="">Все турниры</option>
            <option value="official">Официальные</option>
            <option value="unofficial">Пользовательские</option>
          </Select>
          <label className="flex items-center gap-2 text-sm font-semibold text-fg-2">
            <Switch
              checked={includeDeleted}
              onCheckedChange={(v) => {
                setIncludeDeleted(v);
                reset();
              }}
            />
            Удалённые
          </label>
        </div>
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={<IconTrophy size={32} />} title="Турниров нет" />
      ) : (
        <>
          <div className="space-y-2.5">
            {items.map((t) => (
              <TournamentRow key={t.id} tournament={t} actions={actions} />
            ))}
          </div>
          <Pager offset={offset} total={total} onChange={setOffset} limit={LIMIT} />
        </>
      )}
    </div>
  );
}

function TournamentRow({
  tournament,
  actions,
}: {
  tournament: TournamentRead;
  actions: ReturnType<typeof useAdminTournamentActions>;
}) {
  const deleted = tournament.deleted_at != null;
  const busy =
    (actions.update.isPending && actions.update.variables?.id === tournament.id) ||
    (actions.remove.isPending && actions.remove.variables?.id === tournament.id);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-bold text-fg">{tournament.title}</p>
            <TournamentStatusBadge status={tournament.status} />
            {tournament.is_official && (
              <Badge className="bg-primary-tint text-primary">Официальный</Badge>
            )}
            {deleted && (
              <Badge className="bg-status-cancelled/12 text-status-cancelled">Удалён</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {formatDate(tournament.starts_at)} · {tournament.participants_count} участников · #
            {tournament.id}
          </p>
        </div>
        <Link
          href={`/tournaments/${tournament.slug}`}
          className="flex-none text-muted hover:text-fg"
          aria-label="Открыть турнир"
        >
          <IconExternalLink size={16} />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {!deleted && (
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() =>
                actions.update.mutate(
                  { id: tournament.id, body: { is_official: !tournament.is_official } },
                  {
                    onSuccess: () =>
                      toast.success(
                        tournament.is_official
                          ? "Статус «официальный» снят"
                          : "Турнир помечен официальным",
                      ),
                  },
                )
              }
            >
              {tournament.is_official ? "Сделать обычным" : "Сделать официальным"}
            </Button>
            <Select
              className="h-8 max-w-[200px] py-0 text-xs"
              aria-label="Изменить статус"
              value={tournament.status}
              disabled={busy}
              onChange={(e) =>
                actions.update.mutate(
                  { id: tournament.id, body: { status: e.target.value as TournamentStatus } },
                  { onSuccess: () => toast.success("Статус обновлён") },
                )
              }
            >
              {TOURNAMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TOURNAMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </>
        )}
        <DeleteRestoreControls
          deleted={deleted}
          entity="турнир"
          busy={busy}
          onSoftDelete={() =>
            actions.remove.mutate(
              { id: tournament.id },
              { onSuccess: () => toast.success("Турнир удалён") },
            )
          }
          onHardDelete={() =>
            actions.remove.mutate(
              { id: tournament.id, hard: true },
              { onSuccess: () => toast.success("Турнир удалён навсегда") },
            )
          }
        />
      </div>
    </div>
  );
}
