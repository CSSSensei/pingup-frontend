import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  MyPartnerRequestsParams,
  Paginated,
  PartnerCloseStatus,
  PartnerRequestCreatePayload,
  PartnerRequestFilterParams,
  PartnerRequestRead,
  PartnerResponseCreatePayload,
  PartnerResponseRead,
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

export const partnersApi = {
  list: (filter: PartnerRequestFilterParams = {}) =>
    apiFetch<Paginated<PartnerRequestRead>>(`${API_PREFIX}/partner-requests${toQuery(filter)}`),

  get: (id: number) => apiFetch<PartnerRequestRead>(`${API_PREFIX}/partner-requests/${id}`),

  create: (body: PartnerRequestCreatePayload) =>
    apiFetch<PartnerRequestRead>(`${API_PREFIX}/partner-requests`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  remove: (id: number) =>
    apiFetch<void>(`${API_PREFIX}/partner-requests/${id}`, { method: "DELETE" }),

  respond: (id: number, body: PartnerResponseCreatePayload) =>
    apiFetch<PartnerResponseRead>(`${API_PREFIX}/partner-requests/${id}/respond`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  responses: (id: number) =>
    apiFetch<Paginated<PartnerResponseRead>>(
      `${API_PREFIX}/partner-requests/${id}/responses${toQuery({ limit: 100 })}`,
    ),

  close: (id: number, status: PartnerCloseStatus) =>
    apiFetch<PartnerRequestRead>(`${API_PREFIX}/partner-requests/${id}/close`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  mine: (params: MyPartnerRequestsParams = {}) =>
    apiFetch<Paginated<PartnerRequestRead>>(
      `${API_PREFIX}/profiles/me/partner-requests${toQuery(params)}`,
    ),
};
