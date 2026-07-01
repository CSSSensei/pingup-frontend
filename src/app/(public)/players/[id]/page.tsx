import { ComingSoon } from "@/components/common/coming-soon";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Профиль игрока" };

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  await params;
  return (
    <PublicShell>
      <ComingSoon
        title="Профиль игрока"
        description="Публичная страница игрока с рейтингом теннис67 — скоро."
      />
    </PublicShell>
  );
}
