import { GamesListView } from "@/components/features/games-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { LinkButton } from "@/components/ui/link-button";
import { IconPlus } from "@/components/ui/icons";
import { CITY_NAME } from "@/lib/constants";

export const metadata = {
  title: "Игры в настольный теннис — Смоленск",
  description:
    "Ближайшие игры в настольный теннис в Смоленске: находите соперников, записывайтесь и играйте.",
};

export default function GamesPage() {
  return (
    <PublicShell>
      <PageHeader
        title="Игры"
        description={`Ближайшие игры в настольный теннис · ${CITY_NAME}`}
        actions={
          <LinkButton href="/games/new" size="sm">
            <IconPlus size={16} />
            Создать игру
          </LinkButton>
        }
      />
      <GamesListView />
    </PublicShell>
  );
}
