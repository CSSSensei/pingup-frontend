import { ComingSoon } from "@/components/common/coming-soon";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Тренировки" };

export default function TrainingsPage() {
  return (
    <PublicShell>
      <ComingSoon title="Тренировки" description="Групповые тренировки и спарринги с тренером — скоро." />
    </PublicShell>
  );
}
