"use client";

import { memo, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";

// Реальный стол 274×152.5 см; 1 единица viewBox = 1 см.
export const TABLE_W = 274;
export const TABLE_H = 153;

export type TableStatus = "free" | "booked" | "disabled" | "edit" | "edit-inactive";

const FILL: Record<TableStatus, string> = {
  free: "var(--color-status-open)",
  booked: "var(--color-status-full)",
  disabled: "var(--color-surface-3)",
  edit: "var(--color-primary)",
  "edit-inactive": "var(--color-surface-3)",
};

const HANDLE_OFFSET = TABLE_H / 2 + 70;

export const TableShape = memo(function TableShape({
  tableKey,
  label,
  x,
  y,
  rotation,
  status,
  selected = false,
  onBodyPointerDown,
  onHandlePointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
}: {
  tableKey: string;
  label: string;
  x: number;
  y: number;
  rotation: number;
  status: TableStatus;
  selected?: boolean;
  onBodyPointerDown?: (e: ReactPointerEvent<SVGGElement>, key: string) => void;
  onHandlePointerDown?: (e: ReactPointerEvent<SVGCircleElement>, key: string) => void;
  onPointerMove?: (e: ReactPointerEvent<SVGGElement>, key: string) => void;
  onPointerUp?: (e: ReactPointerEvent<SVGGElement>, key: string) => void;
  onClick?: (e: ReactMouseEvent<SVGGElement>, key: string) => void;
}) {
  const inactive = status === "disabled" || status === "edit-inactive";
  const editable = status === "edit" || status === "edit-inactive";
  const hw = TABLE_W / 2;
  const hh = TABLE_H / 2;

  return (
    <g
      className="hm-table"
      transform={`translate(${x} ${y}) rotate(${rotation})`}
      onPointerDown={onBodyPointerDown ? (e) => onBodyPointerDown(e, tableKey) : undefined}
      onPointerMove={onPointerMove ? (e) => onPointerMove(e, tableKey) : undefined}
      onPointerUp={onPointerUp ? (e) => onPointerUp(e, tableKey) : undefined}
      onClick={onClick ? (e) => onClick(e, tableKey) : undefined}
      style={{ cursor: editable ? "grab" : onClick ? "pointer" : "default" }}
    >
      <rect
        x={-hw}
        y={-hh}
        width={TABLE_W}
        height={TABLE_H}
        rx={10}
        fill={FILL[status]}
        stroke={selected ? "var(--color-fg)" : "rgba(10,10,10,0.15)"}
        strokeWidth={selected ? 6 : 2}
      />
      <line
        x1={0}
        y1={-hh}
        x2={0}
        y2={hh}
        stroke={inactive ? "var(--color-border-strong)" : "rgba(255,255,255,0.7)"}
        strokeWidth={5}
      />
      {status === "disabled" && (
        <>
          <line x1={-hw} y1={-hh} x2={hw} y2={hh} stroke="var(--color-muted)" strokeWidth={6} />
          <line x1={-hw} y1={hh} x2={hw} y2={-hh} stroke="var(--color-muted)" strokeWidth={6} />
        </>
      )}
      <g transform={`rotate(${-rotation})`}>
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={52}
          fontWeight={800}
          fill={inactive ? "var(--color-muted)" : "#ffffff"}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {label}
        </text>
      </g>
      {editable && selected && (
        <>
          <line
            x1={0}
            y1={-hh}
            x2={0}
            y2={-HANDLE_OFFSET}
            stroke="var(--color-fg)"
            strokeWidth={3}
            strokeDasharray="6 6"
          />
          <circle
            className="hm-handle"
            cx={0}
            cy={-HANDLE_OFFSET}
            r={26}
            fill="var(--color-surface)"
            stroke="var(--color-fg)"
            strokeWidth={4}
            style={{ cursor: "crosshair" }}
            onPointerDown={onHandlePointerDown ? (e) => onHandlePointerDown(e, tableKey) : undefined}
          />
        </>
      )}
    </g>
  );
});
