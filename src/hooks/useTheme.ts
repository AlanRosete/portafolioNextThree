"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

// Lee el tema desde `data-theme` del <html>. La fuente de verdad es el DOM
// —lo escribe el script inline de `layout.tsx` antes del primer pintado—,
// no un estado de React.
// El observer conecta el toggle con Three.js sin que el toggle sepa que la
// escena existe. Sin esto, cambiar de tema no repinta los materiales.
// El estado inicial se lee síncrono: los consumidores son `ssr: false` y
// nunca hidratan, así que no hay HTML de servidor con el que discrepar.
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
