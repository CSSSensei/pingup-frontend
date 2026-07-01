export interface EquipmentData {
  blade: string | null;
  rubberForehand: string | null;
  rubberBackhand: string | null;
}

export function EquipmentCard({ data }: { data: EquipmentData }) {
  const rows: [string, string | null][] = [
    ["Основа", data.blade],
    ["Накладка форхенд", data.rubberForehand],
    ["Накладка бекхенд", data.rubberBackhand],
  ];
  if (rows.every(([, v]) => !v)) return null;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-3 text-sm font-bold text-fg-2">Экипировка</h2>
      <dl className="grid gap-3 sm:grid-cols-3">
        {rows.map(([label, value]) =>
          value ? (
            <div key={label}>
              <dt className="text-xs font-semibold text-muted">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-fg break-words">{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
    </section>
  );
}
