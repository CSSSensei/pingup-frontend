import { RoleGuard } from "@/components/auth/role-guard";
import { AdminRatingSyncView } from "@/components/features/admin/admin-rating-sync-view";

export const metadata = { title: "Синхронизация рейтинга — админка" };

export default function AdminRatingSyncPage() {
  return (
    <RoleGuard min="admin">
      <AdminRatingSyncView />
    </RoleGuard>
  );
}
