import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  HallLayout,
  HallLayoutUpdatePayload,
  Paginated,
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
};
