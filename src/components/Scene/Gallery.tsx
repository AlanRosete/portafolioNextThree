"use client";

import React, { useRef, useMemo, useState, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/data/projects";
import { useStore } from "@/hooks/useStore";

function ProjectCard3D({
  project,
  index,
  totalProjects,
}: {
  project: (typeof projects)[0];
  index: number;
  totalProjects: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const selectProject = useStore((s) => s.selectProject);

  const color = useMemo(() => new THREE.Color(project.color), [project.color]);

  // Posición base en arreglo circular
  const basePosition = useMemo((): [number, number, number] => {
    const angle = (index / totalProjects) * Math.PI * 2;
    const radius = 3.2;
    return [
      Math.sin(angle) * radius,
      (index - totalProjects / 2) * 2.0,
      Math.cos(angle) * radius,
    ];
  }, [index, totalProjects]);

  // Rotación para que cada card mire hacia el centro
  const rotation = useMemo((): [number, number, number] => {
    const angle = (index / totalProjects) * Math.PI * 2;
    return [0, -angle, 0];
  }, [index, totalProjects]);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Float suave: solo modifica Y localmente dentro del grupo
    groupRef.current.position.set(
      basePosition[0],
      basePosition[1] + Math.sin(time * 0.5 + index * 1.1) * 0.12,
      basePosition[2]
    );

    // Scale interpolado en hover
    const targetScale = hovered ? 1.12 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.08
    );

    // Emissive interpolado
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      hovered ? 0.6 : 0.18,
      0.1
    );
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, hovered ? 0.95 : 0.78, 0.1);

    // Glow
    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      glowMat.opacity = THREE.MathUtils.lerp(
        glowMat.opacity,
        hovered ? 0.25 : 0,
        0.1
      );
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      selectProject(project);
    },
    [project, selectProject]
  );

  return (
    // Este group se encarga del float y la posición base
    <group ref={groupRef} rotation={rotation}>
      {/* Glow de fondo — siempre montado, opacity animada */}
      <mesh ref={glowRef} position={[0, 0, -0.02]}>
        <planeGeometry args={[2.5, 1.65]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Card principal */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <planeGeometry args={[2.2, 1.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.18}
          roughness={0.35}
          metalness={0.65}
          transparent
          opacity={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Título del proyecto — posición fija relativa al grupo */}
      <Text
        position={[0, -0.85, 0.02]}
        fontSize={0.13}
        color="white"
        anchorX="center"
        anchorY="top"
        maxWidth={2}
        font={undefined} // usa tu fuente o elimina esta línea
      >
        {project.title}
      </Text>
    </group>
  );
}

export default function Gallery() {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotY = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Rotación automática suave
    targetRotY.current = time * 0.04;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY.current,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight
        position={[0, 6, 0]}
        color="#ffffff"
        intensity={3}
        distance={20}
      />
      <pointLight
        position={[0, -6, 0]}
        color="#a8a7a8"
        intensity={2}
        distance={20}
      />
      <pointLight
        position={[5, 0, 5]}
        color="#8fb996"
        intensity={1.2}
        distance={15}
      />

      {projects.map((project, i) => (
        <ProjectCard3D
          key={project.id}
          project={project}
          index={i}
          totalProjects={projects.length}
        />
      ))}
    </group>
  );
}