import { PartnersListView } from "@/components/features/partners-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { LinkButton } from "@/components/ui/link-button";
import { IconPlus } from "@/components/ui/icons";
import { CITY_NAME } from "@/lib/constants";

export const metadata = {
  title: "Поиск напарника по настольному теннису — Смоленск",
  description:
    "Объявления о поиске напарника для игры в настольный теннис в Смоленске: находите партнёров близкого уровня и договаривайтесь о встрече.",
};

export default function PartnersPage() {
  return (
    <PublicShell>
      <PageHeader
        title="Напарники"
        description={`Объявления о поиске партнёров по игре · ${CITY_NAME}`}
        actions={
          <LinkButton href="/partners/new" size="sm">
            <IconPlus size={16} />
            Объявление
          </LinkButton>
        }
      />
      <PartnersListView />
    </PublicShell>
  );
}
