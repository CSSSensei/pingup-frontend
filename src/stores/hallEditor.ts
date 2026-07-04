import { create } from "zustand";

import type { WeekScheduleMap } from "@/lib/schedule";
import type { HallTable } from "@/types/api";

export interface DraftTable {
  key: string;
  id: number | null;
  label: string;
  x: number;
  y: number;
  rotation: number;
  is_active: boolean;
  schedule: WeekScheduleMap | null;
}

interface HallEditorState {
  tables: DraftTable[];
  selectedKey: string | null;
  dirty: boolean;
  load: (tables: HallTable[]) => void;
  select: (key: string | null) => void;
  addTable: (x: number, y: number) => void;
  moveTable: (key: string, x: number, y: number) => void;
  rotateTable: (key: string, rotation: number) => void;
  rotate90: (key: string) => void;
  toggleActive: (key: string) => void;
  setSchedule: (key: string, schedule: WeekScheduleMap | null) => void;
  removeTable: (key: string) => void;
}

let newSeq = 0;

function nextLabel(tables: DraftTable[]): string {
  const used = new Set(tables.map((t) => t.label));
  for (let n = 1; ; n++) {
    if (!used.has(`T${n}`)) return `T${n}`;
  }
}

function patch(
  tables: DraftTable[],
  key: string,
  fn: (t: DraftTable) => Partial<DraftTable>,
): DraftTable[] {
  return tables.map((t) => (t.key === key ? { ...t, ...fn(t) } : t));
}

export const useHallEditorStore = create<HallEditorState>((set) => ({
  tables: [],
  selectedKey: null,
  dirty: false,

  load: (tables) =>
    set({
      tables: tables.map((t) => ({
        key: `t${t.id}`,
        id: t.id,
        label: t.label,
        x: t.x,
        y: t.y,
        rotation: t.rotation,
        is_active: t.is_active,
        schedule: t.schedule,
      })),
      selectedKey: null,
      dirty: false,
    }),

  select: (selectedKey) => set({ selectedKey }),

  addTable: (x, y) =>
    set((s) => {
      const key = `new-${++newSeq}`;
      return {
        tables: [
          ...s.tables,
          { key, id: null, label: nextLabel(s.tables), x, y, rotation: 0, is_active: true, schedule: null },
        ],
        selectedKey: key,
        dirty: true,
      };
    }),

  moveTable: (key, x, y) => set((s) => ({ tables: patch(s.tables, key, () => ({ x, y })), dirty: true })),

  rotateTable: (key, rotation) =>
    set((s) => ({ tables: patch(s.tables, key, () => ({ rotation })), dirty: true })),

  rotate90: (key) =>
    set((s) => ({
      tables: patch(s.tables, key, (t) => ({ rotation: (t.rotation + 90) % 360 })),
      dirty: true,
    })),

  toggleActive: (key) =>
    set((s) => ({
      tables: patch(s.tables, key, (t) => ({ is_active: !t.is_active })),
      dirty: true,
    })),

  setSchedule: (key, schedule) =>
    set((s) => ({ tables: patch(s.tables, key, () => ({ schedule })), dirty: true })),

  removeTable: (key) =>
    set((s) => ({
      tables: s.tables.filter((t) => t.key !== key),
      selectedKey: s.selectedKey === key ? null : s.selectedKey,
      dirty: true,
    })),
}));
