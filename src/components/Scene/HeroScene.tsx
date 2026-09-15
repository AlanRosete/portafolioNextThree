"use client";

import React, { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/hooks/useTheme";

/* ═══════════════════════════════════════════════════
   RINCÓN DE ESCRITORIO — hero procedural

   Bosquejo: rincón con mesa, monitor, portátil, silla ergonómica
   y lámpara de arco. Ni un .glb que descargar.

   Presupuesto, porque el hero tiene que correr en gama baja:
   · sin shadow maps (ni en escritorio) — el contacto son cuatro
     quads con alphaMap de degradado radial;
   · meshLambertMaterial en todo, nunca standard: a este tamaño
     nadie ve el microfacetado y el shader es la mitad de largo;
   · dos direccionales, una ambiental y la bombilla; ninguna proyecta;
   · sin emissive, sin bloom, sin postprocesado;
   · por frame sólo se toca una cosa: el paralaje del grupo raíz.
   ═══════════════════════════════════════════════════ */

/* ── Medidas maestras ────────────────────────────── */

/** Cara superior del tablero. Todo lo que va "sobre la mesa" cuelga de aquí. */
const TOP = 0;
const THICK = 0.09;
/** Suelo. La altura de mesa sale de la diferencia con TOP. */
const FLOOR = -0.75;

/**
 * El picado de tres cuartos se consigue rotando el RIG, nunca moviendo la
 * cámara: la cámara del hero encuadra texto y 3D a la vez, y tocarla
 * descuadraría el bloque de copy en cada breakpoint.
 * TILT baja la vista sobre el tablero; TURN adelanta el canto izquierdo,
 * y manda la lámpara al fondo.
 */
const BASE_TILT = 0.25;
const BASE_TURN = 0.38;

/* ── Paletas ─────────────────────────────────────── */

interface ScenePalette {
  /** Tablero de suelo y las dos paredes del rincón. */
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
  /** Luz de la bombilla: el único cálido de la escena. */
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

/**
 * Dos cosas obligan a subir los hex del rincón mucho más de lo que parece
 * razonable sobre un fondo de página casi negro:
 *
 * 1. El canvas sale con tone mapping ACES, que COMPRIME los valores bajos.
 *    Un #2b2825 acaba por debajo del fondo de la página y el rincón se lee
 *    como agujero negro en vez de como interior en penumbra.
 * 2. La pared derecha sólo recibe el relleno y la ambiental —su normal -x le
 *    da la espalda a la luz clave—, así que tiene que partir de un hex
 *    BASTANTE más claro que la de fondo para acabar igual de visible. Por eso
 *    `wallSide` es aquí el color más claro de los tres y no el más oscuro.
 *
 * La relación es la misma que en claro, donde las paredes también quedan por
 * encima del tablero de la mesa.
 */
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
  /* Gris medio a propósito: en blanco competiría con el gato, que ya es
     el punto claro de la escena y es mucho más pequeño */
  chair: "#4a4845",
  chairSoft: "#5c5955",

  key: 2.1,
  fill: "#9aa6ad",
  fillIntensity: 0.5,
  ambient: "#c9cdd1",
  ambientIntensity: 0.55,
};

/**
 * En claro no basta con aclarar: hay que invertir la jerarquía. Los cuerpos
 * suben de luminancia (sobre hueso, un cuerpo oscuro se recorta como
 * silueta), la sombra deja de ser negra — una sombra real
 * sobre una superficie hueso es un gris cálido, no un disco negro.
 */
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

/**
 * La paleta viaja por contexto y no por props: si no, cada color habría que
 * enhebrarlo por cinco niveles de <group> hasta llegar a cada material.
 */
const PaletteContext = React.createContext<ScenePalette>(DARK_PALETTE);
const usePalette = () => React.useContext(PaletteContext);

/* ── Texturas de canvas ──────────────────────────── */

/**
 * Degradado radial blanco → transparente. Es el alphaMap del disco de suelo
 * y de las cuatro sombras de contacto: una sola textura para las cinco.
 *
 * 256px y no 128: el disco se magnifica a ~700px en pantalla, así que cada
 * téxel se estira a varios píxeles y el TRAMADO que Chrome mete en el
 * degradado (para evitar bandas) se ve como moteado en el borde. El doble de
 * resolución lo deja por debajo del píxel. Sigue siendo una textura de
 * 256 KB generada una vez, no por frame.
 */
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

/**
 * Editor de código a todo color: árbol de archivos, números de línea y
 * tokens en varios tonos, pintado una vez en canvas.
 *
 * Antes era una máscara blanca teñida por el material y a tamaño real se
 * leía como "rayas negras". Ahora el color va DENTRO de la textura, y como
 * el editor es oscuro en los dos temas (igual que un VS Code real), no hay
 * que regenerarla con el toggle.
 *
 * Los tokens salen de un generador con semilla fija: el mismo código en
 * cada carga, sin Math.random que cambie la pantalla en cada render.
 * El canvas se pide con el MISMO aspecto que el panel que lo muestra; si
 * no, los renglones se estiran y el encuadre se ve mal.
 */
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

/* ── Suelo y contacto ────────────────────────────── */

/**
 * El rincón: tablero de suelo y dos paredes, la de fondo y la de la derecha.
 *
 * Van como CAJAS y no como planos: el canto visible del grueso es justo lo
 * que da el aire de "cubo recortado" de la referencia isométrica, y un plano
 * sin grueso se lee como telón pintado.
 *
 * La pared derecha NO llega al frente (su z se queda en 0.75 mientras el
 * suelo sigue hasta 1.45): el rincón queda abierto por delante, y así la
 * silla no aparece encajonada contra un muro.
 *
 * Las dos paredes son el mismo material con distinta orientación, así que
 * el sombreado lambert las separa solo: la normal de la de fondo mira a la
 * clave y la de la derecha le da la espalda. Aun así llevan tonos distintos
 * —sin eso, en el tema claro las dos caras salían casi idénticas.
 */
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

/** Sombra de contacto pintada. Sustituye al shadow map entero. */
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

/* ── Mueble ──────────────────────────────────────── */

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

/* ── Monitor ─────────────────────────────────────── */

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

/* ── Portátil ────────────────────────────────────── */

/** Girado y adelantado para que su tapa muerda la esquina del monitor:
 *  sin ese solape los objetos quedan en fila, como estante de tienda. */
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

/* ── Trastos de mesa ─────────────────────────────── */

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

/* ── Lámpara de pie ──────────────────────────────── */

/**
 * Lámpara de arco en el rincón derecho, donde antes iba el nopal: la
 * pantalla cuelga sobre el canto de la mesa y la bombilla es la única luz
 * cálida de la escena.
 *
 * Una sola pointLight de alcance corto (distance 2.4) y SIN sombras. Con
 * Lambert cuesta una suma más por fragmento; lo que sale caro en gama baja
 * es el shadow map de una point light (seis pasadas), y eso no está.
 */
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

/* ── Silla ergonómica ────────────────────────────── */

/**
 * La estrella de cinco patas con sus ruedas: dos InstancedMesh, 2 draw calls
 * para las diez piezas. Sueltas serían diez, y es la parte de la silla que
 * menos se ve.
 */
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

      // La pata nace en boxGeometry a lo largo de +x; girar -ángulo en Y
      // la manda exactamente a ese radio
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

/**
 * Delante de la mesa y de espaldas a cámara, girada un poco: de frente y a
 * escuadra leería como silla de catálogo, y ese cuarto de giro es lo que
 * hace que parezca que alguien acaba de levantarse.
 *
 * El respaldo pivota desde el canto TRASERO del asiento, no desde su centro:
 * inclinado desde el centro se hunde dentro del cojín.
 */
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

/* ── Escena ──────────────────────────────────────── */

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
  // Dos texturas y no una: cada pantalla tiene su aspecto (1.84 el monitor,
  // 1.65 el portátil) y compartir canvas estiraba el código en una de ellas
  const monitorScreen = useMemo(() => makeCodeTexture(736, 400), []);
  const laptopScreen = useMemo(() => makeCodeTexture(396, 240), []);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  /**
   * Colocación derivada del viewport de r3f, no de breakpoints inventados.
   * En escritorio el copy vive a la izquierda, así que el rincón se va al
   * tercio derecho; en móvil el texto está anclado arriba y el rincón baja
   * al pie, más pequeño.
   */
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

  /* Entrada: el rincón entra girando hasta su ángulo base mientras crece,
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

  /* Lo único que corre por frame: el paralaje, que se
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
