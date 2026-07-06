"use client";

import { useState } from "react";

export function OutBallScene() {
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

        <ellipse
          className="nf-shadow"
          cx="360"
          cy="350"
          rx="66"
          ry="11"
          fill="#0a0a0a"
          filter="url(#nfSoft)"
        />

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
