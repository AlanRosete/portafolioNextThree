"use client";

import React, { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/hooks/useTheme";

const TOP = 0;
const THICK = 0.09;

const FLOOR = -0.75;

const BASE_TILT = 0.25;
const BASE_TURN = 0.38;

interface ScenePalette {
  floorBoard: string;
  wallBack: string;
  wallSide: string;
  shadow: string;
  shadowOpacity: number;

  deskTop: string;
  deskBody: string;
  deskPanel: string;

  device: string;
  deviceSoft: string;

  mug: string;
  lampMetal: string;
  lampShade: string;
  lampLight: string;
  lampIntensity: number;
  chair: string;
  chairSoft: string;

  key: number;
  fill: string;
  fillIntensity: number;
  ambient: string;
  ambientIntensity: number;
}

const DARK_PALETTE: ScenePalette = {
  floorBoard: "#443d35",
  wallBack: "#413b34",
  wallSide: "#544d44",
  shadow: "#0a0a0a",
  shadowOpacity: 0.5,

  deskTop: "#4f4843",
  deskBody: "#332f2c",
  deskPanel: "#3b3733",

  device: "#2a2a2a",
  deviceSoft: "#3a3a3a",

  mug: "#6b7c70",
  lampMetal: "#2a2a2a",
  lampShade: "#3a3632",
  lampLight: "#FFF6F5",
  lampIntensity: 1.6,

  chair: "#4a4845",
  chairSoft: "#5c5955",

  key: 2.1,
  fill: "#9aa6ad",
  fillIntensity: 0.5,
  ambient: "#c9cdd1",
  ambientIntensity: 0.55,
};

const LIGHT_PALETTE: ScenePalette = {
  floorBoard: "#d6cdbe",
  wallBack: "#e9e5de",
  wallSide: "#dcd7ce",
  shadow: "#b5afa5",
  shadowOpacity: 0.35,

  deskTop: "#c5bbab",
  deskBody: "#a79d90",
  deskPanel: "#b3a99b",

  device: "#d5d1cb",
  deviceSoft: "#e4e1db",

  mug: "#7d9584",
  lampMetal: "#6b6760",
  lampShade: "#e4ded4",
  lampLight: "#ffe2bd",
  lampIntensity: 0.8,
  chair: "#948f87",
  chairSoft: "#a8a29a",

  key: 1.7,
  fill: "#b9c2c8",
  fillIntensity: 0.4,
  ambient: "#efece6",
  ambientIntensity: 0.85,
};

const PaletteContext = React.createContext<ScenePalette>(DARK_PALETTE);
const usePalette = () => React.useContext(PaletteContext);

function makeRadialTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.22, "rgba(255,255,255,0.48)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.12)");
  gradient.addColorStop(0.8, "rgba(255,255,255,0.015)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function makeCodeTexture(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const u = height / 100;
  const rowH = 4.6 * u;
  const barH = Math.max(2, 2 * u);

  ctx.fillStyle = "#1d2128";
  ctx.fillRect(0, 0, width, height);
  const sideW = width * 0.22;
  ctx.fillStyle = "#171a20";
  ctx.fillRect(0, 0, sideW, height);
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(sideW, 0, Math.max(1, u * 0.6), height);

  ctx.fillStyle = "#14171c";
  ctx.fillRect(0, 0, width, 6 * u);
  ["#d9737d", "#d9b36b", "#8fb996"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(4 * u + i * 3.6 * u, 3 * u, 1.1 * u, 0, Math.PI * 2);
    ctx.fill();
  });

  const treeDepth = [0, 0, 1, 1, 2, 2, 1, 0, 1, 2, 2, 3, 1, 0, 1, 1, 2, 0, 0, 1];
  treeDepth.forEach((d, i) => {
    const y = 10 * u + i * rowH;
    if (y > height - rowH) return;
    const x = 3 * u + d * 3 * u;
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(x, y, 2 * u, barH);
    ctx.fillStyle = "#5f6b7a";
    ctx.fillRect(x + 3 * u, y, (6 + rand() * 9) * u, barH);
  });

  const tokens = ["#8fb996", "#d9a066", "#7fa7c4", "#c8ccd4", "#c8ccd4", "#c792ea"];
  const codeX = sideW + 4 * u;
  let indent = 0;
  for (let i = 0; ; i++) {
    const y = 10 * u + i * rowH;
    if (y > height - rowH) break;

    ctx.fillStyle = "#3b4250";
    ctx.fillRect(codeX, y, 2.5 * u, barH);

    const r = rand();
    if (r < 0.28 && indent < 4) indent++;
    else if (r < 0.5 && indent > 0) indent--;
    if (i % 9 === 8) indent = 0;
    if (rand() < 0.08) continue;

    let x = codeX + 6 * u + indent * 4 * u;
    const count = 2 + Math.floor(rand() * 4);
    for (let t = 0; t < count; t++) {
      const w = (5 + rand() * 20) * u;
      if (x + w > width - 3 * u) break;
      ctx.fillStyle = tokens[Math.floor(rand() * tokens.length)];
      ctx.fillRect(x, y, w, barH);
      x += w + 1.5 * u;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function Room() {
  const p = usePalette();
  const WALL_H = 2.1;

  return (
    <group>
      <mesh position={[0.275, FLOOR - 0.045, 0.15]}>
        <boxGeometry args={[3.65, 0.09, 2.1]} />
        <meshLambertMaterial color={p.floorBoard} />
      </mesh>

      <mesh position={[0.275, FLOOR + WALL_H / 2, -0.9]}>
        <boxGeometry args={[3.65, WALL_H, 0.1]} />
        <meshLambertMaterial color={p.wallBack} />
      </mesh>

      <mesh position={[2.1, FLOOR + WALL_H / 2, -0.2]}>
        <boxGeometry args={[0.1, WALL_H, 1.5]} />
        <meshLambertMaterial color={p.wallSide} />
      </mesh>
    </group>
  );
}

function Contact({
  texture,
  position,
  scale,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
  scale: [number, number];
}) {
  const p = usePalette();

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      scale={[scale[0], scale[1], 1]}
    >
      <circleGeometry args={[1, 20]} />
      <meshBasicMaterial
        color={p.shadow}
        alphaMap={texture}
        transparent
        opacity={p.shadowOpacity}
        depthWrite={false}
      />
    </mesh>
  );
}

function Desk() {
  const p = usePalette();
  const legTop = TOP - THICK;
  const legHeight = legTop - FLOOR;

  return (
    <group>
      <RoundedBox
        args={[2.6, THICK, 1.15]}
        radius={0.02}
        smoothness={2}
        position={[0, TOP - THICK / 2, 0]}
      >
        <meshLambertMaterial color={p.deskTop} />
      </RoundedBox>

      {}
      <RoundedBox
        args={[0.52, legHeight, 0.88]}
        radius={0.02}
        smoothness={2}
        position={[-0.92, FLOOR + legHeight / 2, -0.02]}
      >
        <meshLambertMaterial color={p.deskBody} />
      </RoundedBox>

      {}
      {[0.16, -0.1].map((y) => (
        <mesh key={y} position={[-0.66, legTop - 0.22 + y, -0.02]}>
          <boxGeometry args={[0.012, 0.02, 0.26]} />
          <meshLambertMaterial color={p.deskPanel} />
        </mesh>
      ))}

      {}
      <RoundedBox
        args={[0.07, legHeight, 0.98]}
        radius={0.02}
        smoothness={2}
        position={[1.22, FLOOR + legHeight / 2, -0.02]}
      >
        <meshLambertMaterial color={p.deskPanel} />
      </RoundedBox>
    </group>
  );
}

function Monitor({ screen }: { screen: THREE.Texture }) {
  const p = usePalette();

  return (
    <group position={[-0.05, TOP, -0.3]}>
      <mesh position={[0, 0.012, 0.02]}>
        <boxGeometry args={[0.44, 0.024, 0.2]} />
        <meshLambertMaterial color={p.device} />
      </mesh>

      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.08, 0.28, 0.06]} />
        <meshLambertMaterial color={p.device} />
      </mesh>

      {}
      <group position={[0, 0.66, 0]} rotation={[-0.07, 0, 0]}>
        <RoundedBox args={[1.26, 0.74, 0.05]} radius={0.015} smoothness={2}>
          <meshLambertMaterial color={p.device} />
        </RoundedBox>

        {}
        <mesh position={[0, 0.015, 0.027]}>
          <planeGeometry args={[1.18, 0.64]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Laptop({ screen }: { screen: THREE.Texture }) {
  const p = usePalette();

  return (
    <group position={[0.6, TOP, 0.16]} rotation={[0, -0.42, 0]}>
      <RoundedBox args={[0.62, 0.026, 0.42]} radius={0.008} smoothness={2}
        position={[0, 0.013, 0]}>
        <meshLambertMaterial color={p.deviceSoft} />
      </RoundedBox>

      <mesh position={[0, 0.027, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.26]} />
        <meshLambertMaterial color={p.device} />
      </mesh>

      {}
      <group position={[0, 0.026, -0.21]} rotation={[-0.3, 0, 0]}>
        <RoundedBox args={[0.62, 0.4, 0.022]} radius={0.008} smoothness={2}
          position={[0, 0.2, 0]}>
          <meshLambertMaterial color={p.deviceSoft} />
        </RoundedBox>

        <mesh position={[0, 0.2, 0.013]}>
          <planeGeometry args={[0.56, 0.34]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Keyboard() {
  const p = usePalette();

  return (
    <group position={[-0.2, TOP, 0.3]} rotation={[0, 0.06, 0]}>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.7, 0.024, 0.24]} />
        <meshLambertMaterial color={p.deviceSoft} />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.17]} />
        <meshLambertMaterial color={p.device} />
      </mesh>
    </group>
  );
}

function Mug() {
  const p = usePalette();

  return (
    <group position={[-0.72, TOP, 0.36]}>
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.058, 0.05, 0.11, 14]} />
        <meshLambertMaterial color={p.mug} />
      </mesh>
      {}
      <mesh position={[0.075, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.033, 0.01, 5, 10]} />
        <meshLambertMaterial color={p.mug} />
      </mesh>
    </group>
  );
}

