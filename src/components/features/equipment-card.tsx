"use client";

import { useState } from "react";

import { equipmentPhotoUrl, type EquipmentKind } from "@/lib/api/endpoints/equipment";

export interface EquipmentData {
  blade: string | null;
  rubberForehand: string | null;
  rubberBackhand: string | null;
}

// Фото модели подтягивается фоном; пока не готово — эндпоинт 404, миниатюру прячем.
function Thumb({ kind, model }: { kind: EquipmentKind; model: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={equipmentPhotoUrl(kind, model)}
      alt=""
      loading="lazy"
      onError={() => setOk(false)}
      className="size-14 flex-none rounded border border-border bg-surface-2 object-contain"
    />
  );
}

export function EquipmentCard({ data }: { data: EquipmentData }) {
  const rows: [string, string | null, EquipmentKind][] = [
    ["Основа", data.blade, "blade"],
    ["Накладка форхенд", data.rubberForehand, "rubber"],
    ["Накладка бекхенд", data.rubberBackhand, "rubber"],
  ];
  if (rows.every(([, v]) => !v)) return null;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-3 text-sm font-bold text-fg-2">Экипировка</h2>
      <dl className="grid gap-4 sm:grid-cols-3">
        {rows.map(([label, value, kind]) =>
          value ? (
            <div key={label} className="flex items-center gap-3">
              <Thumb kind={kind} model={value} />
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-muted">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-fg break-words">{value}</dd>
              </div>
            </div>
          ) : null,
        )}
      </dl>
    </section>
  );
}
