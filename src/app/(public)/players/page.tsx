import { ComingSoon } from "@/components/common/coming-soon";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Игроки" };

export default function PlayersPage() {
  return (
    <PublicShell>
      <ComingSoon title="Игроки" description="Каталог игроков с рейтингом теннис67 — скоро." />
    </PublicShell>
  );
}
