import { TrainingsListView } from "@/components/features/trainings-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { LinkButton } from "@/components/ui/link-button";
import { IconPlus } from "@/components/ui/icons";
import { CITY_NAME } from "@/lib/constants";

export const metadata = {
  title: "Тренировки по настольному теннису — Смоленск",
  description:
    "Групповые тренировки и личные спарринги по настольному теннису в Смоленске — с тренером и без.",
};

export default function TrainingsPage() {
  return (
    <PublicShell>
      <PageHeader
        title="Тренировки"
        description={`Групповые тренировки и спарринги · ${CITY_NAME}`}
        actions={
          <LinkButton href="/trainings/new" size="sm">
            <IconPlus size={16} />
            Создать
          </LinkButton>
        }
      />
      <TrainingsListView />
    </PublicShell>
  );
}
