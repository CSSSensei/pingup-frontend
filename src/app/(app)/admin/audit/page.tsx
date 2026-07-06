import { RoleGuard } from "@/components/auth/role-guard";
import { AdminAuditView } from "@/components/features/admin/admin-audit-view";

export const metadata = { title: "Аудит-журнал — админка" };

export default function AdminAuditPage() {
  return (
    <RoleGuard min="admin">
      <AdminAuditView />
    </RoleGuard>
  );
}
