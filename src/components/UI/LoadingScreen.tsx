"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useStore } from "@/hooks/useStore";

/* ═══════════════════════════════════════════════════
   PANTALLA DE CARGA — germinación

   Morph hoja → brote → planta, sobre las formas del CodePen de
   recursiveElk. Dos cosas se hacen distinto que en el original:

   1. No hay loop. Allí el timeline era `repeat:-1, yoyo:true` y la
      planta crecía y se rebobinaba sin decir nada. Aquí crece una vez,
      en paralelo a la barra, y se va.

   2. Las etapas ocurren de verdad. El original mandaba los siete tweens
      a la misma etiqueta ("morphIt"), incluidos dos sobre el mismo tallo,
      así que se pisaban y la hoja saltaba directo a planta. Aquí
      hoja→brote ocupa la primera mitad y brote→planta la segunda.

   Los estados destino son strings, no SVG ocultos: el CodePen apilaba
   tres <svg> con `visibility:hidden` solo para que MorphSVG les leyera
   el atributo `d`. MorphSVG acepta el path data en crudo, así que en el
   DOM quedan únicamente los tres paths que se ven. La condición para
   pasar strings es que ningún padre lleve transform —un selector se
   reencuadra, un string se interpreta tal cual—, y aquí ninguno lo lleva.

   Los `zm0 0` del final de los paths de la planta sí se quitaron:
   cerraban el contorno y abrían un subpath vacío detrás, y MorphSVG
   empareja subpath con subpath.
   ═══════════════════════════════════════════════════ */

/* Estado 1 — una hoja. Los dos "leaf" arrancan con la MISMA forma y
   superpuestos: por eso al principio se ve una sola. Se separan al crecer. */
const LEAF = `M201.38,88.422c113.12-12.44,149.88-84,150-84c1.856-3.567,6.252-4.953,9.819-3.097
c1.799,0.936,3.126,2.581,3.661,4.537c37.6,127.52,17.08,215.44-26.08,267.6c-16.709,20.331-38.11,36.296-62.36,46.52
c-22.339,9.474-46.587,13.584-70.8,12c-46.36-3.24-88.68-28-108.32-72.36c-5.032-11.34-8.284-23.388-9.64-35.72
c-2.743-24.717,2.083-49.685,13.84-71.6c12.622-23.385,32.719-41.863,57.08-52.48C172.173,93.833,186.611,89.988,201.38,88.422
L201.38,88.422z`;

const LEAF_STEM = `M350.58,7.102c0.099-4.019,3.437-7.198,7.456-7.099c4.019,0.099,7.198,3.437,7.099,7.456
c-0.007,0.296-0.033,0.59-0.076,0.883c0,0.36-6.36,84-88,168.64l-0.76,0.8c-19.18,19.673-40.226,37.436-62.84,53.04l49.04,9.12
c3.909,0.943,6.313,4.876,5.37,8.784c-0.854,3.538-4.189,5.902-7.81,5.536l-64-12c-58.36,36.96-157.28,71.08-165.92,151.6
c-0.535,3.985-4.199,6.782-8.184,6.247c-3.793-0.509-6.544-3.868-6.296-7.687c10.32-96.52,108.4-121.36,174.56-163.56l0.92-0.6
c26.403-16.71,50.861-36.311,72.92-58.44l-5.8-57.4c-0.535-3.985,2.262-7.649,6.247-8.184s7.649,2.262,8.184,6.247
c0.022,0.165,0.039,0.331,0.049,0.497l4.4,44.56C345.18,79.142,350.54,7.422,350.58,7.102L350.58,7.102z`;

const SAPLING_LEFT = `M188.864,67.349C147.819,26.325,67.499,21.568,10.667,21.568C4.776,21.568,0,26.344,0,32.235
c0,56.853,4.757,137.173,45.781,178.219c19.261,17.154,44.438,26.143,70.208,25.067c26.571,1.047,52.57-7.896,72.875-25.067
C219.435,179.861,225.045,103.531,188.864,67.349z`;

