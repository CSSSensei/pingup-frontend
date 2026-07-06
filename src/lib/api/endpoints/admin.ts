import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  AdminEventFilterParams,
  AuditLogFilterParams,
  AuditLogRead,
  AdminReviewFilterParams,
  AdminReviewUpdatePayload,
  AdminTournamentCreatePayload,
  AdminTournamentFilterParams,
  AdminTournamentUpdatePayload,
  AdminUserDetail,
  AdminUserFilterParams,
  AdminUserRead,
  AdminVenueFilterParams,
  BanPayload,
  EventRead,
  EventUpdatePayload,
  Paginated,
  ParticipantAdminUpdatePayload,
  ProfileMe,
  RatingSyncLogFilterParams,
  RatingSyncLogRead,
  RatingSyncRunResult,
  ReviewRead,
  RunAllResult,
  SetRolePayload,
  SetSuperuserPayload,
  TournamentParticipantRead,
  TournamentRead,
  VenueCreatePayload,
  VenueRead,
  UserVenueRoleRead,
  VenueStaffCreatePayload,
  VenueStaffRead,
  VenueStaffRole,
  VenueUpdatePayload,
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

const A = `${API_PREFIX}/admin`;

export const adminApi = {
  users: {
    list: (filter: AdminUserFilterParams = {}) =>
      apiFetch<Paginated<AdminUserRead>>(`${A}/users${toQuery(filter)}`),
    get: (id: number) => apiFetch<AdminUserDetail>(`${A}/users/${id}`),
    ban: (id: number, body: BanPayload) =>
      apiFetch<AdminUserRead>(`${A}/users/${id}/ban`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    unban: (id: number) =>
      apiFetch<AdminUserRead>(`${A}/users/${id}/unban`, { method: "POST" }),
    setRole: (id: number, body: SetRolePayload) =>
      apiFetch<AdminUserRead>(`${A}/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    setSuperuser: (id: number, body: SetSuperuserPayload) =>
      apiFetch<AdminUserRead>(`${A}/users/${id}/superuser`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: number) => apiFetch<void>(`${A}/users/${id}`, { method: "DELETE" }),
    venueRoles: (id: number) =>
      apiFetch<UserVenueRoleRead[]>(`${A}/users/${id}/venue-roles`),
  },

  venues: {
    list: (filter: AdminVenueFilterParams = {}) =>
      apiFetch<Paginated<VenueRead>>(`${A}/venues${toQuery(filter)}`),
    create: (body: VenueCreatePayload) =>
      apiFetch<VenueRead>(`${A}/venues`, { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: VenueUpdatePayload) =>
      apiFetch<VenueRead>(`${A}/venues/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: number, hard = false) =>
      apiFetch<void>(`${A}/venues/${id}${hard ? "?hard=true" : ""}`, { method: "DELETE" }),
    restore: (id: number) =>
      apiFetch<VenueRead>(`${A}/venues/${id}/restore`, { method: "POST" }),
    // Верификация зала — модераторский эндпоинт в user-дереве (не admin_update, там нет is_verified).
    verify: (id: number, isVerified: boolean) =>
      apiFetch<VenueRead>(`${API_PREFIX}/venues/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ is_verified: isVerified }),
      }),
    listStaff: (id: number) =>
      apiFetch<VenueStaffRead[]>(`${A}/venues/${id}/staff`),
    addStaff: (id: number, body: VenueStaffCreatePayload) =>
      apiFetch<VenueStaffRead[]>(`${A}/venues/${id}/staff`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    removeStaff: (id: number, userId: number, role: VenueStaffRole) =>
      apiFetch<VenueStaffRead[]>(
        `${A}/venues/${id}/staff${toQuery({ user_id: userId, role })}`,
        { method: "DELETE" },
      ),
  },

  events: {
    list: (filter: AdminEventFilterParams = {}) =>
      apiFetch<Paginated<EventRead>>(`${A}/events${toQuery(filter)}`),
    update: (id: number, body: EventUpdatePayload) =>
      apiFetch<EventRead>(`${A}/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: number, hard = false) =>
      apiFetch<void>(`${A}/events/${id}${hard ? "?hard=true" : ""}`, { method: "DELETE" }),
    restore: (id: number) =>
      apiFetch<EventRead>(`${A}/events/${id}/restore`, { method: "POST" }),
  },

  tournaments: {
    list: (filter: AdminTournamentFilterParams = {}) =>
      apiFetch<Paginated<TournamentRead>>(`${A}/tournaments${toQuery(filter)}`),
    create: (body: AdminTournamentCreatePayload) =>
      apiFetch<TournamentRead>(`${A}/tournaments`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: number, body: AdminTournamentUpdatePayload) =>
      apiFetch<TournamentRead>(`${A}/tournaments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: number, hard = false) =>
      apiFetch<void>(`${A}/tournaments/${id}${hard ? "?hard=true" : ""}`, { method: "DELETE" }),
    updateParticipant: (
      tournamentId: number,
      userId: number,
      body: ParticipantAdminUpdatePayload,
    ) =>
      apiFetch<TournamentParticipantRead>(
        `${A}/tournaments/${tournamentId}/participants/${userId}`,
        { method: "PATCH", body: JSON.stringify(body) },
      ),
  },

  reviews: {
    list: (filter: AdminReviewFilterParams = {}) =>
      apiFetch<Paginated<ReviewRead>>(`${A}/reviews${toQuery(filter)}`),
    update: (id: number, body: AdminReviewUpdatePayload) =>
      apiFetch<ReviewRead>(`${A}/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: number, hard = false) =>
      apiFetch<void>(`${A}/reviews/${id}${hard ? "?hard=true" : ""}`, { method: "DELETE" }),
  },

  ratingSync: {
    log: (filter: RatingSyncLogFilterParams = {}) =>
      apiFetch<Paginated<RatingSyncLogRead>>(`${A}/rating-sync/log${toQuery(filter)}`),
    stale: (params: { limit?: number; offset?: number } = {}) =>
      apiFetch<Paginated<ProfileMe>>(`${A}/rating-sync/stale${toQuery(params)}`),
    run: (profileId: number) =>
      apiFetch<RatingSyncRunResult>(`${A}/rating-sync/run`, {
        method: "POST",
        body: JSON.stringify({ profile_id: profileId }),
      }),
    runAll: () => apiFetch<RunAllResult>(`${A}/rating-sync/run-all`, { method: "POST" }),
  },

  audit: {
    list: (filter: AuditLogFilterParams = {}) =>
      apiFetch<Paginated<AuditLogRead>>(`${A}/audit${toQuery(filter)}`),
    get: (id: number) => apiFetch<AuditLogRead>(`${A}/audit/${id}`),
  },
};
