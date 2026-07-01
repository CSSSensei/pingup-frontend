import { ComingSoon } from "@/components/common/coming-soon";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Напарники" };

export default function PartnersPage() {
  return (
    <PublicShell>
      <ComingSoon title="Напарники" description="Объявления о поиске напарника для игры — скоро." />
    </PublicShell>
  );
}
