"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";

import { Avatar } from "@/components/common/avatar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { LevelBadge, PartnerStatusBadge, RatingBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  useClosePartnerRequest,
  useDeletePartnerRequest,
  usePartnerRequest,
  usePartnerResponses,
} from "@/hooks/usePartners";
import { ApiError } from "@/lib/api/client";
import { formatRelative } from "@/lib/format";
import type { PartnerResponseRead } from "@/types/api";

type Dialog = "matched" | "closed" | "delete" | null;

export default function PartnerResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  const router = useRouter();
  const requestQuery = usePartnerRequest(requestId);
  const responsesQuery = usePartnerResponses(requestId);
  const close = useClosePartnerRequest(requestId);
  const remove = useDeletePartnerRequest(requestId);
  const [dialog, setDialog] = useState<Dialog>(null);

  const backHref = `/partners/${requestId}`;

  if (responsesQuery.isError) {
    const err = responsesQuery.error;
    const forbidden = err instanceof ApiError && err.status === 403;
    return (
      <Container backHref={backHref}>
        {forbidden ? (
          <EmptyState
            title="Нет доступа"
            description="Отклики видит только автор объявления."
          />
        ) : (
          <ErrorState onRetry={() => responsesQuery.refetch()} />
        )}
      </Container>
    );
  }

  const request = requestQuery.data;
  const items = responsesQuery.data?.items ?? [];
  const isActive = request?.status === "active";

  return (
    <Container backHref={backHref}>
      <PageHeader
        title="Отклики"
        description={request?.title}
        actions={request ? <PartnerStatusBadge status={request.status} /> : undefined}
      />

      {isActive && (
        <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-3">
          <Button size="sm" onClick={() => setDialog("matched")}>
            Напарник найден
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setDialog("closed")}>
            Снять с публикации
          </Button>
          <Button size="sm" variant="ghost" className="text-danger" onClick={() => setDialog("delete")}>
            Удалить
          </Button>
        </div>
      )}
      {request && !isActive && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface p-3 text-sm font-semibold text-fg-2">
          <span>Объявление больше не активно.</span>
          <Button size="sm" variant="ghost" className="text-danger" onClick={() => setDialog("delete")}>
            Удалить
          </Button>
        </div>
      )}

      {responsesQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Откликов пока нет"
          description="Как только кто-то откликнется, он появится здесь — вы сможете открыть его профиль и связаться."
        />
      ) : (
        <div className="space-y-3">
          {items.map((response) => (
            <ResponseRow key={response.id} response={response} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={dialog === "matched"}
        title="Отметить, что напарник найден?"
        message="Все откликнувшиеся получат уведомление. Объявление станет неактивным."
        confirmLabel="Напарник найден"
        loading={close.isPending}
        onConfirm={() =>
          close.mutate("matched", {
            onSuccess: () => {
              setDialog(null);
              toast.success("Отмечено: напарник найден");
            },
          })
        }
        onClose={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "closed"}
        title="Снять объявление с публикации?"
        message="Объявление скроется из списка. Отклики останутся доступны вам."
        confirmLabel="Снять"
        loading={close.isPending}
        onConfirm={() =>
          close.mutate("closed", {
            onSuccess: () => {
              setDialog(null);
              toast.success("Объявление снято с публикации");
            },
          })
        }
        onClose={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        title="Удалить объявление?"
        message="Объявление будет удалено. Это действие необратимо."
        confirmLabel="Удалить"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(undefined, {
            onSuccess: () => {
              toast.success("Объявление удалено");
              router.push("/partners");
            },
          })
        }
        onClose={() => setDialog(null)}
      />
    </Container>
  );
}

function ResponseRow({ response }: { response: PartnerResponseRead }) {
  const p = response.responder;
  const name = p?.display_name ?? "Игрок";

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={p?.avatar_url} name={name} size={42} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-fg">{name}</span>
          {p?.current_rating != null && (
            <RatingBadge rating={p.current_rating} stale={p.rating_is_stale} />
          )}
        </div>
        {p?.skill_level && <LevelBadge level={p.skill_level} />}
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        {p?.slug ? (
          <Link href={`/players/${p.slug}`} className="min-w-0 flex-1 hover:opacity-80">
            {identity}
          </Link>
        ) : (
          <div className="min-w-0 flex-1">{identity}</div>
        )}
        <span className="flex-none text-xs font-medium text-muted">
          {formatRelative(response.created_at)}
        </span>
      </div>
      {response.message && (
        <p className="mt-3 border-t border-border pt-3 text-[14px] whitespace-pre-line text-fg-2">
          {response.message}
        </p>
      )}
    </div>
  );
}

function Container({ children, backHref }: { children: React.ReactNode; backHref: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        К объявлению
      </Link>
      {children}
    </div>
  );
}
