"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminApi } from "@/lib/api/endpoints/admin";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import { useAuthStatus } from "@/hooks/useMe";
import type {
  AdminEventFilterParams,
  AuditLogFilterParams,
  AdminReviewFilterParams,
  AdminReviewUpdatePayload,
  AdminTournamentFilterParams,
  AdminTournamentUpdatePayload,
  AdminUserFilterParams,
  AdminVenueFilterParams,
  BanPayload,
  EventUpdatePayload,
  ParticipantAdminUpdatePayload,
  RatingSyncLogFilterParams,
  SetRolePayload,
  SetSuperuserPayload,
  VenueStaffCreatePayload,
  VenueStaffRole,
  VenueUpdatePayload,
} from "@/types/api";

const authed = (status: string) => status === "authed";

// ─── Пользователи ────────────────────────────────────────────────────────────

export function useAdminUsers(filter: AdminUserFilterParams) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.adminUsers(filter),
    queryFn: () => adminApi.users.list(filter),
    enabled: authed(status),
  });
}

export function useAdminUser(id: number) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.adminUser(id),
    queryFn: () => adminApi.users.get(id),
    enabled: authed(status) && Number.isFinite(id) && id > 0,
  });
}

function useUserMutation<T>(fn: (id: number) => (body: T) => Promise<unknown>, id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn(id),
    onError: handleApiError,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminUser(id) });
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

export const useBanUser = (id: number) =>
  useUserMutation<BanPayload>((uid) => (body) => adminApi.users.ban(uid, body), id);
export const useUnbanUser = (id: number) =>
  useUserMutation<void>((uid) => () => adminApi.users.unban(uid), id);
export const useSetRole = (id: number) =>
  useUserMutation<SetRolePayload>((uid) => (body) => adminApi.users.setRole(uid, body), id);
export const useSetSuperuser = (id: number) =>
  useUserMutation<SetSuperuserPayload>(
    (uid) => (body) => adminApi.users.setSuperuser(uid, body),
    id,
  );

export function useDeleteUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.users.remove(id),
    onError: handleApiError,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminUser(id) });
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

// ─── Залы ────────────────────────────────────────────────────────────────────

export function useAdminVenues(filter: AdminVenueFilterParams) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.adminVenues(filter),
    queryFn: () => adminApi.venues.list(filter),
    enabled: authed(status),
  });
}

function invalidateVenues(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["adminVenues"] });
  qc.invalidateQueries({ queryKey: ["venues"] });
}

export function useAdminVenueActions() {
  const qc = useQueryClient();
  const opts = { onError: handleApiError, onSuccess: () => invalidateVenues(qc) };
  return {
    verify: useMutation({
      mutationFn: ({ id, value }: { id: number; value: boolean }) =>
        adminApi.venues.verify(id, value),
      ...opts,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: VenueUpdatePayload }) =>
        adminApi.venues.update(id, body),
      ...opts,
    }),
    remove: useMutation({
      mutationFn: ({ id, hard }: { id: number; hard?: boolean }) =>
        adminApi.venues.remove(id, hard),
      ...opts,
    }),
    restore: useMutation({
      mutationFn: (id: number) => adminApi.venues.restore(id),
      ...opts,
    }),
  };
}

// ─── События ──────────────────────────────────────────────────────────────────

export function useAdminEvents(filter: AdminEventFilterParams) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.adminEvents(filter),
    queryFn: () => adminApi.events.list(filter),
    enabled: authed(status),
  });
}

export function useAdminEventActions() {
  const qc = useQueryClient();
  const opts = {
    onError: handleApiError,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminEvents"] }),
  };
  return {
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: EventUpdatePayload }) =>
        adminApi.events.update(id, body),
      ...opts,
    }),
    remove: useMutation({
      mutationFn: ({ id, hard }: { id: number; hard?: boolean }) =>
        adminApi.events.remove(id, hard),
      ...opts,
    }),
    restore: useMutation({
      mutationFn: (id: number) => adminApi.events.restore(id),
      ...opts,
    }),
  };
}

// ─── Турниры ──────────────────────────────────────────────────────────────────

export function useAdminTournaments(filter: AdminTournamentFilterParams) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.adminTournaments(filter),
    queryFn: () => adminApi.tournaments.list(filter),
    enabled: authed(status),
  });
}

