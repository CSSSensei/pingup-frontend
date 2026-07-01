import { PlayersListView } from "@/components/features/players-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { CITY_NAME } from "@/lib/constants";

export const metadata = {
  title: "Игроки в настольный теннис — Смоленск",
  description:
    "Каталог игроков в настольный теннис в Смоленске: рейтинг теннис67.рф, уровень, экипировка. Найдите соперника или тренера.",
};

export default function PlayersPage() {
  return (
    <PublicShell>
      <PageHeader title="Игроки" description={`Настольный теннис · ${CITY_NAME}`} />
      <PlayersListView />
    </PublicShell>
  );
}
