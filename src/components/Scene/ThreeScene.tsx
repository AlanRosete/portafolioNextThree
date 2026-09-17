"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, OrbitControls } from "@react-three/drei";

interface ThreeSceneProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  /** Activa el shadow map. Las luces deciden luego quién proyecta. */
  shadows?: boolean;
  /** Cada escena tiene su encuadre: la galería y el hero no comparten cámara. */
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

  /**
   * En móvil se renderiza más barato, y son dos ajustes distintos:
   *
   * · `antialias` crea un framebuffer multimuestra —memoria de GPU y trabajo
   *   extra por frame—. A tamaño de móvil los cantos de la escena apenas se
   *   benefician, así que el gasto no se recupera en nitidez.
   * · El techo de DPR baja a 1.5: en un teléfono de 3x el canvas pasaba de
   *   1.75 a 1.5, que es un 27% menos de píxeles que dibujar cada frame.
   *
   * No cambia nada en escritorio, donde se conservan ambos.
   *
   * Se decide con una media query y no con el ancho de `window`, porque
   * `matchMedia` no fuerza reflow al leerse. Arranca en `false` a propósito:
   * el servidor no conoce el dispositivo, así que el primer render tiene que
   * ser idéntico en ambos lados o React descarta el árbol al hidratar.
   */
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

          {/* Controles de órbita para que el usuario pueda rotar con el cursor */}
          {interactive && (
            <OrbitControls
              enableZoom={false}         // sin zoom para no interferir con scroll
              enablePan={false}          // sin paneo
              autoRotate={false}         // la galería ya tiene su propia rotación
              minPolarAngle={Math.PI / 4}  // limita rotación vertical (arriba)
              maxPolarAngle={(Math.PI * 3) / 4} // limita rotación vertical (abajo)
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
