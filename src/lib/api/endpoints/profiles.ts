import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  Paginated,
  ProfileDetail,
  ProfileFilterParams,
  ProfileMe,
  ProfilePublic,
  ProfileUpdate,
  RatingHistory,
  RatingSyncAccepted,
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

export const profilesApi = {
  list: (filter: ProfileFilterParams = {}) =>
    apiFetch<Paginated<ProfilePublic>>(`${API_PREFIX}/profiles${toQuery(filter)}`),

  // Публичный профиль по slug — под Bearer вернёт контакты, гостю нет.
  get: (slug: string) => apiFetch<ProfileDetail>(`${API_PREFIX}/profiles/${slug}`),

  ratingHistory: (slug: string) =>
    apiFetch<RatingHistory>(`${API_PREFIX}/profiles/${slug}/rating-history`),

  me: () => apiFetch<ProfileMe>(`${API_PREFIX}/profiles/me`),

  myRatingHistory: () => apiFetch<RatingHistory>(`${API_PREFIX}/profiles/me/rating-history`),

  update: (patch: ProfileUpdate) =>
    apiFetch<ProfileMe>(`${API_PREFIX}/profiles/me`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  // Привязка теннис67.рф — отдельный эндпоинт (валидирует хост + вытягивает sportsman-id).
  setTennis67: (tennis67_url: string) =>
    apiFetch<ProfileMe>(`${API_PREFIX}/profiles/me/tennis67`, {
      method: "PUT",
      body: JSON.stringify({ tennis67_url }),
    }),

  // Ручной ре-синк рейтинга — 202, результат приходит позже уведомлением rating_updated.
  syncRating: () =>
    apiFetch<RatingSyncAccepted>(`${API_PREFIX}/profiles/me/rating-sync`, { method: "POST" }),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<ProfileMe>(`${API_PREFIX}/profiles/me/avatar`, {
      method: "POST",
      body: form,
    });
  },
};
