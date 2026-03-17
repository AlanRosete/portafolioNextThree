"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, OrbitControls } from "@react-three/drei";

interface ThreeSceneProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

function WebGLFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-primary to-bg-secondary">
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
}: ThreeSceneProps) {
  const [webglSupported, setWebglSupported] = useState(true);

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
          // Cámara más atrás para ver todas las cards del círculo
          camera={{ position: [0, 0, 10], fov: 55, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
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