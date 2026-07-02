import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  Paginated,
  ReviewCreatePayload,
  ReviewFilterParams,
  ReviewRead,
  ReviewUpdatePayload,
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

export const reviewsApi = {
  list: (filter: ReviewFilterParams = {}) =>
    apiFetch<Paginated<ReviewRead>>(`${API_PREFIX}/reviews${toQuery(filter)}`),

  create: (body: ReviewCreatePayload) =>
    apiFetch<ReviewRead>(`${API_PREFIX}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: ReviewUpdatePayload) =>
    apiFetch<ReviewRead>(`${API_PREFIX}/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (id: number) => apiFetch<void>(`${API_PREFIX}/reviews/${id}`, { method: "DELETE" }),
};
