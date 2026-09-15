"use client";

import { useEffect } from "react";

/**
 * Reaplica el idioma guardado DESPUÉS de la hidratación.
 *
 * El script inline de `layout.tsx` ya escribe `lang` antes del primer pintado
 * —eso es lo que evita el parpadeo—, pero React restaura los atributos que él
 * renderiza en cuanto hidrata, y devolvía el `<html>` a `lang="es"`. Resultado:
 * el interruptor funcionaba en caliente, pero el idioma se perdía al recargar.
 *
 * Este componente cierra ese hueco. No pinta nada y corre una sola vez: lee lo
 * guardado y lo vuelve a poner si React lo pisó. El cambio ocurre en el primer
 * efecto tras hidratar, así que no hay salto visible.
 *
 * Es el mismo motivo por el que el TEMA no necesita esto: vive en `data-theme`,
 * un atributo que React no renderiza y por tanto nunca restaura.
 */
export default function LangSync() {
  useEffect(() => {
    // En un microtask, no en el cuerpo del efecto: escribir `lang` aquí mismo
    // notifica al MutationObserver de `useLang` mientras React todavía está
    // hidratando otros componentes, y los que aún no han hidratado renderizan
    // con un idioma distinto al del HTML del servidor. Aplazarlo un tick deja
    // que el árbol entero termine de hidratar en español y luego cambia.
    queueMicrotask(() => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("lang");
      } catch {
        // Safari en navegación privada. Se queda el idioma del servidor.
      }

      const lang =
        stored === "es" || stored === "en"
          ? stored
          : navigator.language?.toLowerCase().startsWith("es")
            ? "es"
            : "en";

      if (document.documentElement.lang !== lang) {
        document.documentElement.lang = lang;
      }
    });
  }, []);

  return null;
}