function Lamp() {
  const p = usePalette();
  const POLE = 1.62;
  const ARM = 0.5;

  return (
    <group position={[1.7, FLOOR, 0.05]}>
      <mesh position={[0, 0.018, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.036, 20]} />
        <meshLambertMaterial color={p.lampMetal} />
      </mesh>

      <mesh position={[0, POLE / 2, 0]}>
        <cylinderGeometry args={[0.014, 0.014, POLE, 6]} />
        <meshLambertMaterial color={p.lampMetal} />
      </mesh>

      {}
      <mesh position={[-0.12, POLE, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.12, 0.014, 5, 10, Math.PI / 2]} />
        <meshLambertMaterial color={p.lampMetal} />
      </mesh>

      <mesh position={[-0.12 - ARM / 2, POLE + 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, ARM, 6]} />
        <meshLambertMaterial color={p.lampMetal} />
      </mesh>

      <group position={[-0.12 - ARM, POLE + 0.03, 0]}>
        {}
        <mesh>
          <cylinderGeometry args={[0.06, 0.17, 0.2, 18, 1, true]} />
          <meshLambertMaterial color={p.lampShade} side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshBasicMaterial color={p.lampLight} toneMapped={false} />
        </mesh>

        <pointLight
          position={[0, -0.12, 0]}
          color={p.lampLight}
          intensity={p.lampIntensity}
          distance={2.4}
          decay={1.6}
        />
      </group>
    </group>
  );
}

