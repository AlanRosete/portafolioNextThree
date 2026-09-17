"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, OrbitControls } from "@react-three/drei";

interface ThreeSceneProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;

  shadows?: boolean;

  camera?: { position: [number, number, number]; fov: number };
  dpr?: [number, number];
}

function WebGLFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="text-6xl mb-4">🌌</div>
        <p className="text-text-secondary">Tu navegador no soporta WebGL</p>
      </div>
    </div>
  );
}

function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ThreeScene({
  children,
  className = "",
  interactive = false,
  shadows = false,
  camera = { position: [0, 0, 10], fov: 55 },
  dpr = [1, 2],
}: ThreeSceneProps) {
  const [webglSupported, setWebglSupported] = useState(true);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebglSupported(!!gl);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return <WebGLFallback />;
  }

  return (
    <div className={`${className} ${interactive ? "interactive" : ""}`}>
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          camera={{ ...camera, near: 0.1, far: 100 }}
          dpr={isMobile ? [1, Math.min(dpr[1], 1.5)] : dpr}
          shadows={shadows}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent" }}
        >
          {children}

          {}
          {interactive && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={(Math.PI * 3) / 4}
              rotateSpeed={0.5}
              dampingFactor={0.08}
              enableDamping
            />
          )}

          <Preload all />
        </Canvas>
      </Suspense>
    </div>
  );
}
