"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { profilesApi } from "@/lib/api/endpoints/profiles";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";
import type { ProfileFilterParams, ProfileMe, ProfileUpdate } from "@/types/api";

export function useProfiles(filter: ProfileFilterParams) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.profiles(filter),
    queryFn: () => profilesApi.list(filter),
    enabled: status !== "idle" && status !== "authenticating",
  });
}

export function useProfile(slug: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.profile(slug),
    queryFn: () => profilesApi.get(slug),
    // Ждём итог silent-refresh: контакты приходят только под Bearer.
    enabled: !!slug && status !== "idle" && status !== "authenticating",
  });
}

export function useRatingHistory(slug: string) {
  return useQuery({
    queryKey: qk.ratingHistory(slug),
    queryFn: () => profilesApi.ratingHistory(slug),
    enabled: !!slug,
  });
}

export function useMyProfile() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.myProfile,
    queryFn: profilesApi.me,
    enabled: status === "authed",
  });
}

export function useMyRatingHistory() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.myRatingHistory,
    queryFn: profilesApi.myRatingHistory,
    enabled: status === "authed",
  });
}

// Мутации профиля возвращают свежий ProfileMe — кладём его в кэши, чтобы правки
// отражались мгновенно (в т.ч. аватар/имя в шелле через ['me']).
function syncCaches(qc: ReturnType<typeof useQueryClient>, profile: ProfileMe) {
  qc.setQueryData(qk.myProfile, profile);
  qc.invalidateQueries({ queryKey: qk.me });
  if (profile.slug) qc.invalidateQueries({ queryKey: qk.profile(profile.slug) });
}

// Ошибки 422 маппит форма — без общего onError-тоста.
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfileUpdate) => profilesApi.update(patch),
    onSuccess: (profile) => syncCaches(qc, profile),
  });
}

// Ошибку загрузки обрабатывает вызывающий (best-effort в форме) — без общего onError-тоста.
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profilesApi.uploadAvatar(file),
    onSuccess: (profile) => syncCaches(qc, profile),
  });
}

export function useSetTennis67() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => profilesApi.setTennis67(url),
    onSuccess: (profile) => syncCaches(qc, profile),
  });
}

export function useSyncRating() {
  return useMutation({
    mutationFn: () => profilesApi.syncRating(),
    onError: handleApiError,
  });
}
