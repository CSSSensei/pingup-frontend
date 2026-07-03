import { RoleGuard } from "@/components/auth/role-guard";
import { AdminHub } from "@/components/features/admin/admin-hub";

export const metadata = { title: "Модерация" };

export default function AdminPage() {
  return (
    <RoleGuard min="moderator">
      <AdminHub />
    </RoleGuard>
  );
}
