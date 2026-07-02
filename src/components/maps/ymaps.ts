export type LngLat = [number, number];

export interface YMapInstance {
  addChild(entity: object): YMapInstance;
  removeChild(entity: object): YMapInstance;
  setLocation(location: { center: LngLat; zoom?: number; duration?: number }): void;
  destroy(): void;
}

export interface MapClickEvent {
  coordinates: LngLat;
}

export interface YMapsApi {
  ready: Promise<unknown>;
  YMap: new (
    el: HTMLElement,
    props: { location: { center: LngLat; zoom: number } },
  ) => YMapInstance;
  YMapDefaultSchemeLayer: new (props?: object) => object;
  YMapDefaultFeaturesLayer: new (props?: object) => object;
  YMapMarker: new (props: { coordinates: LngLat }, element?: HTMLElement) => object;
  YMapListener: new (props: {
    layer?: string;
    onFastClick?: (obj: unknown, event: MapClickEvent) => void;
  }) => object;
}

declare global {
  interface Window {
    ymaps3?: YMapsApi;
  }
}

export const MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "";

let loading: Promise<YMapsApi | null> | null = null;

export function loadYmaps3(): Promise<YMapsApi | null> {
  if (typeof window === "undefined" || !MAPS_API_KEY) return Promise.resolve(null);
  if (!loading) {
    loading = new Promise((resolve) => {
      const finish = () => {
        const api = window.ymaps3;
        if (!api) return resolve(null);
        api.ready.then(() => resolve(api)).catch(() => resolve(null));
      };
      if (window.ymaps3) {
        finish();
        return;
      }
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(MAPS_API_KEY)}&lang=ru_RU`;
      script.async = true;
      script.onload = finish;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }
  return loading;
}


function pinSvg(fill: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#5b93ea"/><stop offset="1" stop-color="${fill}"/>` +
    `</linearGradient></defs>` +
    `<path d="M14 1.4C7.7 1.4 2.6 6.5 2.6 12.8c0 8.2 11.4 21.8 11.4 21.8s11.4-13.6 11.4-21.8` +
    `C25.4 6.5 20.3 1.4 14 1.4Z" fill="url(#g)" stroke="#fff" stroke-width="2"/>` +
    `<circle cx="14" cy="12.8" r="4.3" fill="#fff"/></svg>`
  );
}

export function markerElement(opts: { size?: number; button?: boolean } = {}): HTMLElement {
  const w = opts.size ?? 30;
  const h = Math.round(w * 1.29);
  const primary =
    getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() ||
    "#1c5fd0";
  const outer = document.createElement(opts.button ? "button" : "div");
  if (outer instanceof HTMLButtonElement) outer.type = "button";
  outer.style.cssText =
    "padding:0;margin:0;border:0;background:transparent;line-height:0;" +
    (opts.button ? "cursor:pointer;" : "");
  const inner = document.createElement("span");
  inner.style.cssText =
    `display:block;width:${w}px!important;height:${h}px!important;` +
    `background:url("data:image/svg+xml,${encodeURIComponent(pinSvg(primary))}") center/contain no-repeat;` +
    "transform:translate(-50%,-100%);filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))";
  outer.appendChild(inner);
  return outer;
}