export function useAdminTournamentActions() {
  const qc = useQueryClient();
  const opts = {
    onError: handleApiError,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminTournaments"] }),
  };
  return {
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: AdminTournamentUpdatePayload }) =>
        adminApi.tournaments.update(id, body),
      ...opts,
    }),
    remove: useMutation({
      mutationFn: ({ id, hard }: { id: number; hard?: boolean }) =>
        adminApi.tournaments.remove(id, hard),
      ...opts,
    }),
    updateParticipant: useMutation({
      mutationFn: ({
        tournamentId,
        userId,
        body,
      }: {
        tournamentId: number;
        userId: number;
        body: ParticipantAdminUpdatePayload;
      }) => adminApi.tournaments.updateParticipant(tournamentId, userId, body),
      onError: handleApiError,
    }),
  };
}

// ─── Отзывы ────────────────────────────────────────────────────────────────────

export function useAdminReviews(filter: AdminReviewFilterParams) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.adminReviews(filter),
    queryFn: () => adminApi.reviews.list(filter),
    enabled: authed(status),
  });
}

export function useAdminReviewActions() {
  const qc = useQueryClient();
  const opts = {
    onError: handleApiError,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminReviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  };
  return {
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: AdminReviewUpdatePayload }) =>
        adminApi.reviews.update(id, body),
      ...opts,
    }),
    remove: useMutation({
      mutationFn: ({ id, hard }: { id: number; hard?: boolean }) =>
        adminApi.reviews.remove(id, hard),
      ...opts,
    }),
  };
}

// ─── Синхронизация рейтинга ─────────────────────────────────────────────────────

export function useRatingSyncLog(filter: RatingSyncLogFilterParams) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.ratingSyncLog(filter),
    queryFn: () => adminApi.ratingSync.log(filter),
    enabled: authed(status),
  });
}

export function useRatingSyncStale(params: { limit?: number; offset?: number }) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.ratingSyncStale(params),
    queryFn: () => adminApi.ratingSync.stale(params),
    enabled: authed(status),
  });
}

export function useVenueStaff(venueId: number, enabled = true) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.venueStaff(venueId),
    queryFn: () => adminApi.venues.listStaff(venueId),
    enabled: authed(status) && enabled && venueId > 0,
  });
}

export function useVenueStaffActions(venueId: number) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.venueStaff(venueId) });
  return {
    add: useMutation({
      mutationFn: (body: VenueStaffCreatePayload) => adminApi.venues.addStaff(venueId, body),
      onError: handleApiError,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (vars: { userId: number; role: VenueStaffRole }) =>
        adminApi.venues.removeStaff(venueId, vars.userId, vars.role),
      onError: handleApiError,
      onSuccess: invalidate,
    }),
  };
}

export function useAuditLog(filter: AuditLogFilterParams) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.auditLog(filter),
    queryFn: () => adminApi.audit.list(filter),
    enabled: authed(status),
  });
}

export function useUserVenueRoles(userId: number) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.userVenueRoles(userId),
    queryFn: () => adminApi.users.venueRoles(userId),
    enabled: authed(status) && userId > 0,
  });
}

export function useUserVenueRoleActions(userId: number) {
  const qc = useQueryClient();
  const invalidate = (venueId: number) => {
    qc.invalidateQueries({ queryKey: qk.userVenueRoles(userId) });
    qc.invalidateQueries({ queryKey: qk.venueStaff(venueId) });
  };
  return {
    add: useMutation({
      mutationFn: (v: { venueId: number; role: VenueStaffRole }) =>
        adminApi.venues.addStaff(v.venueId, { user_id: userId, role: v.role }),
      onError: handleApiError,
      onSuccess: (_d, v) => invalidate(v.venueId),
    }),
    remove: useMutation({
      mutationFn: (v: { venueId: number; role: VenueStaffRole }) =>
        adminApi.venues.removeStaff(v.venueId, userId, v.role),
      onError: handleApiError,
      onSuccess: (_d, v) => invalidate(v.venueId),
    }),
  };
}

export function useRatingSyncActions() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["ratingSyncLog"] });
    qc.invalidateQueries({ queryKey: ["ratingSyncStale"] });
  };
  return {
    run: useMutation({
      mutationFn: (profileId: number) => adminApi.ratingSync.run(profileId),
      onError: handleApiError,
      onSuccess: invalidate,
    }),
    runAll: useMutation({
      mutationFn: () => adminApi.ratingSync.runAll(),
      onError: handleApiError,
      onSuccess: invalidate,
    }),
  };
}
