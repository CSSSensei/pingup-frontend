declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

const RAW_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export const YM_ID = RAW_ID ? Number(RAW_ID) : null;

function call(action: string, ...args: unknown[]): void {
  if (YM_ID && typeof window !== "undefined" && typeof window.ym === "function") {
    window.ym(YM_ID, action, ...args);
  }
}

export function ymHit(url: string): void {
  call("hit", url);
}

export function reachGoal(goal: string, params?: Record<string, unknown>): void {
  call("reachGoal", goal, params);
}
