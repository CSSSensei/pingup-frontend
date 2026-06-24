export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Профиль игрока #{id}</h1>
      <p className="mt-2 text-gray-500">Раздел в разработке.</p>
    </main>
  );
}
