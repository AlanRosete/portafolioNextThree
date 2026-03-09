"use client";

import React, { useRef, useMemo, useState, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
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
  const [hovered, setHovered] = useState(false);
  const selectProject = useStore((s) => s.selectProject);

  const color = useMemo(() => new THREE.Color(project.color), [project.color]);

  // Position in a spiral/tunnel arrangement
  const position = useMemo((): [number, number, number] => {
    const angle = (index / totalProjects) * Math.PI * 2;
    const radius = 2.5;
    return [
      Math.sin(angle) * radius,
      (index - totalProjects / 2) * 1.8,
      Math.cos(angle) * radius - 3,
    ];
  }, [index, totalProjects]);

  const rotation = useMemo((): [number, number, number] => {
    const angle = (index / totalProjects) * Math.PI * 2;
    return [0, -angle + Math.PI, 0];
  }, [index, totalProjects]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const targetScale = hovered ? 1.15 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
    // Gentle float
    meshRef.current.position.y =
      position[1] + Math.sin(time * 0.5 + index) * 0.1;
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      selectProject(project);
    },
    [project, selectProject]
  );

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
      <group position={position} rotation={rotation}>
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
            emissiveIntensity={hovered ? 0.5 : 0.15}
            roughness={0.4}
            metalness={0.6}
            transparent
            opacity={hovered ? 0.95 : 0.75}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Project title */}
        <Text
          position={[0, -0.9, 0.01]}
          fontSize={0.14}
          color="white"
          anchorX="center"
          anchorY="top"
          maxWidth={2}
        >
          {project.title}
        </Text>

        {/* Outline glow */}
        {hovered && (
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.3, 1.5]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}

export default function Gallery() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Lighting for gallery */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} color="#6c63ff" intensity={2} distance={15} />
      <pointLight position={[0, -5, 0]} color="#00d4ff" intensity={1.5} distance={15} />

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
