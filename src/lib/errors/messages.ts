import { ApiError } from "@/lib/api/client";

// По умолчанию доверяем русскому message бэка; CODE_MESSAGES — точечные оверрайды.
const CODE_MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: "Этот email уже занят.",
  EMAIL_NOT_VERIFIED: "Подтвердите email, чтобы продолжить.",
  CITY_NOT_FOUND: "Город не найден.",
  INVALID_TOKEN: "Ссылка недействительна или устарела.",
  CSRF_INVALID: "Сессия устарела — обновите страницу и попробуйте снова.",
  REFRESH_REUSE_DETECTED: "Сессия завершена. Войдите заново.",
  RATE_LIMITED: "Слишком много попыток. Попробуйте позже.",
  INVALID_TENNIS67_URL:
    "Ссылка должна вести на теннис67.рф — например https://теннис67.рф/rating/personal.php?sportsman=9292",
  TENNIS67_NOT_LINKED: "Сначала привяжите профиль теннис67.рф.",
};

// Коды дженерик-конвертов: их message бесполезен пользователю → фолбэк по статусу.
const GENERIC_CODES = new Set(["VALIDATION_ERROR", "HTTP_ERROR", "INTERNAL_ERROR"]);

const STATUS_FALLBACK: Record<number, string> = {
  400: "Проверьте введённые данные.",
  401: "Нужно войти в аккаунт.",
  403: "Недостаточно прав для этого действия.",
  404: "Ничего не найдено.",
  409: "Действие не удалось — попробуйте ещё раз.",
  422: "Проверьте введённые данные.",
  429: "Слишком много запросов. Попробуйте позже.",
  500: "Что-то пошло не так. Попробуйте ещё раз.",
  503: "Сервис временно недоступен.",
};

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const override = CODE_MESSAGES[error.code];
    if (override) return override;
    if (error.message && !GENERIC_CODES.has(error.code)) return error.message;
    return STATUS_FALLBACK[error.status] ?? "Произошла ошибка.";
  }
  return "Не удалось соединиться с сервером.";
}

// 422-конверт бэкенда → ошибки по полям формы (loc = ["body", "field"]).
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.status !== 422) return {};
  const out: Record<string, string> = {};
  for (const d of error.details ?? []) {
    const field = d.loc?.[d.loc.length - 1];
    if (typeof field === "string" && d.msg) out[field] = d.msg;
  }
  return out;
}
