"use client";

import { useEffect, useState } from "react";

import { LeaderboardColumn } from "@/components/features/leaderboard-column";
import { IconSearch } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import type { Gender } from "@/lib/enums";
import { cn } from "@/lib/utils";

const TABS: { key: Gender; label: string }[] = [
  { key: "male", label: "Мужчины" },
  { key: "female", label: "Женщины" },
];

export function LeaderboardView() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Gender>("male");

  // Дебаунс поиска — чтобы не дёргать оба окна на каждый символ.
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <IconSearch
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />
        <Input
          type="search"
          placeholder="Поиск игрока по имени"
          aria-label="Поиск игрока в рейтинге"
          className="h-11 pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Мобайл — переключатель между окнами; на десктопе оба видны сразу. */}
      <div role="radiogroup" aria-label="Пол" className="flex gap-1 rounded-lg bg-surface-3 p-1 lg:hidden">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors",
                active ? "bg-surface text-fg shadow-card" : "text-fg-2 hover:text-fg",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Обе колонки всегда смонтированы (переключение вкладок без ре-фетча);
          на мобиле показываем только активную через CSS, на lg — обе. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LeaderboardColumn
          gender="male"
          title="Мужчины"
          q={q}
          className={cn(tab !== "male" && "hidden", "lg:block")}
        />
        <LeaderboardColumn
          gender="female"
          title="Женщины"
          q={q}
          className={cn(tab !== "female" && "hidden", "lg:block")}
        />
      </div>
    </div>
  );
}
