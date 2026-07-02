import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  EventCreatePayload,
  EventFilterParams,
  EventParticipant,
  EventRead,
  EventUpdatePayload,
  MyEventsParams,
  Paginated,
} from "@/types/api";
import type { ParticipantStatus } from "@/lib/enums";

function toQuery(params: object): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    sp.set(key, String(value));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const eventsApi = {
  list: (filter: EventFilterParams = {}) =>
    apiFetch<Paginated<EventRead>>(`${API_PREFIX}/events${toQuery(filter)}`),

  get: (id: number) => apiFetch<EventRead>(`${API_PREFIX}/events/${id}`),

  create: (body: EventCreatePayload) =>
    apiFetch<EventRead>(`${API_PREFIX}/events`, { method: "POST", body: JSON.stringify(body) }),

  update: (id: number, body: EventUpdatePayload) =>
    apiFetch<EventRead>(`${API_PREFIX}/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (id: number) => apiFetch<void>(`${API_PREFIX}/events/${id}`, { method: "DELETE" }),

  join: (id: number) =>
    apiFetch<EventParticipant>(`${API_PREFIX}/events/${id}/join`, { method: "POST" }),

  leave: (id: number) =>
    apiFetch<void>(`${API_PREFIX}/events/${id}/leave`, { method: "DELETE" }),

  participants: (id: number, status?: ParticipantStatus) =>
    apiFetch<Paginated<EventParticipant>>(
      `${API_PREFIX}/events/${id}/participants${toQuery({ status, limit: 100 })}`,
    ),

  confirm: (id: number, userId: number) =>
    apiFetch<EventParticipant>(`${API_PREFIX}/events/${id}/participants/${userId}/confirm`, {
      method: "POST",
    }),

  decline: (id: number, userId: number) =>
    apiFetch<EventParticipant>(`${API_PREFIX}/events/${id}/participants/${userId}/decline`, {
      method: "POST",
    }),

  kick: (id: number, userId: number) =>
    apiFetch<void>(`${API_PREFIX}/events/${id}/participants/${userId}`, { method: "DELETE" }),

  mine: (params: MyEventsParams = {}) =>
    apiFetch<Paginated<EventRead>>(`${API_PREFIX}/profiles/me/events${toQuery(params)}`),
};
