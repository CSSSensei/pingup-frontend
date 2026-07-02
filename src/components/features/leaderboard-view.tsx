"use client";

import { useEffect, useState } from "react";

import { LeaderboardColumn } from "@/components/features/leaderboard-column";
import { IconSearch } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

export function LeaderboardView() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  // Дебаунс поиска — чтобы не дёргать оба окна на каждый символ.
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-5">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaderboardColumn gender="male" title="Мужчины" q={q} />
        <LeaderboardColumn gender="female" title="Женщины" q={q} />
      </div>
    </div>
  );
}
