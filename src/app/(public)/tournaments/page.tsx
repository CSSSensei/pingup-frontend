import { TournamentsListView } from "@/components/features/tournaments-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { LinkButton } from "@/components/ui/link-button";
import { IconPlus } from "@/components/ui/icons";
import { CITY_NAME } from "@/lib/constants";

export const metadata = {
  title: "Турниры по настольному теннису — Смоленск",
  description:
    "Официальные и любительские турниры по настольному теннису в Смоленске: расписание, категории и регистрация.",
};

export default function TournamentsPage() {
  return (
    <PublicShell>
      <PageHeader
        title="Турниры"
        description={`Официальные и любительские турниры`}
        actions={
          <LinkButton href="/tournaments/new" size="sm">
            <IconPlus size={16} />
            Создать турнир
          </LinkButton>
        }
      />
      <TournamentsListView />
    </PublicShell>
  );
}
