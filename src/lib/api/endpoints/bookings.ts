import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type { BookingCreatePayload, BookingRead } from "@/types/api";

export const bookingsApi = {
  create: (body: BookingCreatePayload) =>
    apiFetch<BookingRead>(`${API_PREFIX}/bookings`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  cancel: (bookingId: number) =>
    apiFetch<void>(`${API_PREFIX}/bookings/${bookingId}`, { method: "DELETE" }),
};
