"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * Lee el tema activo desde `data-theme` del <html> y se resuscribe a sus
 * cambios. La fuente de verdad sigue siendo el DOM —lo escribe el script
 * inline de `layout.tsx` antes del primer pintado—, no un estado de React.
 *
 * El observer es lo que conecta el toggle con Three.js: el toggle no sabe
 * que la escena existe, solo cambia el atributo, y quien necesite el valor
 * lo observa. Sin esto, cambiar de tema no repintaría los materiales.
 *
 * El estado inicial se lee de forma síncrona. Es seguro porque los únicos
 * consumidores son componentes `ssr: false`, que nunca hidratan: no hay
 * HTML de servidor con el que discrepar.
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(readTheme());

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
