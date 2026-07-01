"use client";

import { useQuery } from "@tanstack/react-query";

import { eventsApi } from "@/lib/api/endpoints/events";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";
import type { MyEventsParams } from "@/types/api";

export function useMyEvents(params: MyEventsParams = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.myEvents(params),
    queryFn: () => eventsApi.mine(params),
    enabled: status === "authed",
  });
}
