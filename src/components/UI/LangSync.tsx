"use client";

import { useEffect } from "react";

// Reaplica el idioma guardado después de la hidratación: el script inline
// escribe `lang` antes del primer pintado, pero React restaura los atributos
// que él renderiza y devuelve el <html> a `lang="es"`.
// No pinta nada y corre una vez, en el primer efecto tras hidratar.
// El tema no necesita esto porque vive en `data-theme`, que React no
// renderiza y por tanto nunca restaura.
export default function LangSync() {
  useEffect(() => {
    // En un microtask, no en el cuerpo del efecto: escribir `lang` aquí
    // notifica al MutationObserver de `useLang` mientras React sigue
    // hidratando, y los componentes pendientes renderizarían con un idioma
    // distinto al del HTML del servidor.
    queueMicrotask(() => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("lang");
      } catch {
        // Safari en navegación privada: se queda el idioma del servidor.
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
