import { VenuesListView } from "@/components/features/venues-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { LinkButton } from "@/components/ui/link-button";
import { IconPlus } from "@/components/ui/icons";

export const metadata = {
  title: "Залы для настольного тенниса — Смоленск",
  description:
    "Каталог залов настольного тенниса в Смоленске: адреса на карте, столы, график работы, цены и фото.",
  alternates: { canonical: "/venues" },
};

export default function VenuesPage() {
  return (
    <PublicShell>
      <PageHeader
        title="Залы"
        description={`Клубы и площадки для настольного тенниса`}
        actions={
          <LinkButton href="/venues/new" size="sm">
            <IconPlus size={16} />
            Создать зал
          </LinkButton>
        }
      />
      <VenuesListView />
    </PublicShell>
  );
}
