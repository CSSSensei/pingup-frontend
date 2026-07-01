import { ComingSoon } from "@/components/common/coming-soon";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Турниры" };

export default function TournamentsPage() {
  return (
    <PublicShell>
      <ComingSoon title="Турниры" description="Официальные и любительские турниры с регистрацией — скоро." />
    </PublicShell>
  );
}
