"use client";

import React from "react";

/**
 * Interruptor de tema.
 *
 * No tiene estado de React a propósito. La fuente de verdad es el atributo
 * `data-theme` del <html>, que el script inline de `layout.tsx` ya escribió
 * antes del primer pintado. Qué icono se ve lo decide el CSS, no JavaScript.
 *
 * Eso evita el problema clásico de este componente: si el icono dependiera de
 * un `useState`, el servidor renderizaría siempre el del tema por defecto y el
 * cliente lo corregiría tras hidratar — hydration mismatch y un parpadeo del
 * icono. Aquí el markup es idéntico en servidor y cliente en ambos temas.
 */
export default function ThemeToggle({
  className = "",
  tabIndex,
}: {
  className?: string;
  /** El menú móvil lo saca del orden de tabulación mientras está cerrado. */
  tabIndex?: number;
}) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Safari en navegación privada lanza al escribir. El tema igual cambia
      // en esta sesión; solo se pierde la persistencia.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      tabIndex={tabIndex}
      className={`theme-toggle ${className}`}
      // Etiqueta estática: es correcta en ambos temas y no depende de estado,
      // que es lo que mantiene servidor y cliente idénticos.
      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      {/* En oscuro se ve el sol: el icono anuncia la acción, no el estado. */}
      <svg
        className="theme-toggle__sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.25" />
        <path d="M12 2.75v2M12 19.25v2M21.25 12h-2M4.75 12h-2M18.54 5.46l-1.42 1.42M6.88 17.12l-1.42 1.42M18.54 18.54l-1.42-1.42M6.88 6.88L5.46 5.46" />
      </svg>

      <svg
        className="theme-toggle__moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.8A8.75 8.75 0 0 1 9.2 3.5a8.75 8.75 0 1 0 11.3 11.3z" />
      </svg>
    </button>
  );
}
