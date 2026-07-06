"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { bookingsApi } from "@/lib/api/endpoints/bookings";
import { venuesApi } from "@/lib/api/endpoints/venues";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import { useAuthStatus } from "@/hooks/useMe";
import type { AdminReviewUpdatePayload, EventUpdatePayload } from "@/types/api";

const authed = (status: string) => status === "authed";

export function useManagedVenues() {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.managedVenues(),
    queryFn: () => venuesApi.managed(),
    enabled: authed(status),
  });
}

export function useVenueBookings(venueId: number, enabled = true) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.venueBookings(venueId),
    queryFn: () => venuesApi.bookings(venueId),
    enabled: authed(status) && enabled && venueId > 0,
  });
}

export function useCancelVenueBooking(venueId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),
    onError: handleApiError,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.venueBookings(venueId) }),
  });
}

export function useVenueModEvents(venueId: number, enabled = true) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.venueModEvents(venueId),
    queryFn: () => venuesApi.moderation.events(venueId, { include_deleted: true }),
    enabled: authed(status) && enabled && venueId > 0,
  });
}

export function useVenueModEventActions(venueId: number) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.venueModEvents(venueId) });
  return {
    update: useMutation({
      mutationFn: (vars: { id: number; body: EventUpdatePayload }) =>
        venuesApi.moderation.updateEvent(venueId, vars.id, vars.body),
      onError: handleApiError,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (vars: { id: number; hard?: boolean }) =>
        venuesApi.moderation.deleteEvent(venueId, vars.id, vars.hard),
      onError: handleApiError,
      onSuccess: invalidate,
    }),
  };
}

export function useVenueModReviews(venueId: number, enabled = true) {
  const status = useAuthStatus();
  return useQuery({
    queryKey: qk.venueModReviews(venueId),
    queryFn: () => venuesApi.moderation.reviews(venueId, { include_deleted: true }),
    enabled: authed(status) && enabled && venueId > 0,
  });
}

export function useVenueModReviewActions(venueId: number) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.venueModReviews(venueId) });
  return {
    update: useMutation({
      mutationFn: (vars: { id: number; body: AdminReviewUpdatePayload }) =>
        venuesApi.moderation.updateReview(venueId, vars.id, vars.body),
      onError: handleApiError,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (vars: { id: number; hard?: boolean }) =>
        venuesApi.moderation.deleteReview(venueId, vars.id, vars.hard),
      onError: handleApiError,
      onSuccess: invalidate,
    }),
  };
}
