"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tournamentsApi } from "@/lib/api/endpoints/tournaments";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";
import type {
  MyTournamentsParams,
  TournamentCreatePayload,
  TournamentFilterParams,
  TournamentRead,
  TournamentUpdatePayload,
} from "@/types/api";

export function useTournaments(filter: TournamentFilterParams) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.tournaments(filter),
    queryFn: () => tournamentsApi.list(filter),
    // Ждём итог silent-refresh: иначе первый запрос уходит без Bearer и is_registered = null.
    enabled: status !== "idle" && status !== "authenticating",
  });
}

export function useTournament(slug: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.tournament(slug),
    queryFn: () => tournamentsApi.get(slug),
    enabled: !!slug && status !== "idle" && status !== "authenticating",
  });
}

// Участники публичны — авторизации ждать не нужно.
export function useTournamentParticipants(id: number, enabled = true) {
  return useQuery({
    queryKey: qk.tournamentParticipants(id),
    queryFn: () => tournamentsApi.participants(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
  });
}

export function useMyTournaments(params: MyTournamentsParams = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.myTournaments(params),
    queryFn: () => tournamentsApi.mine(params),
    enabled: status === "authed",
  });
}

// create/update без onError — форма сама мапит 422 на поля.
export function useCreateTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TournamentCreatePayload) => tournamentsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
    },
  });
}

// Slug не меняется при редактировании (генерится из title лишь при создании).
export function useUpdateTournament(id: number, slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TournamentUpdatePayload) => tournamentsApi.update(id, body),
    onSuccess: (tournament) => {
      qc.setQueryData(qk.tournament(slug), tournament);
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
    },
  });
}

export function useDeleteTournament(id: number, slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => tournamentsApi.remove(id),
    onError: handleApiError,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tournament(slug) });
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
    },
  });
}

export function useRegisterTournament(id: number, slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => tournamentsApi.register(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.tournament(slug) });
      const prev = qc.getQueryData<TournamentRead>(qk.tournament(slug));
      if (prev) {
        qc.setQueryData<TournamentRead>(qk.tournament(slug), {
          ...prev,
          is_registered: true,
          participants_count: prev.participants_count + 1,
        });
      }
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.tournament(slug), ctx.prev);
      handleApiError(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.tournament(slug) });
      qc.invalidateQueries({ queryKey: ["tournament", id, "participants"] });
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
    },
  });
}

export function useUnregisterTournament(id: number, slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => tournamentsApi.unregister(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.tournament(slug) });
      const prev = qc.getQueryData<TournamentRead>(qk.tournament(slug));
      if (prev) {
        qc.setQueryData<TournamentRead>(qk.tournament(slug), {
          ...prev,
          is_registered: false,
          participants_count: Math.max(0, prev.participants_count - 1),
        });
      }
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.tournament(slug), ctx.prev);
      handleApiError(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.tournament(slug) });
      qc.invalidateQueries({ queryKey: ["tournament", id, "participants"] });
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
    },
  });
}
