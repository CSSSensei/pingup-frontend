"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { TournamentForm } from "@/components/features/tournament-form";
import { PageHeader } from "@/components/common/page-header";
import { IconArrowLeft } from "@/components/ui/icons";
import { toast } from "@/components/ui/toast";

export default function NewTournamentPage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href="/tournaments"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        Все турниры
      </Link>

      <PageHeader
        title="Новый турнир"
        description="Создайте турнир как черновик, затем откройте регистрацию — игроки смогут записаться."
      />

      <TournamentForm
        onSaved={(tournament) => {
          toast.success("Турнир создан");
          router.push(`/tournaments/${tournament.slug}/manage`);
        }}
      />
    </div>
  );
}
