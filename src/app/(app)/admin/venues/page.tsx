import { RoleGuard } from "@/components/auth/role-guard";
import { AdminVenuesView } from "@/components/features/admin/admin-venues-view";

export const metadata = { title: "Залы — админка" };

export default function AdminVenuesPage() {
  return (
    <RoleGuard min="admin">
      <AdminVenuesView />
    </RoleGuard>
  );
}