const SAPLING_RIGHT = `M459.136,63.765c-56.853,0-137.173,4.757-178.219,45.781c-36.267,36.267-30.571,112.491,0,143.083
c20.311,17.174,46.318,26.117,72.896,25.067c25.769,1.074,50.946-7.915,70.208-25.067c41.045-41.045,45.781-121.365,45.781-178.219
C469.791,68.528,465.019,63.765,459.136,63.765z`;

const SAPLING_STEM = `M224,448.235c-5.891,0-10.667-4.776-10.667-10.667c0-226.24-82.965-283.008-114.197-304.363
c-3.767-2.405-7.334-5.109-10.667-8.085c-4.093-4.237-3.975-10.99,0.262-15.083c4.134-3.993,10.687-3.993,14.821,0
c2.409,2.037,4.961,3.898,7.637,5.568c27.733,18.965,93.056,63.659,115.648,210.261c17.459-76.645,69.213-140.995,140.331-174.485
c5.446-2.562,11.946-0.51,14.933,4.715c2.698,4.755,1.032,10.796-3.723,13.495c-0.178,0.101-0.36,0.197-0.544,0.287l-1.728,0.811
c-116.949,54.976-141.504,175.467-141.504,266.88C234.603,443.434,229.866,448.199,224,448.235z`;

const PLANT_LEAF_LEFT = `m119.492188 106.050781-52.933594-17.597656c-2.734375-.914063-5.75-.285156-7.894532 1.644531-2.140624 1.933594-3.078124 4.867188-2.449218 7.683594l8.800781 39.695312c14.089844 64.769532 71.570313 110.851563 137.855469 110.527344h5.160156c4.417969 0 8-3.582031 8-8 .050781-60.789062-38.855469-114.769531-96.539062-133.953125z`;

const PLANT_LEAF_RIGHT = `m307.78125 67.753906-3.75-60.246094c-.238281-3.789062-3.105469-6.890624-6.867188-7.4257808-3.75-.5000002-7.347656 1.6757808-8.644531 5.2343748l-25.875 72.414063c-9.675781 27.050781-14.621093 55.566406-14.613281 84.296875v21.976562c0 3.234375 1.949219 6.152344 4.9375 7.390625 2.988281 1.234375 6.429688.550781 8.71875-1.734375 32.132812-32.144531 48.921875-76.539062 46.09375-121.90625z`;

