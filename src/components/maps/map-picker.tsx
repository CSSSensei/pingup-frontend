"use client";

import { useEffect, useRef, useState } from "react";

import { SMOLENSK_CENTER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  MAPS_API_KEY,
  markerElement,
  loadYmaps3,
  type YMapInstance,
  type YMapsApi,
} from "@/components/maps/ymaps";


export function MapPicker({
  value,
  onChange,
  className,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<YMapsApi | null>(null);
  const mapRef = useRef<YMapInstance | null>(null);
  const markerRef = useRef<object | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    MAPS_API_KEY ? "loading" : "unavailable",
  );

  useEffect(() => {
    if (!MAPS_API_KEY) return;
    let cancelled = false;
    loadYmaps3().then((api) => {
      if (cancelled) return;
      if (!api || !containerRef.current) {
        setStatus("unavailable");
        return;
      }
      const c = value ?? SMOLENSK_CENTER;
      const map = new api.YMap(containerRef.current, {
        location: { center: [c.lng, c.lat], zoom: value ? 15 : 12 },
      });
      map.addChild(new api.YMapDefaultSchemeLayer());
      map.addChild(new api.YMapDefaultFeaturesLayer({ zIndex: 1800 }));
      map.addChild(
        new api.YMapListener({
          layer: "any",
          onFastClick: (_obj, event) => {
            const [lng, lat] = event.coordinates;
            onChangeRef.current(lat, lng);
          },
        }),
      );
      apiRef.current = api;
      mapRef.current = map;
      setStatus("ready");
    });
    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // Создаём один раз; value двигает только маркер (эффект ниже).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    const map = mapRef.current;
    if (status !== "ready" || !api || !map) return;
    if (markerRef.current) {
      map.removeChild(markerRef.current);
      markerRef.current = null;
    }
    if (value) {
      const marker = new api.YMapMarker(
        { coordinates: [value.lng, value.lat] },
        markerElement(),
      );
      map.addChild(marker);
      markerRef.current = marker;
    }
  }, [status, value]);

  if (status === "unavailable") {
    return (
      <p className={cn("rounded border border-dashed border-border bg-surface-2 px-3 py-2.5 text-xs text-muted", className)}>
        Карта недоступна (нет ключа API) — укажите координаты вручную, например из Яндекс Карт.
      </p>
    );
  }

  return (
    <div className={cn("relative h-64 overflow-hidden rounded-lg border border-border", className)}>
      <div ref={containerRef} className="absolute inset-0" />
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden="true" />
      )}
      <span className="pointer-events-none absolute top-2 left-2 z-10 rounded-pill bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-fg-2 shadow-card">
        Кликните по карте, чтобы поставить точку
      </span>
    </div>
  );
}
