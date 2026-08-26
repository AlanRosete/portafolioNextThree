"use client";

import React from "react";

/**
 * Gato derretido en la esquina superior derecha del formulario: la panza
 * apoyada plana contra el borde de arriba y una pata estirada que se
 * escurre por el lateral derecho.
 *
 * El tema no se resuelve en JavaScript: la silueta va en `currentColor`
 * y el color lo pone `.cat-corner` desde `--color-text-primary`, que ya
 * se invierte con el toggle. En oscuro el token es #f8f8f8 (gato claro)
 * y en claro #1a1a1a (gato oscuro) — sin `useTheme`, sin re-render y sin
 * el parpadeo de un estado que llega tarde.
 *
 * El ojo es la excepción: al ir "recortado" sobre la silueta tiene que
 * pintarse del color de lo que hay detrás. La cabeza queda por encima del
 * borde del formulario, así que lo de detrás es el fondo de la página.
 *
 * Geometría: la esquina del formulario vive en (150, 64) del viewBox. El
 * tramo de cierre (150,64 → 18,64) ES la panza apoyada, y todo lo que hay
 * a la derecha de x=150 o por debajo de y=64 es lo que cuelga fuera. El
 * CSS alinea ese punto con la esquina real — ver `.cat-corner`.
 */
export default function CatCorner() {
  return (
    <div className="cat-corner" aria-hidden="true">
      <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
        {/* Cola: trazo aparte para poder animarla sin tocar la silueta. */}
        <path
          className="cat-corner__tail"
          d="M20,46 C7,44 1,33 8,25 C13,19 21,21 23,28"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Cuerpo, cabeza y pata escurrida en una sola silueta.
            Orden del contorno: ancas (izq) → lomo → orejas → hocico →
            pecho → la pata cayendo POR FUERA del canto derecho → vuelta
            hacia la esquina → la panza, que cierra el path en recta.

            El borde interno de la pata sale de la esquina (150,64) y se
            abre hasta x≈156 al bajar: arriba toca el canto del formulario
            —de ahí "colgada de la esquina"— y el resto queda entero fuera,
            contra el fondo de la página. */}
        <path
          d="M18,64
             C12,57 12,46 18,40
             C24,33 34,30 46,30
             C60,30 72,33 84,33
             C94,33 100,30 104,26
             C106,24 108,22 110,21
             L113,6 L123,16
             C127,19 132,19 136,17
             L141,3 L148,18
             C152,25 154,33 153,42
             C152,47 149,51 145,54
             C147,57 156,59 164,64
             C174,69 181,78 180,89
             C179,101 176,112 173,121
             C171,127 163,130 158,126
             C154,123 155,115 156,107
             C157,95 157,80 153,71
             L150,64
             Z"
          fill="currentColor"
        />

        {/* Ojo cerrado. */}
        <path
          className="cat-corner__eye"
          d="M133,37 Q138,32 143,37"
          fill="none"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
