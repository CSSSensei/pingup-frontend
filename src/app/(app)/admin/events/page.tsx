import { RoleGuard } from "@/components/auth/role-guard";
import { AdminEventsView } from "@/components/features/admin/admin-events-view";

export const metadata = { title: "События — админка" };

export default function AdminEventsPage() {
  return (
    <RoleGuard min="moderator">
      <AdminEventsView />
    </RoleGuard>
  );
}
