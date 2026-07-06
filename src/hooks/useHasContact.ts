"use client";

import { useMe } from "@/hooks/useMe";

export function useHasContact(): boolean | undefined {
  const { data: me } = useMe();
  if (!me) return undefined;
  const profile = me.profile;
  return !!(profile?.telegram_username || profile?.phone);
}
