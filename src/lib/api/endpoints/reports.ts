import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  MyReportsFilterParams,
  Paginated,
  ReportCreatePayload,
  ReportDetail,
  ReportQueueFilterParams,
  ReportRead,
  ReportResolvePayload,
} from "@/types/api";

function toQuery(params: object): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    sp.set(key, String(value));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const reportsApi = {
  create: (body: ReportCreatePayload) =>
    apiFetch<ReportRead>(`${API_PREFIX}/reports`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listMine: (filter: MyReportsFilterParams = {}) =>
    apiFetch<Paginated<ReportRead>>(`${API_PREFIX}/reports/me${toQuery(filter)}`),

  // Модераторская очередь — отдельное дерево /admin/reports (гейт require_moderator на бэке).
  queue: (filter: ReportQueueFilterParams = {}) =>
    apiFetch<Paginated<ReportRead>>(`${API_PREFIX}/admin/reports${toQuery(filter)}`),

  get: (id: number) => apiFetch<ReportDetail>(`${API_PREFIX}/admin/reports/${id}`),

  resolve: (id: number, body: ReportResolvePayload) =>
    apiFetch<ReportRead>(`${API_PREFIX}/admin/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
