"use client";

import React, { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";

/* ═══════════════════════════════════════════════════
   JARDINERA DE CACTUS — hero procedural

   Todo se genera en código: ni un solo .glb que descargar.
   La paleta sigue la regla del sitio (neutros + un carmín):
   los cuerpos son un verde tan desaturado que lee casi gris,
   y el único color saturado de la escena es la flor.
   ═══════════════════════════════════════════════════ */

const BODY = "#4a544d";      // verde grisáceo, apenas fuera del neutro
const BODY_DARK = "#3b433e";
const POT = "#2f2f2f";
const POT_RIM = "#3a3a3a";
const SOIL = "#1f1f1f";
const SPINE = "#8f8d86";
const BLOOM = "#8fb996";     // el acento del sitio, una sola vez en toda la escena

/* ── Utilidades de geometría ─────────────────────── */

/**
 * Desplaza los vértices radialmente con un coseno del ángulo:
 * es lo que convierte un cilindro liso en un cactus acanalado.
 * Se ejecuta una vez al construir la geometría, no por frame.
 */
function applyRibs(
  geometry: THREE.BufferGeometry,
  ribs: number,
  depth: number
): THREE.BufferGeometry {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const radius = Math.hypot(v.x, v.z);
    if (radius < 1e-4) continue;

    const angle = Math.atan2(v.z, v.x);
    const k = 1 + Math.cos(angle * ribs) * depth;
    position.setXYZ(i, v.x * k, v.y, v.z * k);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Degradado radial blanco → transparente dibujado en un canvas 2D.
 * Sirve para dos cosas: el charco de luz del suelo y las sombras
 * falsas de móvil. Una sola textura de 128px para ambas.
 */
function makeRadialTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.18)");
  gradient.addColorStop(0.8, "rgba(255,255,255,0.03)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* ── Espinas ─────────────────────────────────────── */

/**
 * Conos diminutos colocados sobre las crestas de los canales,
 * en un InstancedMesh: 60 espinas cuestan un draw call.
 */
function Spines({
  rows,
  ribs,
  radius,
  from,
  to,
  length = 0.05,
  bulge = 0,
}: {
  rows: number;
  ribs: number;
  radius: number;
  from: number;
  to: number;
  length?: number;
  bulge?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = rows * ribs;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const outward = new THREE.Vector3();
    let i = 0;

    for (let row = 0; row < rows; row++) {
      const t = rows === 1 ? 0.5 : row / (rows - 1);
      const y = THREE.MathUtils.lerp(from, to, t);

      // El radio se estrecha en los extremos si el cuerpo es abombado
      const taper = 1 - bulge * Math.pow(t * 2 - 1, 2);
      // Media cresta de desfase por fila: en línea recta parecen costuras
      const offset = (row % 2) * (Math.PI / ribs);

      for (let rib = 0; rib < ribs; rib++) {
        const angle = (rib / ribs) * Math.PI * 2 + offset;
        outward.set(Math.cos(angle), 0, Math.sin(angle));

        dummy.position.copy(outward).multiplyScalar(radius * taper);
        dummy.position.y = y;
        dummy.quaternion.setFromUnitVectors(up, outward);
        dummy.updateMatrix();

        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [rows, ribs, radius, from, to, bulge]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[length * 0.32, length, 4]} />
      <meshStandardMaterial color={SPINE} roughness={0.75} metalness={0} />
    </instancedMesh>
  );
}

/* ── Maceta ──────────────────────────────────────── */

function Pot({
  radius,
  height,
  castShadow,
}: {
  radius: number;
  height: number;
  castShadow: boolean;
}) {
  return (
    <group>
      {/* Cuerpo troncocónico: más estrecho abajo que arriba */}
      <mesh position={[0, height / 2, 0]} castShadow={castShadow} receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.78, height, 28]} />
        <meshStandardMaterial color={POT} roughness={0.9} metalness={0} />
      </mesh>

      {/* Reborde: el labio que separa la maceta del cuerpo del cactus */}
      <mesh position={[0, height, 0]} castShadow={castShadow}>
        <cylinderGeometry
          args={[radius * 1.07, radius * 1.07, height * 0.13, 28]}
        />
        <meshStandardMaterial color={POT_RIM} roughness={0.85} metalness={0} />
      </mesh>

      {/* Tierra, ligeramente hundida bajo el reborde */}
      <mesh position={[0, height * 1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 1.0, 28]} />
        <meshStandardMaterial color={SOIL} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

/* ── Cactus 1: columnar (saguaro) ────────────────── */

/**
 * Un brazo = codo de toro de un cuarto de vuelta + tramo recto.
 * El toro nace con su arco en el cuadrante +x+y; al girarlo -90°
 * en Z los extremos quedan donde los necesito: uno con la tangente
 * horizontal (pega al tronco) y otro vertical (sigue hacia arriba).
 */
function Arm({
  elbowRadius,
  tube,
  height,
  position,
  castShadow,
}: {
  elbowRadius: number;
  tube: number;
  height: number;
  position: [number, number, number];
  castShadow: boolean;
}) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, -Math.PI / 2]} castShadow={castShadow}>
        <torusGeometry args={[elbowRadius, tube, 10, 20, Math.PI / 2]} />
        <meshStandardMaterial color={BODY} roughness={0.68} metalness={0} />
      </mesh>

      <mesh
        position={[elbowRadius, height / 2, 0]}
        castShadow={castShadow}
      >
        <capsuleGeometry args={[tube, height, 6, 18]} />
        <meshStandardMaterial color={BODY} roughness={0.68} metalness={0} />
      </mesh>
    </group>
  );
}

