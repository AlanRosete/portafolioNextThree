"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  count?: number;
  size?: number;
  color1?: string;
  color2?: string;
  spread?: number;
}

export default function Particles({
  count = 500,
  size = 0.015,
  color1 = "#f8f8f8",
  color2 = "#898989",
  spread = 15,
}: ParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        ),
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 1,
      });
    }
    return temp;
  }, [count, spread]);

  const colors = useMemo(() => {
    const colorArray = new Float32Array(count * 3);
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const mixedColor = c1.clone().lerp(c2, t);
      colorArray[i * 3] = mixedColor.r;
      colorArray[i * 3 + 1] = mixedColor.g;
      colorArray[i * 3 + 2] = mixedColor.b;
    }
    return colorArray;
  }, [count, color1, color2]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      const { position, speed, offset, scale } = particle;
      dummy.position.set(
        position.x + Math.sin(time * speed + offset) * 0.3,
        position.y + Math.cos(time * speed + offset) * 0.3,
        position.z + Math.sin(time * speed * 0.5 + offset) * 0.2
      );
      dummy.scale.setScalar(scale * (0.8 + Math.sin(time * 2 + offset) * 0.2));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial transparent opacity={0.6} />
      <instancedBufferAttribute
        attach="instanceColor"
        args={[colors, 3]}
      />
    </instancedMesh>
  );
}
