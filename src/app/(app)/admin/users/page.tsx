import { RoleGuard } from "@/components/auth/role-guard";
import { AdminUsersView } from "@/components/features/admin/admin-users-view";

export const metadata = { title: "Пользователи — админка" };

export default function AdminUsersPage() {
  return (
    <RoleGuard min="moderator">
      <AdminUsersView />
    </RoleGuard>
  );
}
