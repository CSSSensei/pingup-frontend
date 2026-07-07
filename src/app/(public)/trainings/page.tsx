import { TrainingsListView } from "@/components/features/trainings-list-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { LinkButton } from "@/components/ui/link-button";
import { IconPlus } from "@/components/ui/icons";

export const metadata = {
  title: "Тренировки по настольному теннису — Смоленск",
  description:
    "Групповые тренировки и спарринги по настольному теннису в Смоленске.",
  alternates: { canonical: "/trainings" },
};

export default function TrainingsPage() {
  return (
    <PublicShell>
      <PageHeader
        title="Тренировки"
        description={`Групповые и спарринги`}
        actions={
          <LinkButton href="/trainings/new" size="sm">
            <IconPlus size={16} />
            Создать тренировку
          </LinkButton>
        }
      />
      <TrainingsListView />
    </PublicShell>
  );
}