function ChairStar() {
  const p = usePalette();
  const legsRef = useRef<THREE.InstancedMesh>(null);
  const castersRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const legs = legsRef.current;
    const casters = castersRef.current;
    if (!legs || !casters) return;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;

      dummy.position.set(Math.cos(angle) * 0.15, 0.07, Math.sin(angle) * 0.15);
      dummy.rotation.set(0, -angle, 0);
      dummy.updateMatrix();
      legs.setMatrixAt(i, dummy.matrix);

      dummy.position.set(Math.cos(angle) * 0.29, 0.028, Math.sin(angle) * 0.29);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      casters.setMatrixAt(i, dummy.matrix);
    }

    legs.instanceMatrix.needsUpdate = true;
    casters.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh ref={legsRef} args={[undefined, undefined, 5]}>
        <boxGeometry args={[0.3, 0.035, 0.05]} />
        <meshLambertMaterial color={p.chair} />
      </instancedMesh>

      <instancedMesh ref={castersRef} args={[undefined, undefined, 5]}>
        <cylinderGeometry args={[0.032, 0.032, 0.055, 6]} />
        <meshLambertMaterial color={p.chair} />
      </instancedMesh>
    </group>
  );
}

function Chair() {
  const p = usePalette();

  return (
    <group position={[-0.1, FLOOR, 0.92]} rotation={[0, 0.34, 0]}>
      <ChairStar />

      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.045, 0.056, 0.36, 10]} />
        <meshLambertMaterial color={p.chair} />
      </mesh>

      <RoundedBox
        args={[0.5, 0.08, 0.46]}
        radius={0.025}
        smoothness={2}
        position={[0, 0.47, 0]}
      >
        <meshLambertMaterial color={p.chairSoft} />
      </RoundedBox>

      <group position={[0, 0.5, 0.2]} rotation={[0.2, 0, 0]}>
        <RoundedBox
          args={[0.42, 0.6, 0.06]}
          radius={0.03}
          smoothness={2}
          position={[0, 0.3, 0]}
        >
          <meshLambertMaterial color={p.chairSoft} />
        </RoundedBox>

        {}
        <RoundedBox
          args={[0.26, 0.14, 0.05]}
          radius={0.025}
          smoothness={2}
          position={[0, 0.69, 0.012]}
        >
          <meshLambertMaterial color={p.chair} />
        </RoundedBox>
      </group>
    </group>
  );
}

