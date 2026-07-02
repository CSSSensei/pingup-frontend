import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type { ParticipantStatus } from "@/lib/enums";
import type {
  MyTournamentsParams,
  Paginated,
  TournamentCreatePayload,
  TournamentFilterParams,
  TournamentParticipantRead,
  TournamentRead,
  TournamentUpdatePayload,
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

// Список/деталь адресуются по slug; register/участники/patch — по числовому id.
export const tournamentsApi = {
  list: (filter: TournamentFilterParams = {}) =>
    apiFetch<Paginated<TournamentRead>>(`${API_PREFIX}/tournaments${toQuery(filter)}`),

  get: (slug: string) => apiFetch<TournamentRead>(`${API_PREFIX}/tournaments/${slug}`),

  create: (body: TournamentCreatePayload) =>
    apiFetch<TournamentRead>(`${API_PREFIX}/tournaments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: TournamentUpdatePayload) =>
    apiFetch<TournamentRead>(`${API_PREFIX}/tournaments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (id: number) =>
    apiFetch<void>(`${API_PREFIX}/tournaments/${id}`, { method: "DELETE" }),

  participants: (id: number, status?: ParticipantStatus) =>
    apiFetch<Paginated<TournamentParticipantRead>>(
      `${API_PREFIX}/tournaments/${id}/participants${toQuery({ status, limit: 100 })}`,
    ),

  register: (id: number) =>
    apiFetch<TournamentParticipantRead>(`${API_PREFIX}/tournaments/${id}/register`, {
      method: "POST",
    }),

  unregister: (id: number) =>
    apiFetch<void>(`${API_PREFIX}/tournaments/${id}/register`, { method: "DELETE" }),

  mine: (params: MyTournamentsParams = {}) =>
    apiFetch<Paginated<TournamentRead>>(
      `${API_PREFIX}/profiles/me/tournaments${toQuery(params)}`,
    ),
};
