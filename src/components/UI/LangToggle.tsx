"use client";

import React from "react";
import { useLang } from "@/hooks/useLang";

// A diferencia del de tema, este lee el idioma con un hook, porque la
// etiqueta es texto ("ES"/"EN") y no un icono que el CSS pueda intercambiar.
// El markup del servidor sale siempre en "ES" y el script inline ya corrigió
// el atributo antes de hidratar, así que el ajuste va en el mismo tick.
// Muestra el idioma activo, no al que lleva; la dirección va en el
// `aria-label`, que sí la necesita explícita.
export default function LangToggle({
  className = "",
  tabIndex,
}: {
  className?: string;
  tabIndex?: number;
}) {
  const lang = useLang();

  const toggle = () => {
    const root = document.documentElement;
    const next = root.lang === "en" ? "es" : "en";
    root.lang = next;
    try {
      localStorage.setItem("lang", next);
    } catch {
      // Safari en navegación privada lanza al escribir: el idioma cambia en
      // esta sesión, solo se pierde la persistencia.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`lang-toggle ${className}`}
      tabIndex={tabIndex}
      aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}
    >
      {lang === "en" ? "EN" : "ES"}
    </button>
  );
}
