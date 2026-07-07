import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  AdminEventFilterParams,
  AdminReviewFilterParams,
  AdminReviewUpdatePayload,
  EventRead,
  EventUpdatePayload,
  HallLayout,
  HallLayoutUpdatePayload,
  ManagedVenueRead,
  Paginated,
  ReviewRead,
  ScheduleException,
  ScheduleExceptionCreatePayload,
  VenueBookingRead,
  VenueCreatePayload,
  VenueFilterParams,
  VenuePhoto,
  VenueRead,
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

export const venuesApi = {
  list: (filter: VenueFilterParams = {}) =>
    apiFetch<Paginated<VenueRead>>(`${API_PREFIX}/venues${toQuery(filter)}`),

  get: (slug: string) => apiFetch<VenueRead>(`${API_PREFIX}/venues/${slug}`),

  create: (body: VenueCreatePayload) =>
    apiFetch<VenueRead>(`${API_PREFIX}/venues`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (venueId: number, body: VenueUpdatePayload) =>
    apiFetch<VenueRead>(`${API_PREFIX}/venues/${venueId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getLayout: (venueId: number, date?: string) =>
    apiFetch<HallLayout>(`${API_PREFIX}/venues/${venueId}/layout${toQuery({ date })}`),

  updateLayout: (venueId: number, body: HallLayoutUpdatePayload) =>
    apiFetch<HallLayout>(`${API_PREFIX}/venues/${venueId}/layout`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  // Фото — multipart; грузить может владелец зала (или модератор).
  addPhoto: (venueId: number, file: File, opts: { sortOrder?: number; isCover?: boolean } = {}) => {
    const form = new FormData();
    form.append("file", file);
    form.append("sort_order", String(opts.sortOrder ?? 0));
    form.append("is_cover", String(opts.isCover ?? false));
    return apiFetch<VenuePhoto>(`${API_PREFIX}/venues/${venueId}/photos`, {
      method: "POST",
      body: form,
    });
  },

  deletePhoto: (venueId: number, photoId: number) =>
    apiFetch<void>(`${API_PREFIX}/venues/${venueId}/photos/${photoId}`, { method: "DELETE" }),

  // Верификация зала — доступна модератору (не только админке).
  verify: (venueId: number, isVerified: boolean) =>
    apiFetch<VenueRead>(`${API_PREFIX}/venues/${venueId}/verify`, {
      method: "POST",
      body: JSON.stringify({ is_verified: isVerified }),
    }),

  managed: () => apiFetch<ManagedVenueRead[]>(`${API_PREFIX}/venues/managed`),

  bookings: (venueId: number) =>
    apiFetch<VenueBookingRead[]>(`${API_PREFIX}/venues/${venueId}/bookings`),

  scheduleExceptions: {
    list: (venueId: number, params: { from?: string; to?: string } = {}) =>
      apiFetch<ScheduleException[]>(
        `${API_PREFIX}/venues/${venueId}/schedule-exceptions${toQuery(params)}`,
      ),
    create: (venueId: number, body: ScheduleExceptionCreatePayload) =>
      apiFetch<ScheduleException>(`${API_PREFIX}/venues/${venueId}/schedule-exceptions`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    remove: (venueId: number, excId: number) =>
      apiFetch<void>(`${API_PREFIX}/venues/${venueId}/schedule-exceptions/${excId}`, {
        method: "DELETE",
      }),
  },

  moderation: {
    events: (venueId: number, filter: AdminEventFilterParams = {}) =>
      apiFetch<Paginated<EventRead>>(
        `${API_PREFIX}/venues/${venueId}/events${toQuery(filter)}`,
      ),
    updateEvent: (venueId: number, eventId: number, body: EventUpdatePayload) =>
      apiFetch<EventRead>(`${API_PREFIX}/venues/${venueId}/events/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    deleteEvent: (venueId: number, eventId: number, hard = false) =>
      apiFetch<void>(
        `${API_PREFIX}/venues/${venueId}/events/${eventId}${hard ? "?hard=true" : ""}`,
        { method: "DELETE" },
      ),
    reviews: (venueId: number, filter: AdminReviewFilterParams = {}) =>
      apiFetch<Paginated<ReviewRead>>(
        `${API_PREFIX}/venues/${venueId}/reviews${toQuery(filter)}`,
      ),
    updateReview: (venueId: number, reviewId: number, body: AdminReviewUpdatePayload) =>
      apiFetch<ReviewRead>(`${API_PREFIX}/venues/${venueId}/reviews/${reviewId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    deleteReview: (venueId: number, reviewId: number, hard = false) =>
      apiFetch<void>(
        `${API_PREFIX}/venues/${venueId}/reviews/${reviewId}${hard ? "?hard=true" : ""}`,
        { method: "DELETE" },
      ),
  },
};
