"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════
   STAR FIELD — thousands of stars in a sphere
   ═══════════════════════════════════════════════════ */

function StarField({ count = 2000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute in a sphere
      const radius = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Star colors: white, blue-white, warm-white, faint blue
      const colorChoices = [
        [1, 1, 1],
        [0.85, 0.9, 1],
        [1, 0.95, 0.85],
        [0.7, 0.8, 1],
        [0.95, 0.95, 1],
      ];
      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];

      siz[i] = 0.3 + Math.random() * 1.2;
    }
    return [pos, col, siz];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Slow rotation of the entire star field
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.005;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.003) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════
   NEBULA CLOUDS — soft colored gas clouds
   ═══════════════════════════════════════════════════ */

function NebulaCloud({
  position,
  color,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * speed;
      meshRef.current.rotation.z = t * 0.02;
      meshRef.current.scale.setScalar(
        scale * (1 + Math.sin(t * 0.3) * 0.05)
      );
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.04}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════
   GALAXY SPIRAL — rotating disc of particles
   ═══════════════════════════════════════════════════ */

function GalaxySpiral({ count = 3000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const arms = 3;
    const armSpread = 0.4;

    for (let i = 0; i < count; i++) {
      const radius = 0.5 + Math.random() * 6;
      const armIndex = i % arms;
      const armAngle = (armIndex / arms) * Math.PI * 2;
      const spiralAngle = radius * 0.8; // tighter spiral

      const angle =
        armAngle +
        spiralAngle +
        (Math.random() - 0.5) * armSpread * (1 + radius * 0.3);

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3 * (1 / (1 + radius * 0.5));
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // Core = warm (white/yellow), edges = cool (blue/purple)
      const t = radius / 6;
      const innerColor = new THREE.Color("#fff8e7");
      const outerColor = new THREE.Color("#6c63ff");
      const mixed = innerColor.clone().lerp(outerColor, t * 0.7);

      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={pointsRef} rotation={[0.6, 0, 0.3]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════
   SHOOTING STARS — occasional streaks
   ═══════════════════════════════════════════════════ */

function ShootingStars({ count = 5 }: { count?: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  const stars = useMemo(() => {
    return Array.from({ length: count }, () => ({
      startX: (Math.random() - 0.5) * 30,
      startY: 5 + Math.random() * 15,
      startZ: -10 - Math.random() * 20,
      speed: 8 + Math.random() * 12,
      delay: Math.random() * 20,
      length: 0.3 + Math.random() * 0.5,
    }));
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    stars.forEach((star, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;

      const cycleTime = (time + star.delay) % 15;
      if (cycleTime < 0.8) {
        // Active phase
        const progress = cycleTime / 0.8;
        mesh.visible = true;
        mesh.position.x = star.startX + progress * star.speed;
        mesh.position.y = star.startY - progress * star.speed * 0.5;
        mesh.position.z = star.startZ;
        mesh.scale.x = star.length * (1 - progress * 0.5);
        const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
        (mesh.material as THREE.MeshBasicMaterial).opacity = fade * 0.8;
      } else {
        mesh.visible = false;
      }
    });
  });

  return (
    <>
      {stars.map((star, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          visible={false}
          rotation={[0, 0, -Math.PI / 4]}
        >
          <planeGeometry args={[star.length, 0.01]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN HERO SCENE
   ═══════════════════════════════════════════════════ */

export default function HeroScene() {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Gentle camera sway
    state.camera.position.x = Math.sin(time * 0.08) * 0.8;
    state.camera.position.y = Math.cos(time * 0.06) * 0.4 + 1;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      {/* Deep space background stars */}
      <StarField count={2500} />

      {/* Galaxy spiral in the center */}
      <GalaxySpiral count={4000} />

      {/* Nebula gas clouds */}
      <NebulaCloud position={[4, 2, -8]} color="#6c63ff" scale={3} speed={0.8} />
      <NebulaCloud position={[-5, -1, -10]} color="#00d4ff" scale={4} speed={0.6} />
      <NebulaCloud position={[0, 3, -12]} color="#ff6b9d" scale={2.5} speed={1} />
      <NebulaCloud position={[-3, -3, -6]} color="#9333ea" scale={2} speed={0.9} />
      <NebulaCloud position={[6, 0, -15]} color="#2563eb" scale={3.5} speed={0.5} />

      {/* Shooting stars */}
      <ShootingStars count={6} />

      {/* Subtle ambient glow */}
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, -5]} color="#6c63ff" intensity={0.5} distance={20} />
      <pointLight position={[3, 2, -3]} color="#00d4ff" intensity={0.3} distance={15} />
    </group>
  );
}
