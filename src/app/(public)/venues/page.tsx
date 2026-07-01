import { ComingSoon } from "@/components/common/coming-soon";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Залы" };

export default function VenuesPage() {
  return (
    <PublicShell>
      <ComingSoon title="Залы" description="Каталог залов на карте Смоленска с фото и отзывами — скоро." />
    </PublicShell>
  );
}
