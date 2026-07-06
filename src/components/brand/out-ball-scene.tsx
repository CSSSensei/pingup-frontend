"use client";

import { useState } from "react";

// Парабола: вершина — в мяче (360,150), ветви падают до кромки стола (y≈360).
const A = 210 / 90000;
const arcY = (x: number) => 150 + A * (x - 360) ** 2;

// Затухающий след: прилёт слева (растёт к мячу) и уход в аут справа-вниз.
const TRAIL = [
  ...[126, 172, 216, 258].map((x, i) => ({ x, y: arcY(x), r: 3.5 + i * 1.6, o: 0.1 + i * 0.05 })),
  ...[602, 668].map((x, i) => ({ x, y: arcY(x), r: 5 - i * 1.6, o: 0.13 - i * 0.05 })),
];

export function OutBallScene() {
  // Только для перезапуска анимации «подачи» по клику (через React key) — не отображается.
  const [taps, setTaps] = useState(0);

  return (
    <svg
      viewBox="0 0 720 400"
      aria-hidden="true"
      className="mx-auto w-full max-w-[560px]"
      role="presentation"
    >
        <defs>
          <radialGradient id="nfBall" cx="0.35" cy="0.3" r="0.75">
            <stop offset="0.06" stopColor="#ffffff" />
            <stop offset="0.52" stopColor="#e2e2e2" />
            <stop offset="1" stopColor="#ababab" />
          </radialGradient>
          <linearGradient id="nfDigit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a1b1f" />
            <stop offset="1" stopColor="#3f3f46" />
          </linearGradient>
          <filter id="nfBallShadow" x="-45%" y="-45%" width="190%" height="190%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0a0a0a" floodOpacity="0.18" />
          </filter>
          <filter id="nfSoft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Стол сбоку: кромка + короткая сетка ровно под траекторией мяча. */}
        <line x1="66" y1="346" x2="654" y2="346" stroke="var(--color-border-strong)" strokeWidth="2" />
        <line
          x1="360"
          y1="314"
          x2="360"
          y2="346"
          stroke="var(--color-border-strong)"
          strokeWidth="2"
          strokeDasharray="3 4"
        />

        {/* Контактная тень на столе — в противофазе к баунсу мяча. */}
        <ellipse
          className="nf-shadow"
          cx="360"
          cy="350"
          rx="66"
          ry="11"
          fill="#0a0a0a"
          filter="url(#nfSoft)"
        />

        {/* Траектория «в аут». */}
        {TRAIL.map((d) => (
          <circle key={d.x} cx={d.x} cy={d.y} r={d.r} fill="var(--color-primary)" opacity={d.o} />
        ))}

        {/* 4 _ 4 — цифры фланкируют мяч-«ноль». */}
        <text
          x="150"
          y="252"
          textAnchor="middle"
          fontFamily="Manrope, sans-serif"
          fontWeight="800"
          fontSize="270"
          letterSpacing="-8"
          fill="url(#nfDigit)"
        >
          4
        </text>
        <text
          x="570"
          y="252"
          textAnchor="middle"
          fontFamily="Manrope, sans-serif"
          fontWeight="800"
          fontSize="270"
          letterSpacing="-8"
          fill="url(#nfDigit)"
        >
          4
        </text>

        {/* Мяч-«ноль»: баунс снаружи, «подача» (nf-serve) перезапускается по клику через key. */}
        <g className="nf-ball" style={{ cursor: "pointer" }} onClick={() => setTaps((t) => t + 1)}>
          <g key={taps} className="nf-serve">
            <circle cx="360" cy="150" r="82" fill="url(#nfBall)" filter="url(#nfBallShadow)" />
            <ellipse cx="334" cy="120" rx="20" ry="13" fill="#ffffff" opacity="0.7" filter="url(#nfSoft)" />
          </g>
        </g>
      </svg>
  );
}
