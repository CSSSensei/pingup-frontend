// has_session — читаемая (не httpOnly) cookie-метка живой refresh-сессии.
export function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return /(?:^|; )has_session=1(?:;|$)/.test(document.cookie);
}