const PLANT_STEM = `m474.671875 232.453125-66.554687-23.289063c-26.558594-9.296874-55.746094-7.433593-80.910157 5.160157-25.160156 12.597656-44.144531 34.847656-52.617187 61.679687l-17.414063 55.144532-17.144531 12.855468v-115.160156c-.019531-15.347656 7.65625-29.6875 20.4375-38.183594l-8.878906-13.3125c-17.234375 11.464844-27.582032 30.796875-27.558594 51.496094v15.847656l-10.34375-10.34375-11.3125 11.3125 21.65625 21.65625v175.742188l-16-8v-16.457032c-.003906-40.242187-19.351562-78.035156-52-101.566406-32.652344-23.527344-74.621094-29.929687-112.800781-17.199218l-37.726563 12.574218c-3.285156 1.082032-5.503906 4.144532-5.503906 7.601563s2.21875 6.519531 5.503906 7.601562l8.566406 2.855469c41.0625 13.652344 79.378907 34.488281 113.160157 61.535156l67.800781 54.238282c.457031.320312.953125.589843 1.472656.800781l-.050781.105469 27.578125 13.800781v19.054687h16v-116l28.796875-21.601562-.085937-.109375c.328124-.191407.644531-.402344.945312-.632813 50.660156-50.496094 116.636719-82.765625 187.597656-91.753906l15.738282-1.964844c3.683593-.464844 6.5625-3.402344 6.957031-7.09375s-1.804688-7.167968-5.308594-8.394531z`;

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useStore();

  useEffect(() => {
    // `type: "rotational"` interpola girando los puntos en vez de
    // arrastrarlos en línea recta: en formas orgánicas es la diferencia
    // entre una hoja que se abre y una mancha que se retuerce.
    const morphTo = (shape: string) => ({
      morphSVG: { shape, type: "rotational" as const },
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    /* El morph corre en paralelo a la barra: la planta termina de crecer
       justo cuando la barra llena.

       Estas duraciones NO se acortan. El 2026-08-24 se probó la mitad
       —morph en 0.96s, barra en 1.1s, 2.2s en total— y se revirtió: el hero
       3D no llega a tiempo y la jardinera de cactus asoma a medio renderizar
       en cuanto el loader se va. Ese pop se ve peor que la espera.

       Y acortar tampoco arreglaba los tirones, que era la idea: el frame
       medio no se movió (52ms contra 54.8ms a 6x de throttling). El morph
       nunca fue el coste —70ms de JS, 4% del hilo— sino Three.js compilando
       870KB debajo. La espera es el precio de que el hero entre entero. */
    tl.to(".js-leaf-a", { ...morphTo(SAPLING_LEFT), duration: 0.9 }, 0)
      .to(".js-leaf-b", { ...morphTo(SAPLING_RIGHT), duration: 0.9 }, 0)
      .to(".js-stem", { ...morphTo(SAPLING_STEM), duration: 0.9 }, 0)
      .to(".js-leaf-a", { ...morphTo(PLANT_LEAF_LEFT), duration: 0.95 }, 0.95)
      .to(".js-leaf-b", { ...morphTo(PLANT_LEAF_RIGHT), duration: 0.95 }, 0.95)
      .to(".js-stem", { ...morphTo(PLANT_STEM), duration: 0.95 }, 0.95)
      .to(".loading-progress", { width: "100%", duration: 2, ease: "power2.inOut" }, 0)
      .to(".loading-text", { opacity: 0, y: -20, duration: 0.3 })
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => setLoading(false),
      });

    return () => {
      tl.kill();
    };
  }, [setLoading]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "var(--color-bg-primary)" }}
    >
      {/* Germinación. El tema entra por los tokens, igual que el resto del
          sitio: el toggle cambia `data-theme` en <html> y estos `var()` se
          reevalúan solos. Los verdes saturados del CodePen (#45B549,
          #4CAF50, #3d7606) se quedaron fuera a propósito — masa apagada y
          detalle claro, la misma jerarquía por luminancia que el hero. */}
      <div className="loading-text mb-8!" role="status" aria-label="Cargando">
        {/* El disco es el `.circle` del CodePen, pero en tono de superficie
            del sitio en vez de rosa fijo: la maceta contra la que se lee la
            planta. `overflow: visible` porque los paths de la planta adulta
            se salen del viewBox. */}
        <div
          style={{
            display: "grid",
            placeItems: "center",
            height: "clamp(104px, 30vw, 148px)",
            width: "clamp(104px, 30vw, 148px)",
            borderRadius: "50%",
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-line)",
          }}
        >
          <svg
            viewBox="0 0 480 480"
            style={{ height: "44%", width: "44%", overflow: "visible" }}
            aria-hidden="true"
          >
            <path className="js-leaf-a" d={LEAF} fill="var(--color-accent-tertiary)" />
            <path className="js-leaf-b" d={LEAF} fill="var(--color-accent-primary)" />
            {/* El tallo se mezcla hacia el color de texto: así contrasta más
                que las hojas en los DOS temas, sin un token nuevo. */}
            <path
              className="js-stem"
              d={LEAF_STEM}
              fill="color-mix(in srgb, var(--color-accent-tertiary) 78%, var(--color-text-primary))"
            />
          </svg>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="loading-text w-40 sm:w-48 h-px overflow-hidden" style={{ background: "var(--color-line)" }}>
        <div
          className="loading-progress h-full"
          style={{
            width: "0%",
            background: "var(--color-accent-primary)",
          }}
        />
      </div>

      {/* Loading Text */}
      <p className="loading-text text-text-muted text-xs sm:text-sm mt-4! tracking-widest uppercase">
        Cargando experiencia
      </p>
    </div>
  );
}
