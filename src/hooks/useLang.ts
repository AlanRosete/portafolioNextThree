"use client";

import { useEffect, useMemo, useState } from "react";
import { translate, type Lang, type Translated } from "@/i18n/dictionary";

/** Idioma que renderiza el SERVIDOR. Tiene que coincidir con el `lang` del
 *  <html> en `layout.tsx`, o el primer render del cliente no cuadraría. */
const SSR_LANG: Lang = "es";

function readLang(): Lang {
  if (typeof document === "undefined") return SSR_LANG;
  return document.documentElement.lang === "en" ? "en" : "es";
}

/**
 * Lee el idioma activo desde el atributo `lang` del <html> y se resuscribe a
 * sus cambios. Hermano exacto de `useTheme`, y por los mismos motivos.
 *
 * La fuente de verdad es el DOM —lo escribe el script inline de `layout.tsx`
 * antes del primer pintado—, no un estado de React. Eso es lo que conecta el
 * interruptor con cualquier componente: el interruptor no sabe quién le
 * escucha, sólo cambia el atributo, y quien necesita el valor lo observa.
 *
 * Se usa `lang` y no un `data-*` inventado porque es el atributo estándar:
 * lo leen los lectores de pantalla para elegir la voz, y el navegador para
 * la partición de sílabas y la traducción automática.
 */
export function useLang(): Lang {
  /**
   * Arranca SIEMPRE en el idioma del servidor, aunque el DOM ya diga otra cosa.
   *
   * Esto es lo que evita un error de hidratación: el servidor no puede saber
   * qué idioma eligió el visitante —está en su localStorage—, así que el HTML
   * llega siempre en español. Si el primer render del cliente leyera "en" del
   * DOM, los textos no coincidirían, React descartaría el árbol entero y de
   * paso se llevaría por delante el `data-theme` que el script inline había
   * puesto en el <html>: el sitio perdía el tema al recargar en inglés.
   *
   * El idioma real se aplica en el efecto de abajo, que corre inmediatamente
   * después de hidratar. Se ve un frame en español como mucho, y sólo para
   * quien haya elegido inglés.
   */
  const [lang, setLang] = useState<Lang>(SSR_LANG);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setLang(readLang());

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["lang"] });

    return () => observer.disconnect();
  }, []);

  return lang;
}

/**
 * El diccionario ya resuelto al idioma activo: `t.hero.greeting` es un string.
 *
 * El `useMemo` es lo que evita aplanar las ~60 claves en cada render; sólo
 * vuelve a correr cuando el idioma cambia de verdad.
 */
export function useTranslation(): { lang: Lang; t: Translated } {
  const lang = useLang();
  const t = useMemo(() => translate(lang), [lang]);
  return { lang, t };
}
