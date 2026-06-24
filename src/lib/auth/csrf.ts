const CSRF_COOKIE = "csrf_token";

// Double-submit CSRF: значение из читаемой cookie дублируется в заголовок X-CSRF-Token.
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
