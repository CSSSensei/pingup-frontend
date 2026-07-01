// Разрешаем редирект только на внутренний путь сайта — защита от open-redirect
// через ?next= (//evil.com, /\evil.com, абсолютные URL отсекаются).
export function safeInternalPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