function ColumnarCactus({
  castShadow,
  detail,
}: {
  castShadow: boolean;
  detail: boolean;
}) {
  const trunk = useMemo(
    () => applyRibs(new THREE.CapsuleGeometry(0.32, 1.95, 8, 40), 11, 0.055),
    []
  );

  return (
    <group>
      <Pot radius={0.52} height={0.52} castShadow={castShadow} />

      <mesh
        geometry={trunk}
        position={[0, 1.55, 0]}
        castShadow={castShadow}
      >
        <meshStandardMaterial color={BODY} roughness={0.68} metalness={0} />
      </mesh>

      {/* Brazo derecho, alto */}
      <Arm
        elbowRadius={0.4}
        tube={0.185}
        height={0.72}
        position={[0.1, 1.62, 0.02]}
        castShadow={castShadow}
      />

      {/* Brazo izquierdo, más bajo y más corto: la asimetría es
          lo que evita que parezca un candelabro */}
      <group scale={[-1, 1, 1]}>
        <Arm
          elbowRadius={0.34}
          tube={0.155}
          height={0.44}
          position={[0.1, 1.12, -0.06]}
          castShadow={castShadow}
        />
      </group>

      {detail && (
        <group position={[0, 1.55, 0]}>
          <Spines rows={9} ribs={11} radius={0.35} from={-0.95} to={0.95} />
        </group>
      )}
    </group>
  );
}

/* ── Cactus 2: nopal ─────────────────────────────── */

/**
 * Areolas sobre las dos caras de una pala. Sin ellas el nopal se lee
 * como un huevo: son las espinas las que dicen "cactus".
 * Los puntos se muestrean en una malla que se recorta contra la
 * elipse, y cada uno se sube a la superficie del elipsoide.
 */
function PadSpines({
  radii,
  rows,
  cols,
}: {
  radii: [number, number, number];
  rows: number;
  cols: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [rx, ry, rz] = radii;
  const count = rows * cols * 2;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3();
    let i = 0;

    for (let row = 0; row < rows; row++) {
      const v = -0.8 + 1.6 * ((row + 0.5) / rows);
      // Filas alternas desplazadas: en cuadrícula recta parecen tornillos
      const offset = (row % 2) * (0.5 / cols);

      for (let col = 0; col < cols; col++) {
        const u = -0.75 + 1.5 * ((col + 0.5) / cols + offset);
        const rest = 1 - u * u - v * v;
        if (rest <= 0.08) continue;

        const z = Math.sqrt(rest);

        for (const side of [1, -1]) {
          dummy.position.set(u * rx, v * ry, side * z * rz);
          // Gradiente del elipsoide: la espina sale perpendicular a la pala
          normal
            .set(u / rx, v / ry, (side * z) / rz)
            .normalize();
          dummy.quaternion.setFromUnitVectors(up, normal);
          dummy.updateMatrix();
          mesh.setMatrixAt(i++, dummy.matrix);
        }
      }
    }

    // Las instancias sobrantes (las recortadas) se colapsan a escala cero
    const empty = new THREE.Matrix4().makeScale(0, 0, 0);
    for (; i < count; i++) mesh.setMatrixAt(i, empty);

    mesh.instanceMatrix.needsUpdate = true;
  }, [rx, ry, rz, rows, cols, count]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.011, 0.05, 4]} />
      <meshStandardMaterial color={SPINE} roughness={0.75} metalness={0} />
    </instancedMesh>
  );
}

