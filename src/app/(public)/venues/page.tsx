import { VenuesListView } from "@/components/features/venues-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { LinkButton } from "@/components/ui/link-button";
import { IconPlus } from "@/components/ui/icons";
import { CITY_NAME } from "@/lib/constants";

export const metadata = {
  title: "Залы для настольного тенниса — Смоленск",
  description:
    "Каталог залов и клубов настольного тенниса в Смоленске: адреса на карте, столы, график работы, цены и фото.",
};

export default function VenuesPage() {
  return (
    <PublicShell>
      <PageHeader
        title="Залы"
        description={`Клубы и площадки настольного тенниса · ${CITY_NAME}`}
        actions={
          <LinkButton href="/venues/new" size="sm">
            <IconPlus size={16} />
            Добавить зал
          </LinkButton>
        }
      />
      <VenuesListView />
    </PublicShell>
  );
}
