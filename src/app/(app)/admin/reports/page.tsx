import { RoleGuard } from "@/components/auth/role-guard";
import { ReportsQueueView } from "@/components/features/admin/reports-queue-view";

export const metadata = { title: "Жалобы — модерация" };

export default function AdminReportsPage() {
  return (
    <RoleGuard min="moderator">
      <ReportsQueueView />
    </RoleGuard>
  );
}
