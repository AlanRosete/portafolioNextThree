"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useStore } from "@/hooks/useStore";

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useStore();

  useEffect(() => {
    const tl = gsap.timeline();

    tl.to(".loading-progress", {
      width: "100%",
      duration: 2,
      ease: "power2.inOut",
    })
      .to(".loading-text", {
        opacity: 0,
        y: -20,
        duration: 0.3,
      })
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => setLoading(false),
      });

    return () => {
      tl.kill();
    };
  }, [setLoading]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "var(--color-bg-primary)" }}
    >
      {/* Logo */}
      <div className="loading-text mb-8">
        <h1
          className="text-5xl font-bold"
          style={{ fontFamily: "var(--font-family-heading)" }}
        >
          <span className="gradient-text">Alan</span>
          <span className="text-text-secondary">.dev</span>
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="loading-text w-48 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div
          className="loading-progress h-full rounded-full"
          style={{
            width: "0%",
            background: "linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))",
          }}
        />
      </div>

      {/* Loading Text */}
      <p className="loading-text text-text-muted text-sm mt-4 tracking-widest uppercase">
        Cargando experiencia
      </p>
    </div>
  );
}