function Pad({
  position,
  rotation,
  radii,
  castShadow,
  detail,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  radii: [number, number, number];
  castShadow: boolean;
  detail: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh scale={radii} castShadow={castShadow}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={BODY_DARK} roughness={0.72} metalness={0} />
      </mesh>

      <PadSpines radii={radii} rows={detail ? 6 : 4} cols={detail ? 4 : 3} />
    </group>
  );
}

function NopalCactus({
  castShadow,
  detail,
}: {
  castShadow: boolean;
  detail: boolean;
}) {
  return (
    <group>
      <Pot radius={0.44} height={0.42} castShadow={castShadow} />

      {/* Pala base */}
      <Pad
        position={[0, 1.0, 0]}
        rotation={[0, 0.25, 0.06]}
        radii={[0.42, 0.66, 0.13]}
        castShadow={castShadow}
        detail={detail}
      />

      {/* Pala superior izquierda, brotando del canto de la base */}
      <Pad
        position={[-0.42, 1.62, 0.04]}
        rotation={[0, 0.4, 0.72]}
        radii={[0.3, 0.44, 0.11]}
        castShadow={castShadow}
        detail={detail}
      />

      {/* Pala superior derecha, más pequeña y más abierta */}
      <Pad
        position={[0.38, 1.46, -0.06]}
        rotation={[0, -0.25, -0.92]}
        radii={[0.23, 0.36, 0.095]}
        castShadow={castShadow}
        detail={detail}
      />
    </group>
  );
}

/* ── Cactus 3: barril, con flor ──────────────────── */

function Bloom({ castShadow }: { castShadow: boolean }) {
  const petals = useMemo(
    () => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2),
    []
  );

  return (
    <group>
      {petals.map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.07, 0, Math.sin(angle) * 0.07]}
          rotation={[0, -angle, 0.55]}
          scale={[0.075, 0.028, 0.045]}
          castShadow={castShadow}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial
            color={BLOOM}
            roughness={0.5}
            emissive={BLOOM}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.02, 0]} scale={[0.045, 0.03, 0.045]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#dbe8dd" roughness={0.6} />
      </mesh>
    </group>
  );
}

function BarrelCactus({
  castShadow,
  detail,
}: {
  castShadow: boolean;
  detail: boolean;
}) {
  const body = useMemo(
    () => applyRibs(new THREE.SphereGeometry(0.46, 40, 26), 13, 0.075),
    []
  );

  return (
    <group>
      <Pot radius={0.46} height={0.36} castShadow={castShadow} />

      <mesh
        geometry={body}
        position={[0, 0.78, 0]}
        scale={[1, 0.92, 1]}
        castShadow={castShadow}
      >
        <meshStandardMaterial color={BODY} roughness={0.7} metalness={0} />
      </mesh>

      {detail && (
        <group position={[0, 0.78, 0]}>
          <Spines
            rows={5}
            ribs={13}
            radius={0.5}
            from={-0.26}
            to={0.26}
            length={0.055}
            bulge={0.22}
          />
        </group>
      )}

      <group position={[0, 1.22, 0]}>
        <Bloom castShadow={castShadow} />
      </group>
    </group>
  );
}

/* ── Suelo ───────────────────────────────────────── */

/**
 * No es un plano de suelo: es un charco de luz que se desvanece
 * antes de llegar al borde. Así no aparece una línea de horizonte
 * cortando el hero, y la sombra tiene algo más claro que el fondo
 * de la página sobre lo que dibujarse (si se iguala, desaparece).
 */
