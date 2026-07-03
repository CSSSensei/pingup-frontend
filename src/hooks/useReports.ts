"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reportsApi } from "@/lib/api/endpoints/reports";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import { useAuthStatus } from "@/hooks/useMe";
import type {
  MyReportsFilterParams,
  ReportCreatePayload,
  ReportQueueFilterParams,
  ReportResolvePayload,
} from "@/types/api";

// Форма сама решает, что делать с ошибкой (SELF_REPORT/TARGET_NOT_FOUND/EMAIL гейт) → без onError.
export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReportCreatePayload) => reportsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myReports"] }),
  });
}

export function useMyReports(filter: MyReportsFilterParams = {}) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.myReports(filter),
    queryFn: () => reportsApi.listMine(filter),
    enabled: status === "authed",
  });
}

export function useReportQueue(filter: ReportQueueFilterParams) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.reportQueue(filter),
    queryFn: () => reportsApi.queue(filter),
    enabled: status === "authed",
  });
}

export function useReport(id: number) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.report(id),
    queryFn: () => reportsApi.get(id),
    enabled: status === "authed" && Number.isFinite(id) && id > 0,
  });
}

export function useResolveReport(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReportResolvePayload) => reportsApi.resolve(id, body),
    onError: handleApiError,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reportQueue"] });
      qc.invalidateQueries({ queryKey: qk.report(id) });
    },
  });
}
