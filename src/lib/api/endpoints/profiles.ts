import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type { ProfileMe, ProfileUpdate } from "@/types/api";

export const profilesApi = {
  me: () => apiFetch<ProfileMe>(`${API_PREFIX}/profiles/me`),

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

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<ProfileMe>(`${API_PREFIX}/profiles/me/avatar`, {
      method: "POST",
      body: form,
    });
  },
};
