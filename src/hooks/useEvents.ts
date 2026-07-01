"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { eventsApi } from "@/lib/api/endpoints/events";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";
import type { EventFilterParams, EventRead } from "@/types/api";

export function useEvents(filter: EventFilterParams) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.events(filter),
    queryFn: () => eventsApi.list(filter),
    // До окончания silent-refresh запрос ушёл бы без Bearer и is_joined = null.
    enabled: status !== "idle" && status !== "authenticating",
  });
}

export function useEvent(id: number) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.event(id),
    queryFn: () => eventsApi.get(id),
    // Ждём итог silent-refresh: иначе первый запрос уходит без Bearer и is_joined = null.
    enabled: Number.isFinite(id) && status !== "idle" && status !== "authenticating",
  });
}

export function useJoinEvent(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => eventsApi.join(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.event(id) });
      const prev = qc.getQueryData<EventRead>(qk.event(id));
      if (prev) qc.setQueryData<EventRead>(qk.event(id), { ...prev, is_joined: true });
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.event(id), ctx.prev);
      handleApiError(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.event(id) });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["myEvents"] });
    },
  });
}

export function useLeaveEvent(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => eventsApi.leave(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.event(id) });
      const prev = qc.getQueryData<EventRead>(qk.event(id));
      if (prev) qc.setQueryData<EventRead>(qk.event(id), { ...prev, is_joined: false });
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.event(id), ctx.prev);
      handleApiError(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.event(id) });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["myEvents"] });
    },
  });
}
