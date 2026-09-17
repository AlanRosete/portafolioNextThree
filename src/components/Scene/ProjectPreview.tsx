"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Canvas, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import type { Project } from "@/hooks/useStore";

/* Un solo plano, sin luces ni OrbitControls: la escena solo muestra la
   captura del proyecto activo y se deforma al cambiar de uno a otro.
   No llevar controles es deliberado: los OrbitControls de three ponen
   `touch-action: none` en su elemento y eso convierte el bloque en un muro
   para el scroll táctil. */

/* El pliegue es una gaussiana que cruza el plano hundiéndose (−z): hacia
   la cámara el plano se agranda por perspectiva y se saldría del encuadre,
   y una onda con rebote leería como efecto de demo. */
const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uAmplitude;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    const float PI = 3.141592653589793;

    // Campana: 0 en los extremos, así el plano empieza y acaba plano.
    float bell = sin(uProgress * PI);

    // Los cuatro bordes clavados en z = 0: sin esto la onda hunde también
    // las esquinas, el plano se encoge por perspectiva en esa columna y se
    // ve un pellizco contra el marco.
    float pin = sin(uv.x * PI) * sin(uv.y * PI);

    // Distancia al frente de onda, que viaja con uProgress.
    float d = uv.x - uProgress;
    float dent = exp(-d * d * 30.0);

    vec3 p = position;
    p.z -= dent * pin * uAmplitude * bell;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

/* El corte va por delante del pliegue: la captura nueva asoma por donde la
   onda acaba de pasar, no por el centro. */
const fragmentShader = /* glsl */ `
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    float front = uProgress * 1.24 - 0.12;
    float m = smoothstep(front - 0.16, front + 0.16, vUv.x);

    gl_FragColor = mix(texture2D(uTo, vUv), texture2D(uFrom, vUv), m);

    // ShaderMaterial no aplica el espacio de color de salida por su cuenta;
    // las texturas sí se muestrean en lineal por su SRGBColorSpace.
    #include <colorspace_fragment>
  }
`;

function Slide({ images, index }: { images: string[]; index: number }) {
  const textures = useTexture(images);
  const { viewport, invalidate, gl } = useThree();
  const shown = useRef(index);

  // Las uniforms se crean una vez: el material vive lo que vive la sección
  // y las transiciones solo mutan sus valores.
  const uniforms = useMemo(
    () => ({
      uFrom: { value: textures[index] },
      uTo: { value: textures[index] },
      uProgress: { value: 1 },
      uAmplitude: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const maxAnisotropy = useMemo(
    () => gl.capabilities.getMaxAnisotropy(),
    [gl]
  );

  useEffect(() => {
    // Capturas de ~1900px vistas a menos de la mitad: los mipmaps se quedan
    // o el texto de la interfaz cintila.
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAnisotropy;
      t.needsUpdate = true;
    });
    invalidate();
  }, [textures, invalidate, maxAnisotropy]);

  // La amplitud se deriva del ancho visible para que el pliegue se vea
  // igual de hondo en un portátil y en un monitor grande.
  useEffect(() => {
    uniforms.uAmplitude.value = viewport.width * 0.06;
    invalidate();
  }, [viewport.width, uniforms, invalidate]);

  useEffect(() => {
    if (index === shown.current) return;

    uniforms.uFrom.value = textures[shown.current];
    uniforms.uTo.value = textures[index];
    shown.current = index;

    const tween = gsap.fromTo(
      uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 0.85,
        ease: "power2.inOut",
        overwrite: true,
        // frameloop="demand": sin esto el canvas no vuelve a dibujarse.
        onUpdate: invalidate,
      }
    );

    return () => {
      tween.kill();
    };
  }, [index, textures, uniforms, invalidate]);

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height, 64, 36]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ProjectPreview({
  projects,
  index,
}: {
  projects: Project[];
  index: number;
}) {
  /* En el inicializador y no en un efecto: el componente carga con
     `ssr: false`, así que aquí siempre hay `document` y no hay hidratación
     que desincronizar. */
  const [webglSupported] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  });

  const images = useMemo(() => projects.map((p) => p.image), [projects]);
  const active = projects[index];

  // Sin WebGL la sección no pierde nada: la captura es la captura.
  if (!webglSupported) {
    return (
      <Image
        src={active.image}
        alt={active.title}
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover"
      />
    );
  }

  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0, 3], fov: 40, near: 0.1, far: 20 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Slide images={images} index={index} />
      </Suspense>
    </Canvas>
  );
}
