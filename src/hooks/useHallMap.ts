"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { bookingsApi } from "@/lib/api/endpoints/bookings";
import { venuesApi } from "@/lib/api/endpoints/venues";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import type { BookingCreatePayload, HallLayout, HallLayoutUpdatePayload } from "@/types/api";

export function useVenueLayout(venueId: number, date: string) {
  return useQuery({
    queryKey: qk.venueLayout(venueId, date),
    queryFn: () => venuesApi.getLayout(venueId, date),
    enabled: !!venueId && !!date,
    // Смена дня не мигает скелетом — держим прошлую схему до прихода новой.
    placeholderData: keepPreviousData,
  });
}

export function useSaveHallLayout(venueId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: HallLayoutUpdatePayload) => venuesApi.updateLayout(venueId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.venueLayouts(venueId) });
    },
    onError: handleApiError,
  });
}

export function useCreateBooking(venueId: number, date: string) {
  const qc = useQueryClient();
  const key = qk.venueLayout(venueId, date);
  return useMutation({
    mutationFn: (body: BookingCreatePayload) => bookingsApi.create(body),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HallLayout>(key);
      if (prev) {
        qc.setQueryData<HallLayout>(key, {
          ...prev,
          tables: prev.tables.map((t) =>
            t.id === body.table_id
              ? {
                  ...t,
                  bookings: [
                    ...t.bookings,
                    {
                      id: -1,
                      starts_at: body.starts_at,
                      ends_at: body.ends_at,
                      is_mine: true,
                      event_id: null,
                      event_title: null,
                      event_type: null,
                    },
                  ],
                }
              : t,
          ),
        });
      }
      return { prev };
    },
    onError: (err, _body, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      handleApiError(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.venueLayouts(venueId) });
    },
  });
}

export function useCancelBooking(venueId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.venueLayouts(venueId) });
    },
    onError: handleApiError,
  });
}
