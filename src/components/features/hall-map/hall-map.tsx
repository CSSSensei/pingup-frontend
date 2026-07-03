"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { BookingModal } from "@/components/features/hall-map/booking-modal";
import { TableShape, type TableStatus } from "@/components/features/hall-map/table-shape";
import { Button } from "@/components/ui/button";
import { IconBan, IconCheck, IconPlus, IconRefresh, IconTrash, IconX } from "@/components/ui/icons";
import { toast } from "@/components/ui/toast";
import { useCancelBooking, useSaveHallLayout, useVenueLayout } from "@/hooks/useHallMap";
import { MIN_BOOKING_MIN, availableStarts, overlaps } from "@/lib/hallSchedule";
import { moscowIso } from "@/lib/schemas/event";
import { useHallEditorStore } from "@/stores/hallEditor";
import type { HallTable, HallTableWritePayload } from "@/types/api";

const GRID = 10;

type Drag =
  | { type: "move"; key: string; dx: number; dy: number }
  | { type: "rotate"; key: string };

function snap(v: number): number {
  return Math.round(v / GRID) * GRID;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function HallMap({
  venueId,
  venueSlug,
  workingHours,
  mode,
  date,
  onExitEdit,
}: {
  venueId: number;
  venueSlug: string;
  workingHours: Record<string, unknown> | null;
  mode: "view" | "edit";
  date: string;
  onExitEdit: () => void;
}) {
  const layoutQuery = useVenueLayout(venueId, date);
  const layout = layoutQuery.data;
  const viewW = layout?.viewbox_width ?? 2000;
  const viewH = layout?.viewbox_height ?? 1200;

  const tables = useHallEditorStore((s) => s.tables);
  const selectedKey = useHallEditorStore((s) => s.selectedKey);
  const dirty = useHallEditorStore((s) => s.dirty);
  const saveLayout = useSaveHallLayout(venueId);
  const cancelBooking = useCancelBooking(venueId);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const ctmRef = useRef<DOMMatrix | null>(null);
  const downPosRef = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [bookingTable, setBookingTable] = useState<HallTable | null>(null);
  const [infoTable, setInfoTable] = useState<HallTable | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const startMsList = useMemo(
    () =>
      availableStarts(workingHours, date, MIN_BOOKING_MIN).map((s) =>
        Date.parse(moscowIso(date, s)),
      ),
    [workingHours, date],
  );

  useEffect(() => {
    if (mode !== "edit") return;
    const fresh = layoutQuery.data?.tables;
    if (fresh) useHallEditorStore.getState().load(fresh);
    // загружаем черновик только при входе в режим редактирования
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== "edit") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const { selectedKey: sel, removeTable } = useHallEditorStore.getState();
      if (sel) {
        e.preventDefault();
        removeTable(sel);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const svgPoint = useCallback((e: { clientX: number; clientY: number }) => {
    const m = ctmRef.current;
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  }, []);

  function statusFor(t: HallTable): TableStatus {
    if (!t.is_active) return "disabled";
    if (startMsList.length === 0) return "booked";
    const hasFree = startMsList.some(
      (ms) => !overlaps(t.bookings, ms, ms + MIN_BOOKING_MIN * 60_000),
    );
    return hasFree ? "free" : "booked";
  }

  const handleViewBodyDown = useCallback((e: ReactPointerEvent<SVGGElement>) => {
    downPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleViewClick = useCallback(
    (e: ReactMouseEvent<SVGGElement>, key: string) => {
      const down = downPosRef.current;
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
      if (startMsList.length === 0) {
        toast("Зал в этот день не работает");
        return;
      }
      const t = layout?.tables.find((x) => String(x.id) === key);
      if (!t) return;
      if (t.is_active && startMsList.some((ms) => !overlaps(t.bookings, ms, ms + MIN_BOOKING_MIN * 60_000))) {
        setInfoTable(null);
        setBookingTable(t);
      } else {
        setInfoTable(t);
      }
    },
    [startMsList, layout],
  );

  const captureCtm = () => {
    const ctm = svgRef.current?.getScreenCTM();
    ctmRef.current = ctm ? ctm.inverse() : null;
  };

  const handleBodyDown = useCallback(
    (e: ReactPointerEvent<SVGGElement>, key: string) => {
      e.stopPropagation();
      const store = useHallEditorStore.getState();
      store.select(key);
      captureCtm();
      const p = svgPoint(e);
      const t = store.tables.find((x) => x.key === key);
      if (!p || !t) return;
      dragRef.current = { type: "move", key, dx: t.x - p.x, dy: t.y - p.y };
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    },
    [svgPoint],
  );

  const handleHandleDown = useCallback((e: ReactPointerEvent<SVGCircleElement>, key: string) => {
    e.stopPropagation();
    captureCtm();
    dragRef.current = { type: "rotate", key };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<SVGGElement>, key: string) => {
      const drag = dragRef.current;
      if (!drag || drag.key !== key) return;
      const p = svgPoint(e);
      if (!p) return;
      const store = useHallEditorStore.getState();
      if (drag.type === "move") {
        store.moveTable(
          key,
          clamp(snap(p.x + drag.dx), 0, viewW),
          clamp(snap(p.y + drag.dy), 0, viewH),
        );
      } else {
        const t = store.tables.find((x) => x.key === key);
        if (!t) return;
        const deg = (Math.atan2(p.y - t.y, p.x - t.x) * 180) / Math.PI + 90;
        store.rotateTable(key, (((Math.round(deg / 15) * 15) % 360) + 360) % 360);
      }
    },
    [svgPoint, viewW, viewH],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  function addTable() {
    const n = useHallEditorStore.getState().tables.length;
    const x = viewW / 2 + ((n % 5) - 2) * 320;
    const y = viewH / 2 + ((Math.floor(n / 5) % 3) - 1) * 240;
    useHallEditorStore.getState().addTable(clamp(snap(x), 0, viewW), clamp(snap(y), 0, viewH));
  }

  async function save() {
    const draft = useHallEditorStore.getState().tables;
    const payload: HallTableWritePayload[] = draft.map((t) => ({
      ...(t.id != null ? { id: t.id } : {}),
      label: t.label.trim(),
      x: t.x,
      y: t.y,
      rotation: t.rotation,
      is_active: t.is_active,
    }));
    try {
      await saveLayout.mutateAsync({ tables: payload });
      toast.success("Схема зала сохранена");
      onExitEdit();
    } catch {
      // ошибка уже показана в onError мутации
    }
  }

  const selected = tables.find((t) => t.key === selectedKey) ?? null;

  const infoStatus = infoTable ? statusFor(infoTable) : null;
  const myBooking =
    infoTable?.bookings.find((b) => b.is_mine && b.id > 0 && Date.parse(b.ends_at) > Date.now()) ??
    null;

  return (
    <div className="space-y-3">
      {mode === "edit" && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={addTable}>
            <IconPlus size={15} />
            Стол
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!selected}
            onClick={() => selected && useHallEditorStore.getState().rotate90(selected.key)}
          >
            <IconRefresh size={15} />
            90°
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!selected}
            onClick={() => selected && useHallEditorStore.getState().toggleActive(selected.key)}
          >
            {selected && !selected.is_active ? <IconCheck size={15} /> : <IconBan size={15} />}
            {selected && !selected.is_active ? "Включить" : "Выключить"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!selected}
            className="text-danger"
            onClick={() => selected && useHallEditorStore.getState().removeTable(selected.key)}
          >
            <IconTrash size={15} />
            Удалить
          </Button>
          <div className="ms-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => (dirty ? setConfirmDiscard(true) : onExitEdit())}
            >
              Отменить
            </Button>
            <Button size="sm" disabled={!dirty} loading={saveLayout.isPending} onClick={save}>
              Сохранить
            </Button>
          </div>
        </div>
      )}

      <div
        className="relative w-full overflow-hidden rounded-lg border border-border bg-surface-2"
        style={{ aspectRatio: `${viewW}/${viewH}` }}
      >
        <TransformWrapper
          minScale={1}
          maxScale={5}
          centerOnInit
          limitToBounds
          doubleClick={{ disabled: true }}
          panning={{ disabled: dragging, velocityDisabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%" }}
              >
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${viewW} ${viewH}`}
                  className="h-full w-full select-none"
                >
                  <defs>
                    <pattern id="hm-grid" width={100} height={100} patternUnits="userSpaceOnUse">
                      <path
                        d="M 100 0 L 0 0 0 100"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth={1.5}
                      />
                    </pattern>
                  </defs>
                  <rect
                    width={viewW}
                    height={viewH}
                    fill="var(--color-surface)"
                    stroke="var(--color-border-strong)"
                    strokeWidth={4}
                    onClick={() => mode === "edit" && useHallEditorStore.getState().select(null)}
                  />
                  {mode === "edit" && (
                    <rect width={viewW} height={viewH} fill="url(#hm-grid)" pointerEvents="none" />
                  )}

                  {mode === "view" &&
                    layout?.tables.map((t) => (
                      <TableShape
                        key={t.id}
                        tableKey={String(t.id)}
                        label={t.label}
                        x={t.x}
                        y={t.y}
                        rotation={t.rotation}
                        status={statusFor(t)}
                        onBodyPointerDown={handleViewBodyDown}
                        onClick={handleViewClick}
                      />
                    ))}

                  {mode === "edit" &&
                    tables.map((t) => (
                      <TableShape
                        key={t.key}
                        tableKey={t.key}
                        label={t.label}
                        x={t.x}
                        y={t.y}
                        rotation={t.rotation}
                        status={t.is_active ? "edit" : "edit-inactive"}
                        selected={t.key === selectedKey}
                        onBodyPointerDown={handleBodyDown}
                        onHandlePointerDown={handleHandleDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                      />
                    ))}
                </svg>
              </TransformComponent>

              <div className="absolute right-2.5 bottom-2.5 flex flex-col gap-1.5">
                <ZoomButton label="Приблизить" onClick={() => zoomIn()}>
                  +
                </ZoomButton>
                <ZoomButton label="Отдалить" onClick={() => zoomOut()}>
                  −
                </ZoomButton>
                <ZoomButton label="Сбросить масштаб" onClick={() => resetTransform()}>
                  ⌂
                </ZoomButton>
              </div>
            </>
          )}
        </TransformWrapper>

        {infoTable && mode === "view" && (
          <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 shadow-pop">
            <p className="text-sm font-semibold text-fg">
              {infoStatus === "disabled"
                ? `Стол ${infoTable.label} недоступен для бронирования`
                : `Стол ${infoTable.label} полностью занят в этот день`}
            </p>
            <div className="flex flex-none items-center gap-1.5">
              {myBooking && (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={cancelBooking.isPending}
                  onClick={() =>
                    cancelBooking.mutate(myBooking.id, {
                      onSuccess: () => {
                        toast.success("Бронь отменена");
                        setInfoTable(null);
                      },
                    })
                  }
                >
                  Отменить бронь
                </Button>
              )}
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setInfoTable(null)}
                className="inline-flex size-8 items-center justify-center rounded-full text-fg-2 hover:bg-surface-2"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {bookingTable && (
        <BookingModal
          venueId={venueId}
          venueSlug={venueSlug}
          workingHours={workingHours}
          table={bookingTable}
          initialDate={date}
          onClose={() => setBookingTable(null)}
        />
      )}

      <ConfirmDialog
        open={confirmDiscard}
        title="Сбросить изменения?"
        message="Несохранённые изменения схемы будут потеряны."
        confirmLabel="Сбросить"
        destructive
        onConfirm={() => {
          setConfirmDiscard(false);
          onExitEdit();
        }}
        onClose={() => setConfirmDiscard(false)}
      />
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded border border-border bg-surface text-base font-bold text-fg-2 shadow-card hover:bg-surface-2"
    >
      {children}
    </button>
  );
}
