"use client";

import { useEffect, useState } from "react";

import { equipmentApi } from "@/lib/api/endpoints/equipment";

// Справочники статичны (кеш на бэке сутки) — грузим один раз на сессию, шарим между экранами.
function listHook(fetcher: () => Promise<string[]>): () => string[] {
  let cache: Promise<string[]> | null = null;
  return function useList(): string[] {
    const [items, setItems] = useState<string[]>([]);
    useEffect(() => {
      let alive = true;
      if (!cache) {
        cache = fetcher().catch((err) => {
          cache = null;
          throw err;
        });
      }
      cache
        .then((r) => {
          if (alive) setItems(r);
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, []);
    return items;
  };
}

export const useRubbers = listHook(() => equipmentApi.rubbers());
export const useBlades = listHook(() => equipmentApi.blades());
