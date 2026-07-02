// Ручной лоадер Yandex Maps JS API v3 (без npm-обёрток — ключ привязан к домену,
// а churn v3 делает обёртки хрупкими). Без ключа карта деградирует до плейсхолдера.

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

// Маркер-«шарик» из брендовых ассетов. Внешний элемент v3 сам ставит углом в
// координату — центрируем на точке ВНУТРЕННИЙ <img> (его transform библиотека не
// трогает). Инлайн-стили, а не Tailwind: маркер живёт в DOM, которым правит карта.
export function ballMarkerElement(opts: { size?: number; button?: boolean } = {}): HTMLElement {
  const size = opts.size ?? 32;
  const outer = document.createElement(opts.button ? "button" : "div");
  if (outer instanceof HTMLButtonElement) outer.type = "button";
  outer.style.cssText =
    "padding:0;margin:0;border:0;background:transparent;line-height:0;" +
    (opts.button ? "cursor:pointer;" : "");
  outer.innerHTML =
    `<img src="/brand/ball.svg" alt="" width="${size}" height="${size}" draggable="false" ` +
    `style="display:block;transform:translate(-50%,-50%);filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))" />`;
  return outer;
}
