"use client";

import { useEffect, useRef, type CSSProperties } from "react";

function Ball({
  depth,
  className,
  duration,
  delay,
}: {
  depth: number;
  className: string;
  duration: string;
  delay: string;
}) {
  const ballStyle: CSSProperties = {
    background:
      "radial-gradient(circle at 30% 26%, #ffffff 0%, #f4f5f7 40%, #e2e4e9 74%, #cbccd2 100%)",
    boxShadow:
      "inset -8px -11px 20px rgba(17,24,39,0.10), inset 8px 10px 15px rgba(255,255,255,0.92), 0 28px 50px -16px rgba(17,24,39,0.20), 0 10px 22px -8px rgba(10,10,10,0.14)",
    animationDuration: duration,
    animationDelay: delay,
  };

  return (
    <span data-depth={depth} className={`pu-layer absolute ${className}`}>
      <span className="pu-float relative block size-full rounded-full" style={ballStyle}>
        <span
          className="absolute top-[15%] left-[19%] block rounded-full"
          style={{
            width: "36%",
            height: "27%",
            background:
              "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.95), rgba(255,255,255,0) 68%)",
            filter: "blur(2px)",
          }}
        />
      </span>
    </span>
  );
}

export function HeroParallax() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]")).map((el) => ({
      el,
      depth: Number(el.dataset.depth) || 0,
      x: 0,
      y: 0,
    }));

    let px = 0;
    let py = 0;
    let sy = window.scrollY;
    let raf = 0;
    let running = false;

    const tick = () => {
      let moving = false;
      for (const s of layers) {
        const tx = finePointer ? px * s.depth * 30 : 0;
        const ty = py * s.depth * 26 + sy * s.depth * 0.05;
        s.x += (tx - s.x) * 0.09;
        s.y += (ty - s.y) * 0.09;
        if (Math.abs(tx - s.x) > 0.1 || Math.abs(ty - s.y) > 0.1) moving = true;
        s.el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
      }
      if (moving) raf = requestAnimationFrame(tick);
      else running = false;
    };

    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      sy = window.scrollY;
      wake();
    };
    const onPointer = (e: PointerEvent) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      wake();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });
    wake();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Ball
        depth={1.4}
        className="top-[36px] -right-[52px] size-[118px] sm:-top-[72px] sm:-right-[40px] sm:size-[210px]"
        duration="8s"
        delay="0s"
      />
      <Ball
        depth={-1.2}
        className="hidden top-[286px] -right-[40px] size-[96px] sm:block sm:top-[7%] sm:right-auto sm:-left-[24px] sm:size-[122px]"
        duration="6.5s"
        delay="-2.4s"
      />
      <Ball
        depth={2.3}
        className="top-[352px] -left-[38px] size-[92px] sm:top-[25%] sm:left-auto sm:right-[12%] sm:size-[88px]"
        duration="5.5s"
        delay="-1.2s"
      />
    </div>
  );
}
