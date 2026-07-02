"use client";

import { useEffect, useRef, useState } from "react";

import { LinkButton } from "@/components/ui/link-button";
import { IconPin, IconX } from "@/components/ui/icons";
import { SMOLENSK_CENTER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  MAPS_API_KEY,
  markerElement,
  loadYmaps3,
  type YMapInstance,
  type YMapsApi,
} from "@/components/maps/ymaps";

export interface MapPoint {
  id: number;
  slug: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

function centerOf(points: MapPoint[]): { lat: number; lng: number } {
  if (points.length === 0) return SMOLENSK_CENTER;
  const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
  return { lat, lng };
}

export function VenuesMap({
  points,
  zoom = 12,
  showCard = true,
  className,
}: {
  points: MapPoint[];
  zoom?: number;
  // Карточка выбранного зала по клику на маркер (на детали зала не нужна).
  showCard?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<YMapsApi | null>(null);
  const mapRef = useRef<YMapInstance | null>(null);
  const markersRef = useRef<object[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    MAPS_API_KEY ? "loading" : "unavailable",
  );
  const [selected, setSelected] = useState<MapPoint | null>(null);

  useEffect(() => {
    if (!MAPS_API_KEY) return;
    let cancelled = false;
    loadYmaps3().then((api) => {
      if (cancelled) return;
      if (!api || !containerRef.current) {
        setStatus("unavailable");
        return;
      }
      const c = centerOf(points);
      const map = new api.YMap(containerRef.current, {
        location: { center: [c.lng, c.lat], zoom },
      });
      map.addChild(new api.YMapDefaultSchemeLayer());
      map.addChild(new api.YMapDefaultFeaturesLayer({ zIndex: 1800 }));
      apiRef.current = api;
      mapRef.current = map;
      setStatus("ready");
    });
    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // Карта создаётся один раз; points/zoom подхватывает эффект маркеров ниже.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    const map = mapRef.current;
    if (status !== "ready" || !api || !map) return;

    for (const m of markersRef.current) map.removeChild(m);
    markersRef.current = points.map((point) => {
      const el = markerElement({ button: showCard });
      el.title = point.name;
      if (showCard) el.addEventListener("click", () => setSelected(point));
      const marker = new api.YMapMarker({ coordinates: [point.lng, point.lat] }, el);
      map.addChild(marker);
      return marker;
    });

    const c = centerOf(points);
    map.setLocation({ center: [c.lng, c.lat], zoom, duration: 200 });
  }, [status, points, zoom, showCard]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border", className)}>
      <div ref={containerRef} className="absolute inset-0" />

      {status === "unavailable" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-surface-2 px-6 text-center">
          <IconPin size={28} className="text-muted" />
          <p className="text-sm font-bold text-fg-2">Карта недоступна</p>
          <p className="text-xs text-muted">Не задан ключ API Яндекс Карт</p>
        </div>
      )}
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden="true" />
      )}

      {showCard && selected && (
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-pop">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-fg">{selected.name}</p>
            <p className="truncate text-xs text-muted">{selected.address}</p>
          </div>
          <LinkButton href={`/venues/${selected.slug}`} size="sm" className="flex-none">
            Открыть
          </LinkButton>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => setSelected(null)}
            className="flex-none rounded p-1 text-muted hover:bg-surface-2 hover:text-fg"
          >
            <IconX size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