function Ground({
  texture,
  receiveShadow,
}: {
  texture: THREE.Texture;
  receiveShadow: boolean;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow={receiveShadow}
    >
      <circleGeometry args={[4.2, 48]} />
      <meshStandardMaterial
        color="#1b1b1b"
        alphaMap={texture}
        transparent
        roughness={1}
        metalness={0}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Sombra pintada para móvil, donde no hay shadow map. */
function FakeShadow({
  texture,
  position,
  scale,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
  scale: number;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      scale={[scale * 1.5, scale, 1]}
    >
      <circleGeometry args={[1, 24]} />
      <meshBasicMaterial
        color="#0b0b0b"
        alphaMap={texture}
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Escena ──────────────────────────────────────── */

const CACTI: {
  key: string;
  x: number;
  z: number;
  shadowScale: number;
}[] = [
  { key: "nopal", x: -1.42, z: 0.22, shadowScale: 0.5 },
  { key: "columnar", x: 0.05, z: -0.12, shadowScale: 0.62 },
  { key: "barrel", x: 1.35, z: 0.4, shadowScale: 0.55 },
];

export default function HeroScene() {
  const rootRef = useRef<THREE.Group>(null);
  const swayRefs = useRef<(THREE.Group | null)[]>([]);

  const viewport = useThree((state) => state.viewport);
  const width = useThree((state) => state.size.width);

  const texture = useMemo(() => makeRadialTexture(), []);

  const isMobile = width < 768;
  const shadows = !isMobile;
  const detail = !isMobile;

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  /**
   * Colocación derivada del viewport, no de breakpoints inventados.
   * En escritorio el texto vive a la izquierda, así que la jardinera
   * se va al tercio derecho; en móvil el texto está centrado y los
   * cactus bajan al pie de la pantalla, más pequeños.
   */
  const layout = useMemo(() => {
    if (isMobile) {
      const scale = THREE.MathUtils.clamp(viewport.width / 6.4, 0.42, 0.72);
      return {
        scale,
        position: [0, -viewport.height * 0.4, 0] as [number, number, number],
      };
    }
    const scale = THREE.MathUtils.clamp(viewport.width / 11.5, 0.78, 1.22);
    return {
      scale,
      position: [
        viewport.width * 0.24,
        -viewport.height * 0.3,
        0,
      ] as [number, number, number],
    };
  }, [isMobile, viewport.width, viewport.height]);

  /* Entrada: los cactus crecen desde la maceta, escalonados.
     Arranca con el mismo retraso que el texto del hero. */
  useLayoutEffect(() => {
    const groups = swayRefs.current.filter(Boolean) as THREE.Group[];
    if (!groups.length) return;

    if (reducedMotion) {
      groups.forEach((g) => g.scale.setScalar(1));
      return;
    }

    groups.forEach((g) => g.scale.set(0.75, 0, 0.75));

    const tween = gsap.to(
      groups.map((g) => g.scale),
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.1,
        ease: "back.out(1.5)",
        stagger: 0.14,
        delay: 1.5,
      }
    );

    return () => {
      tween.kill();
    };
  }, [reducedMotion]);

  /* Balanceo casi imperceptible + paralaje con el puntero.
     La rotación se aplica al grupo raíz, nunca a la cámara:
     mover la cámara descuadraría la composición responsive. */
  useFrame((state, delta) => {
    if (reducedMotion) return;

    const time = state.clock.getElapsedTime();

    swayRefs.current.forEach((group, i) => {
      if (!group) return;
      group.rotation.z = Math.sin(time * 0.4 + i * 1.7) * 0.012;
      group.rotation.x = Math.cos(time * 0.33 + i * 2.1) * 0.008;
    });

    if (rootRef.current && !isMobile) {
      const targetY = state.pointer.x * 0.16;
      const targetX = -state.pointer.y * 0.06;
      const k = 1 - Math.pow(0.001, delta); // amortiguado, no lineal
      rootRef.current.rotation.y = THREE.MathUtils.lerp(
        rootRef.current.rotation.y, targetY, k
      );
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x, targetX, k
      );
    }
  });

  return (
    <group
      ref={rootRef}
      position={layout.position}
      scale={layout.scale}
    >
      <Ground texture={texture} receiveShadow={shadows} />

      {CACTI.map((item, i) => (
        <group key={item.key} position={[item.x, 0, item.z]}>
          {!shadows && (
            <FakeShadow
              texture={texture}
              position={[0.12, 0.012, 0.18]}
              scale={item.shadowScale}
            />
          )}

          <group
            ref={(el) => {
              swayRefs.current[i] = el;
            }}
          >
            {item.key === "columnar" && (
              <ColumnarCactus castShadow={shadows} detail={detail} />
            )}
            {item.key === "nopal" && (
              <NopalCactus castShadow={shadows} detail={detail} />
            )}
            {item.key === "barrel" && (
              <BarrelCactus castShadow={shadows} detail={detail} />
            )}
          </group>
        </group>
      ))}

      {/* Luz principal: rasante y desde la derecha, para que la
          sombra caiga hacia el texto y una las dos mitades del hero */}
      <directionalLight
        position={[3.4, 5.2, 3.2]}
        intensity={2.1}
        color="#ffffff"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
      />

      {/* Relleno frío por el lado opuesto: sin esto las caras en
          sombra quedan en negro puro y el cactus se ve recortado */}
      <directionalLight
        position={[-4, 2, -2]}
        intensity={0.45}
        color="#9aa6ad"
      />

      {/* Contraluz con el acento del sitio, muy bajo: sólo dibuja
          el borde de la silueta contra el fondo oscuro */}
      <pointLight
        position={[-1.1, 3.1, -2.4]}
        intensity={2.2}
        distance={4.6}
        color={BLOOM}
      />

      <ambientLight intensity={0.35} color="#c9cdd1" />
    </group>
  );
}
