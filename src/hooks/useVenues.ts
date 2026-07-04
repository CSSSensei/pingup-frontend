"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { venuesApi } from "@/lib/api/endpoints/venues";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import type { VenueCreatePayload, VenueFilterParams, VenueUpdatePayload } from "@/types/api";

export function useVenues(filter: VenueFilterParams) {
  return useQuery({
    queryKey: qk.venues(filter),
    queryFn: () => venuesApi.list(filter),
  });
}

export function useVenue(slug: string) {
  return useQuery({
    queryKey: qk.venue(slug),
    queryFn: () => venuesApi.get(slug),
    enabled: !!slug,
  });
}

// Ошибки обрабатывает форма (маппинг 422 на поля) — без общего onError-тоста.
export function useCreateVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: VenueCreatePayload) => venuesApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venues"] });
    },
  });
}

// Ошибки маппит форма (422 → поля) — без общего onError-тоста.
export function useUpdateVenue(venueId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: VenueUpdatePayload) => venuesApi.update(venueId, body),
    onSuccess: (venue) => {
      qc.setQueryData(qk.venue(venue.slug), venue);
      qc.invalidateQueries({ queryKey: ["venues"] });
      qc.invalidateQueries({ queryKey: ["venue"] });
    },
  });
}

// Фото грузятся best-effort после создания зала — ошибку показывает вызывающий.
export function useAddVenuePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      venueId,
      file,
      sortOrder,
      isCover,
    }: {
      venueId: number;
      file: File;
      sortOrder?: number;
      isCover?: boolean;
    }) => venuesApi.addPhoto(venueId, file, { sortOrder, isCover }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venues"] });
      qc.invalidateQueries({ queryKey: ["venue"] });
    },
  });
}

export function useDeleteVenuePhoto(venueId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: number) => venuesApi.deletePhoto(venueId, photoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venues"] });
      qc.invalidateQueries({ queryKey: ["venue"] });
    },
    onError: handleApiError,
  });
}

export function useVerifyVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, isVerified }: { venueId: number; isVerified: boolean }) =>
      venuesApi.verify(venueId, isVerified),
    onSuccess: (venue) => {
      qc.setQueryData(qk.venue(venue.slug), venue);
      qc.invalidateQueries({ queryKey: ["venues"] });
    },
    onError: handleApiError,
  });
}
