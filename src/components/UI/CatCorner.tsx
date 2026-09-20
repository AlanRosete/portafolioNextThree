"use client";

import React from "react";

// Gato estirado, dormido sobre el borde superior del formulario.
//
// El tema no se resuelve en JavaScript: la silueta va en `currentColor` y
// el color lo pone `.cat-corner` desde `--color-text-primary`, que ya se
// invierte con el toggle. Sin `useTheme`, sin re-render, sin parpadeo.
// El ojo va recortado sobre la silueta, así que se pinta del color de lo
// que hay detrás —el fondo de la página, no la superficie del formulario.
//
// La proporción es lo que hace la pose: 260×74 de viewBox, es decir 3.5
// veces más ancho que alto. Un gato dormido tumbado es una forma LARGA y
// BAJA; en cuanto el cuerpo se compacta deja de leerse como gato estirado
// y pasa a ser un montículo con orejas.
//
// Geometría: la línea de apoyo es y=64 —el suelo donde descansan cuerpo,
// patas y cabeza—. La cola es lo único que baja de ahí, y aun así se
// queda dentro del viewBox. Nada se sale de [0, 260] en horizontal, así
// que el gato no desborda el formulario por los lados: solo sobresale
// hacia arriba, sobre el hueco que ya deja el grid de la sección.
export default function CatCorner() {
  return (
    <div className="cat-corner" aria-hidden="true">
      <svg viewBox="0 0 260 74" xmlns="http://www.w3.org/2000/svg">
        {/* Cola: nace en la grupa y dibuja una S abierta hacia la
            derecha —baja, cruza y remonta—. Va en trazo, no en relleno,
            porque a este tamaño una línea de grosor constante se lee más
            limpia que un contorno cerrado.
            La curva NO se cierra sobre sí misma: en cuanto la punta gira
            de vuelta hacia el cuerpo deja de leerse como cola y pasa a
            ser una caracola. */}
        <path
          d="M210,52
             C226,49 236,55 238,62
             C240,68 247,69 252,64"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cuerpo, cabeza y patas en una sola silueta cerrada.
            Orden del contorno: punta de las patas delanteras (izq) →
            frente y oreja izquierda → entrecejo → oreja derecha → nuca →
            el lomo, que sube en una loma suave y larga hasta la grupa →
            baja por el anca hasta el suelo → y la línea de apoyo, que
            cierra el path en recta sobre y=64. */}
        <path
          d="M14,64
             C8,64 4,61 4,57
             C4,53 8,50 14,50
             L34,50
             C32,45 32,39 35,34
             L31,18 L46,26
             C52,23 59,23 65,26
             L80,18 L76,34
             C79,38 81,43 81,48
             C88,44 96,40 106,37
             C130,29 160,27 186,33
             C204,37 214,44 216,53
             C217,59 213,64 206,64
             Z"
          fill="currentColor"
        />

        {/* Sin cara. A 190px de ancho la cabeza mide ~35px: cualquier
            rasgo ahí dentro —ojo, hocico, bigotes— deja de leerse como
            lo que es y se convierte en una mancha ambigua. La pose ya
            dice que el gato duerme; la silueta limpia es más minimalista
            que la silueta con detalle. */}
      </svg>
    </div>
  );
}
