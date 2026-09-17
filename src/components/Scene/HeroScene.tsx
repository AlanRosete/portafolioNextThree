"use client";

import React, { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/hooks/useTheme";

// Sin shadow maps: el contacto son quads con alphaMap radial.
// meshLambertMaterial en todo; a este tamaño el microfacetado no se ve.

// Cara superior del tablero; lo que va sobre la mesa cuelga de aquí.
const TOP = 0;
const THICK = 0.09;
// La altura de mesa sale de la diferencia con TOP.
const FLOOR = -0.75;

// El picado se consigue rotando el rig, no la cámara: la cámara encuadra
// texto y 3D a la vez, y moverla descuadra el copy en cada breakpoint.
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

// Los hex del rincón van más altos de lo que parece razonable: el tone
// mapping ACES comprime los valores bajos, y la pared derecha sólo recibe
// relleno y ambiental, así que parte del hex más claro de los tres.
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
  /* Gris medio: en blanco competiría con el gato, que ya es
     el punto claro de la escena y es mucho más pequeño */
  chair: "#4a4845",
  chairSoft: "#5c5955",

  key: 2.1,
  fill: "#9aa6ad",
  fillIntensity: 0.5,
  ambient: "#c9cdd1",
  ambientIntensity: 0.55,
};

// En claro hay que invertir la jerarquía, no sólo aclarar: sobre hueso un
// cuerpo oscuro se recorta como silueta y la sombra pide gris cálido.
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

// La paleta va por contexto: por props habría que enhebrar cada color por
// cinco niveles de <group>.
const PaletteContext = React.createContext<ScenePalette>(DARK_PALETTE);
const usePalette = () => React.useContext(PaletteContext);

// alphaMap compartido por el disco de suelo y las cuatro sombras.
// 256px y no 128: el disco se magnifica a ~700px y el tramado que Chrome
// mete en el degradado se ve como moteado en el borde.
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

// Editor pintado una vez en canvas. El color va dentro de la textura, no
// en el material: el editor es oscuro en ambos temas, así que no se
// regenera con el toggle. Semilla fija para que el código no baile entre
// cargas, y el canvas toma el aspecto del panel o los renglones se estiran.
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

  const u = height / 100; // unidad relativa: vale para cualquier tamaño
  const rowH = 4.6 * u;
  const barH = Math.max(2, 2 * u);

  // Fondo del editor y barra lateral
  ctx.fillStyle = "#1d2128";
  ctx.fillRect(0, 0, width, height);
  const sideW = width * 0.22;
  ctx.fillStyle = "#171a20";
  ctx.fillRect(0, 0, sideW, height);
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(sideW, 0, Math.max(1, u * 0.6), height);

  // Barra de título
  ctx.fillStyle = "#14171c";
  ctx.fillRect(0, 0, width, 6 * u);
  ["#d9737d", "#d9b36b", "#8fb996"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(4 * u + i * 3.6 * u, 3 * u, 1.1 * u, 0, Math.PI * 2);
    ctx.fill();
  });

  // Árbol de archivos: icono + nombre, con sangrado por carpeta
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

  // Código: número de línea + tokens de colores
  const tokens = ["#8fb996", "#d9a066", "#7fa7c4", "#c8ccd4", "#c8ccd4", "#c792ea"];
  const codeX = sideW + 4 * u;
  let indent = 0;
  for (let i = 0; ; i++) {
    const y = 10 * u + i * rowH;
    if (y > height - rowH) break;

    ctx.fillStyle = "#3b4250";
    ctx.fillRect(codeX, y, 2.5 * u, barH);

    // Bloques que abren y cierran: es la silueta en "flecha" del código real
    const r = rand();
    if (r < 0.28 && indent < 4) indent++;
    else if (r < 0.5 && indent > 0) indent--;
    if (i % 9 === 8) indent = 0;
    if (rand() < 0.08) continue; // línea en blanco

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

// Cajas y no planos: el canto del grueso da el aire de cubo recortado; un
// plano se lee como telón pintado. La pared derecha no llega al frente
// (z 0.75 frente a 1.45) para no encajonar la silla. Las paredes llevan
// tonos distintos porque en claro el lambert las dejaba casi idénticas.
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

// Sombra de contacto pintada; sustituye al shadow map.
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

/**
 * Tablero + cajonera a la izquierda + panel macizo a la derecha. La
 * asimetría es lo que evita que lea como mesa de catálogo, y el panel va
 * macizo a propósito: un listón fino ahí se lee como pata rota.
 */
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

      {/* Cajonera */}
      <RoundedBox
        args={[0.52, legHeight, 0.88]}
        radius={0.02}
        smoothness={2}
        position={[-0.92, FLOOR + legHeight / 2, -0.02]}
      >
        <meshLambertMaterial color={p.deskBody} />
      </RoundedBox>

      {/* Tiradores: dos rayas, suficiente para que se lean los cajones */}
      {[0.16, -0.1].map((y) => (
        <mesh key={y} position={[-0.66, legTop - 0.22 + y, -0.02]}>
          <boxGeometry args={[0.012, 0.02, 0.26]} />
          <meshLambertMaterial color={p.deskPanel} />
        </mesh>
      ))}

      {/* Costado derecho */}
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

      {/* El panel se inclina hacia atrás: de frente parecería un cartel */}
      <group position={[0, 0.66, 0]} rotation={[-0.07, 0, 0]}>
        <RoundedBox args={[1.26, 0.74, 0.05]} radius={0.015} smoothness={2}>
          <meshLambertMaterial color={p.device} />
        </RoundedBox>

        {/* Encendida: basic sin iluminar y SIN tone mapping — con ACES los
            colores del código salían apagados. Cuesta cero y ahorra el
            emissive, que en gama baja se paga cada frame */}
        <mesh position={[0, 0.015, 0.027]}>
          <planeGeometry args={[1.18, 0.64]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// Girado para que la tapa muerda la esquina del monitor: sin ese solape
// los objetos quedan en fila.
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

      {/* Bisagra en el canto trasero: el grupo pivota ahí, no en el centro.
          El ángulo es pequeño A PROPÓSITO — la tapa parte de vertical, así
          que pasarse de -0.5 la tumba por debajo del tablero */}
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
      {/* El asa es lo que lo convierte en taza y no en vaso */}
      <mesh position={[0.075, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.033, 0.01, 5, 10]} />
        <meshLambertMaterial color={p.mug} />
      </mesh>
    </group>
  );
}

