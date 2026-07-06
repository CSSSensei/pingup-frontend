import { RoleGuard } from "@/components/auth/role-guard";
import { AdminReviewsView } from "@/components/features/admin/admin-reviews-view";

export const metadata = { title: "Отзывы — админка" };

export default function AdminReviewsPage() {
  return (
    <RoleGuard min="moderator">
      <AdminReviewsView />
    </RoleGuard>
  );
}
