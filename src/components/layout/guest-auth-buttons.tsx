import Link from "next/link";

export function GuestAuthButtons() {
  return (
    <>
      <Link
        href="/login"
        className="inline-flex h-10 items-center rounded px-3 text-sm font-bold text-fg-2 transition-colors hover:text-fg"
      >
        Войти
      </Link>
      <Link
        href="/register"
        className="inline-flex h-10 items-center rounded bg-fg px-4 text-sm font-bold text-white transition-colors hover:bg-fg-2"
      >
        Регистрация
      </Link>
    </>
  );
}
