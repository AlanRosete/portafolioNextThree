"use client";

import React from "react";
import { useLang } from "@/hooks/useLang";

/**
 * Interruptor de idioma. Hermano de `ThemeToggle`: misma caja, mismo borde,
 * mismo hover.
 *
 * A diferencia del de tema, este SÍ lee el idioma con un hook, porque la
 * etiqueta del botón es texto ("ES" / "EN") y no un icono que el CSS pueda
 * intercambiar. El markup del servidor sale siempre en "ES" —igual que el
 * `lang="es"` del <html>— y el script inline ya ha corregido el atributo
 * antes de que React hidrate, así que el ajuste ocurre en el mismo tick que
 * la hidratación y no se ve un salto.
 *
 * Muestra el idioma ACTIVO, no al que lleva: es lo que hace todo el mundo
 * (Wikipedia, Airbnb) y evita la duda de "¿esto dice en qué estoy o a dónde
 * voy?". La dirección va en el `aria-label`, que sí la necesita explícita.
 */
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
      // Safari en navegación privada lanza al escribir. El idioma igual
      // cambia en esta sesión; solo se pierde la persistencia.
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
