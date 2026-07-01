"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { partnersApi } from "@/lib/api/endpoints/partners";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";
import type {
  MyPartnerRequestsParams,
  PartnerCloseStatus,
  PartnerRequestCreatePayload,
  PartnerRequestFilterParams,
  PartnerResponseCreatePayload,
} from "@/types/api";

export function usePartnerRequests(filter: PartnerRequestFilterParams) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.partnerRequests(filter),
    queryFn: () => partnersApi.list(filter),
    // Ждём итог silent-refresh: иначе первый запрос уходит без Bearer и has_responded = null.
    enabled: status !== "idle" && status !== "authenticating",
  });
}

export function usePartnerRequest(id: number) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.partnerRequest(id),
    queryFn: () => partnersApi.get(id),
    enabled: Number.isFinite(id) && status !== "idle" && status !== "authenticating",
  });
}

export function useMyPartnerRequests(params: MyPartnerRequestsParams = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.myPartnerRequests(params),
    queryFn: () => partnersApi.mine(params),
    enabled: status === "authed",
  });
}

export function usePartnerResponses(id: number, enabled = true) {
  return useQuery({
    queryKey: qk.partnerResponses(id),
    queryFn: () => partnersApi.responses(id),
    enabled: enabled && Number.isFinite(id),
  });
}

// Ошибки обрабатывает форма (маппинг 422 на поля) — без общего onError-тоста.
export function useCreatePartnerRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PartnerRequestCreatePayload) => partnersApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partnerRequests"] });
      qc.invalidateQueries({ queryKey: ["myPartnerRequests"] });
    },
  });
}

export function useRespondPartner(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PartnerResponseCreatePayload) => partnersApi.respond(id, body),
    onError: handleApiError,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.partnerRequest(id) });
      qc.invalidateQueries({ queryKey: ["partnerRequests"] });
    },
  });
}

export function useClosePartnerRequest(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: PartnerCloseStatus) => partnersApi.close(id, status),
    onError: handleApiError,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.partnerRequest(id) });
      qc.invalidateQueries({ queryKey: qk.partnerResponses(id) });
      qc.invalidateQueries({ queryKey: ["partnerRequests"] });
      qc.invalidateQueries({ queryKey: ["myPartnerRequests"] });
    },
  });
}

export function useDeletePartnerRequest(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => partnersApi.remove(id),
    onError: handleApiError,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partnerRequests"] });
      qc.invalidateQueries({ queryKey: ["myPartnerRequests"] });
    },
  });
}
