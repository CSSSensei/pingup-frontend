import { ApiError } from "@/lib/api/client";
import { apiErrorMessage } from "@/lib/errors/messages";
import { toast } from "@/components/ui/toast";
import { useEmailGateStore } from "@/stores/emailGate";

// Дефолтный onError для мутаций: soft-email-гейт → модалка, остальное → тост.
export function handleApiError(error: unknown): void {
  if (error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED") {
    useEmailGateStore.getState().show();
    return;
  }
  toast.error(apiErrorMessage(error));
}

export function isEmailGate(error: unknown): boolean {
  return error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED";
}
