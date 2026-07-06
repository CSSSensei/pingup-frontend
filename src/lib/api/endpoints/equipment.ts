import { apiFetch, BASE_URL } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";

export type EquipmentKind = "rubber" | "blade";

export const equipmentApi = {
  rubbers: () => apiFetch<string[]>(`${API_PREFIX}/equipment/rubbers`),
  blades: () => apiFetch<string[]>(`${API_PREFIX}/equipment/blades`),
};

// Прямой URL картинки модели — редиректит на /media, 404 если фото ещё не готово.
export function equipmentPhotoUrl(kind: EquipmentKind, model: string): string {
  return `${BASE_URL}${API_PREFIX}/equipment/photo?kind=${kind}&model=${encodeURIComponent(model)}`;
}