export default function HeroScene() {
  const theme = useTheme();
  const p = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;

  const parallaxRef = useRef<THREE.Group>(null);
  const entryRef = useRef<THREE.Group>(null);
  const propRefs = useRef<(THREE.Group | null)[]>([]);

  const viewport = useThree((state) => state.viewport);
  const width = useThree((state) => state.size.width);
  const isMobile = width < 768;

  const radial = useMemo(() => makeRadialTexture(), []);

  const monitorScreen = useMemo(() => makeCodeTexture(736, 400), []);
  const laptopScreen = useMemo(() => makeCodeTexture(396, 240), []);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const layout = useMemo(() => {
    if (isMobile) {
      const scale = THREE.MathUtils.clamp(viewport.width / 5.7, 0.38, 0.66);
      return {
        scale,
        position: [0, -viewport.height * 0.26, 0] as [number, number, number],
      };
    }
    const scale = THREE.MathUtils.clamp(viewport.width / 12.2, 0.68, 1.08);
    return {
      scale,
      position: [viewport.width * 0.26, -viewport.height * 0.06, 0] as
        [number, number, number],
    };
  }, [isMobile, viewport.width, viewport.height]);

  useLayoutEffect(() => {
    const entry = entryRef.current;
    const props = propRefs.current.filter(Boolean) as THREE.Group[];
    if (!entry) return;

    if (reducedMotion) {
      entry.rotation.y = 0;
      entry.scale.setScalar(1);
      props.forEach((g) => g.scale.setScalar(1));
      return;
    }

    entry.rotation.y = -0.5;
    entry.scale.setScalar(0.9);
    props.forEach((g) => g.scale.setScalar(0));

    const tl = gsap.timeline({ delay: 1.5 });

    tl.to(entry.rotation, { y: 0, duration: 1.2, ease: "power3.out" })
      .to(entry.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: "power3.out" }, 0)
      .to(
        props.map((g) => g.scale),
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.7,
          ease: "back.out(1.6)",
          stagger: 0.09,
        },
        0.35
      );

    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    if (parallaxRef.current && !isMobile) {
      const k = 1 - Math.pow(0.0015, delta);
      parallaxRef.current.rotation.y = THREE.MathUtils.lerp(
        parallaxRef.current.rotation.y,
        BASE_TURN + state.pointer.x * 0.08,
        k
      );
      parallaxRef.current.rotation.x = THREE.MathUtils.lerp(
        parallaxRef.current.rotation.x,
        BASE_TILT - state.pointer.y * 0.035,
        k
      );
    }
  });

  return (
    <PaletteContext.Provider value={p}>
      <group position={layout.position} scale={layout.scale}>
        <group ref={parallaxRef} rotation={[BASE_TILT, BASE_TURN, 0]}>
          <group ref={entryRef}>
            {}
            <group position={[-0.28, -0.26, 0]}>
              <Room />

              {}
              <Contact texture={radial} position={[-0.92, FLOOR + 0.008, -0.02]} scale={[0.42, 0.6]} />
              <Contact texture={radial} position={[1.22, FLOOR + 0.008, -0.02]} scale={[0.24, 0.62]} />
              <Contact texture={radial} position={[1.7, FLOOR + 0.01, 0.05]} scale={[0.26, 0.26]} />
              <Contact texture={radial} position={[-0.1, FLOOR + 0.009, 0.92]} scale={[0.42, 0.42]} />
              {!isMobile && (
                <Contact texture={radial} position={[0.2, FLOOR + 0.006, 0.05]} scale={[0.8, 0.42]} />
              )}

              <Desk />

              <group ref={(el) => { propRefs.current[0] = el; }}>
                <Monitor screen={monitorScreen} />
              </group>
              <group ref={(el) => { propRefs.current[1] = el; }}>
                <Laptop screen={laptopScreen} />
              </group>
              <group ref={(el) => { propRefs.current[2] = el; }}>
                <Keyboard />
              </group>
              <group ref={(el) => { propRefs.current[3] = el; }}>
                <Mug />
              </group>
              <group ref={(el) => { propRefs.current[4] = el; }}>
                <Lamp />
              </group>
              <group ref={(el) => { propRefs.current[5] = el; }}>
                <Chair />
              </group>
            </group>
          </group>
        </group>

        {}
        <directionalLight position={[3.2, 5.4, 3.6]} intensity={p.key} />

        {}
        <directionalLight
          position={[-4, 1.8, -2.2]}
          intensity={p.fillIntensity}
          color={p.fill}
        />

        <ambientLight intensity={p.ambientIntensity} color={p.ambient} />
      </group>
    </PaletteContext.Provider>
  );
}
