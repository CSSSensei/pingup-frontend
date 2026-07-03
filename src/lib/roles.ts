import type { UserRole } from "@/types/api";

const ROLE_RANK: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  moderator: 2,
  admin: 3,
};

// Клиентская проверка роли — только для скрытия UI; настоящий гейт на бэке.
export function hasRole(role: UserRole | undefined, min: UserRole): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

export const isModerator = (role: UserRole | undefined) => hasRole(role, "moderator");
export const isAdmin = (role: UserRole | undefined) => hasRole(role, "admin");
