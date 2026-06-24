import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">pingUp</h1>
      <p className="mt-2 text-gray-500">
        Поиск напарника, залов, турниров и тренировок по настольному теннису. Смоленск.
      </p>
      <nav className="mt-6 flex gap-4">
        <Link className="underline" href="/venues">
          Залы
        </Link>
        <Link className="underline" href="/tournaments">
          Турниры
        </Link>
        <Link className="underline" href="/login">
          Войти
        </Link>
      </nav>
    </main>
  );
}
