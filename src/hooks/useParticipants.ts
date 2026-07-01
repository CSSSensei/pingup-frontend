"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { eventsApi } from "@/lib/api/endpoints/events";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import type { ParticipantStatus } from "@/lib/enums";

export function useEventParticipants(id: number, status?: ParticipantStatus) {
  return useQuery({
    queryKey: qk.eventParticipants(id, status),
    queryFn: () => eventsApi.participants(id, status),
    enabled: Number.isFinite(id),
  });
}

function invalidateParticipants(qc: ReturnType<typeof useQueryClient>, id: number) {
  qc.invalidateQueries({ queryKey: ["event", id, "participants"] });
  qc.invalidateQueries({ queryKey: qk.event(id) });
}

export function useConfirmParticipant(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => eventsApi.confirm(id, userId),
    onError: handleApiError,
    onSettled: () => invalidateParticipants(qc, id),
  });
}

export function useDeclineParticipant(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => eventsApi.decline(id, userId),
    onError: handleApiError,
    onSettled: () => invalidateParticipants(qc, id),
  });
}

export function useKickParticipant(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => eventsApi.kick(id, userId),
    onError: handleApiError,
    onSettled: () => invalidateParticipants(qc, id),
  });
}
