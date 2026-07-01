"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IconSearch } from "@/components/ui/icons";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/games?q=${encodeURIComponent(q)}` : "/games");
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-[600px] flex-col gap-2.5 sm:flex-row">
      <div className="flex h-[52px] flex-1 items-center gap-2.5 rounded border border-border bg-surface px-4 shadow-card">
        <IconSearch className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти игру, зал или турнир…"
          className="flex-1 border-0 bg-transparent text-base text-fg outline-none placeholder:text-zinc-400 sm:text-[15px]"
          aria-label="Поиск"
        />
      </div>
      <Button type="submit" size="lg" className="h-[52px] px-6">
        Найти игру
      </Button>
    </form>
  );
}
