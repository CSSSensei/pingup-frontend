import { PlayersListView } from "@/components/features/players-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = {
  title: "Игроки в настольный теннис — Смоленск",
  description:
    "Каталог игроков в настольный теннис в Смоленске. Найдите соперника или тренера.",
};

export default function PlayersPage() {
  return (
    <PublicShell>
      <PageHeader title="Игроки" description={`Настольный теннис`} />
      <PlayersListView />
    </PublicShell>
  );
}
