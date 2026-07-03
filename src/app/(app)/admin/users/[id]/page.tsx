"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import { RoleGuard } from "@/components/auth/role-guard";
import { AdminUserDetailView } from "@/components/features/admin/admin-user-detail-view";

export default function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  return (
    <RoleGuard min="admin">
      <AdminUserDetailView id={userId} />
    </RoleGuard>
  );
}
