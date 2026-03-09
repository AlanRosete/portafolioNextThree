"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/hooks/useStore";
import Link from "next/link";

/* ═══════════════════════════════════════════════════
   PLAYER COMPONENT
   ═══════════════════════════════════════════════════ */

function Player({
  position,
}: {
  position: React.MutableRefObject<THREE.Vector3>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(position.current, 0.1);
      meshRef.current.rotation.z += 0.02;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color="#6c63ff"
        emissive="#6c63ff"
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════
   TOKEN COMPONENT
   ═══════════════════════════════════════════════════ */

function Token({
  position,
  color,
  label,
  onCollect,
  collected,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  onCollect: () => void;
  collected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [localCollected, setLocalCollected] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !localCollected) {
      meshRef.current.rotation.y += 0.03;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
    }
  });

  if (collected || localCollected) return null;

  return (
    <Float speed={1.5} floatIntensity={0.3}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            setLocalCollected(true);
            onCollect();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <dodecahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

/* ═══════════════════════════════════════════════════
   GAME SCENE
   ═══════════════════════════════════════════════════ */

function GameScene() {
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const keysPressed = useRef<Set<string>>(new Set());
  const { collectToken, gameTokens, isGameComplete } = useStore();
  const [collectedSet, setCollectedSet] = useState<Set<number>>(new Set());

  const speed = 0.08;

  const tokens = [
    { position: [3, 0, -2] as [number, number, number], color: "#6c63ff", label: "React" },
    { position: [-3, 0, 1] as [number, number, number], color: "#00d4ff", label: "Three.js" },
    { position: [1, 0, 3] as [number, number, number], color: "#ff6b9d", label: "GSAP" },
    { position: [-2, 0, -3] as [number, number, number], color: "#ffd93d", label: "Node.js" },
    { position: [4, 0, 2] as [number, number, number], color: "#50fa7b", label: "TypeScript" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const keys = keysPressed.current;
    const dir = new THREE.Vector3();

    if (keys.has("w") || keys.has("arrowup")) dir.z -= speed;
    if (keys.has("s") || keys.has("arrowdown")) dir.z += speed;
    if (keys.has("a") || keys.has("arrowleft")) dir.x -= speed;
    if (keys.has("d") || keys.has("arrowright")) dir.x += speed;

    playerPos.current.add(dir);

    // Clamp position
    playerPos.current.x = THREE.MathUtils.clamp(playerPos.current.x, -6, 6);
    playerPos.current.z = THREE.MathUtils.clamp(playerPos.current.z, -6, 6);

    // Check collision with tokens
    tokens.forEach((token, i) => {
      if (collectedSet.has(i)) return;
      const dist = playerPos.current.distanceTo(
        new THREE.Vector3(...token.position)
      );
      if (dist < 0.6) {
        setCollectedSet((prev) => new Set([...prev, i]));
        collectToken();
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} color="#6c63ff" intensity={3} />
      <pointLight position={[5, 5, 5]} color="#00d4ff" intensity={2} />

      {/* Floor grid */}
      <gridHelper args={[14, 14, "#6c63ff", "#1a1a2e"]} rotation={[0, 0, 0]} />

      {/* Player */}
      <Player position={playerPos} />

      {/* Tokens */}
      {tokens.map((token, i) => (
        <Token
          key={i}
          position={token.position}
          color={token.color}
          label={token.label}
          collected={collectedSet.has(i)}
          onCollect={() => {}}
        />
      ))}

      {/* Boundary walls (visual) */}
      {[
        [0, 0.5, -7],
        [0, 0.5, 7],
        [-7, 0.5, 0],
        [7, 0.5, 0],
      ].map((pos, i) => (
        <mesh
          key={`wall-${i}`}
          position={pos as [number, number, number]}
          rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}
        >
          <planeGeometry args={[14, 1]} />
          <meshBasicMaterial
            color="#6c63ff"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   GAME PAGE
   ═══════════════════════════════════════════════════ */

export default function GamePage() {
  const { gameTokens, maxTokens, isGameComplete, resetGame } = useStore();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-primary)" }}>
      {/* Top bar */}
      <div className="glass-strong p-4 flex items-center justify-between z-10">
        <Link
          href="/"
          className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Portfolio
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: maxTokens }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  i < gameTokens
                    ? "bg-accent-primary glow-accent scale-110"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <span className="text-text-secondary text-sm">
            {gameTokens}/{maxTokens}
          </span>
        </div>

        <button onClick={resetGame} className="btn-secondary text-sm py-2 px-4">
          Reiniciar
        </button>
      </div>

      {/* Game canvas */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 8, 8], fov: 50 }}>
          <GameScene />
        </Canvas>

        {/* Instructions overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass rounded-xl px-6 py-3 text-center">
          <p className="text-text-secondary text-sm">
            Usa <span className="text-accent-primary font-bold">WASD</span> o las{" "}
            <span className="text-accent-primary font-bold">flechas</span> para moverte.
            Recoge los <span className="text-accent-secondary font-bold">5 tokens</span> para
            desbloquear el CV.
          </p>
        </div>

        {/* Victory modal */}
        {isGameComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-strong rounded-2xl p-8 text-center max-w-md animate-fade-in-up">
              <div className="text-6xl mb-4">🎉</div>
              <h2
                className="text-3xl font-bold gradient-text mb-4"
                style={{ fontFamily: "var(--font-family-heading)" }}
              >
                ¡Completado!
              </h2>
              <p className="text-text-secondary mb-6">
                Has recogido todos los tokens. ¡Aquí está tu recompensa!
              </p>
              <div className="flex flex-col gap-3">
                <a href="/cv.pdf" download className="btn-primary justify-center">
                  📄 Descargar CV
                </a>
                <button onClick={resetGame} className="btn-secondary justify-center">
                  Jugar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
