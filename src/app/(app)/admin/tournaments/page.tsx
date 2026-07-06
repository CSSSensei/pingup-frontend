import { RoleGuard } from "@/components/auth/role-guard";
import { AdminTournamentsView } from "@/components/features/admin/admin-tournaments-view";

export const metadata = { title: "Турниры — админка" };

export default function AdminTournamentsPage() {
  return (
    <RoleGuard min="moderator">
      <AdminTournamentsView />
    </RoleGuard>
  );
}