// Una sola pointLight de alcance corto y sin sombras: con Lambert cuesta
// una suma por fragmento, mientras que el shadow map de una point light
// son seis pasadas.
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

      {/* Codo: cuarto de toro que dobla el mástil hacia la mesa */}
      <mesh position={[-0.12, POLE, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.12, 0.014, 5, 10, Math.PI / 2]} />
        <meshLambertMaterial color={p.lampMetal} />
      </mesh>

      <mesh position={[-0.12 - ARM / 2, POLE + 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, ARM, 6]} />
        <meshLambertMaterial color={p.lampMetal} />
      </mesh>

      <group position={[-0.12 - ARM, POLE + 0.03, 0]}>
        {/* Pantalla: cono abierto por abajo */}
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

// Dos InstancedMesh para las diez piezas: 2 draw calls en vez de 10.
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

      // La pata nace a lo largo de +x; girar -ángulo en Y la manda al radio
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

// Girada un cuarto: a escuadra lee como silla de catálogo. El respaldo
// pivota desde el canto trasero del asiento; desde el centro se hunde en
// el cojín.
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

        {/* Cabecero: es la pieza que dice "ergonómica" y no "silla de cocina" */}
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
  // Dos texturas: cada pantalla tiene su aspecto (1.84 y 1.65) y compartir
  // canvas estiraba el código en una de ellas
  const monitorScreen = useMemo(() => makeCodeTexture(736, 400), []);
  const laptopScreen = useMemo(() => makeCodeTexture(396, 240), []);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Colocación derivada del viewport de r3f, no de breakpoints: en
  // escritorio el copy va a la izquierda y el rincón al tercio derecho; en
  // móvil el texto ancla arriba y el rincón baja al pie.
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

  /* El rincón entra girando hasta su ángulo base mientras crece,
     y luego brotan los objetos de encima. Arranca con el mismo retraso que
     el texto del hero para que lleguen juntos. */
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

  /* Lo único por frame: el paralaje, que se
     amortigua con una exponencial del delta, no con un lerp fijo, para que
     no dependa de los FPS del equipo. */
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
            {/* El rig se centra sobre su propio origen. Con el rincón la
                caja creció de 3.3 a 3.75 de ancho y de 1.85 a 2.2 de alto
                (x -1.6 a 2.15, y -0.84 a 1.35), así que el empujón cambió:
                sin él el paralaje giraría alrededor de un punto descentrado */}
            <group position={[-0.28, -0.26, 0]}>
              <Room />

              {/* Ceñidas a la huella real de cada pieza: un disco mayor que
                  el mueble no lee como contacto, lee como mancha */}
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

        {/* Clave alta y por delante-derecha: deja el canto izquierdo del
            mueble en penumbra, que es lo que da el volumen de maqueta */}
        <directionalLight position={[3.2, 5.4, 3.6]} intensity={p.key} />

        {/* Relleno frío por el lado opuesto: sin él las caras en sombra
            caen a negro puro y el mueble se recorta como silueta */}
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
