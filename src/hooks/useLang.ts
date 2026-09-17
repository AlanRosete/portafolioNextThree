"use client";

import { useEffect, useMemo, useState } from "react";
import { translate, type Lang, type Translated } from "@/i18n/dictionary";

// Idioma que renderiza el servidor. Tiene que coincidir con el `lang` del
// <html> en `layout.tsx` o el primer render del cliente no cuadra.
const SSR_LANG: Lang = "es";

function readLang(): Lang {
  if (typeof document === "undefined") return SSR_LANG;
  return document.documentElement.lang === "en" ? "en" : "es";
}

// Lee el idioma desde el atributo `lang` del <html> y se resuscribe a sus
// cambios. La fuente de verdad es el DOM, no un estado de React: el
// interruptor sólo cambia el atributo y quien necesita el valor lo observa.
// Se usa `lang` y no un `data-*` inventado porque es el atributo estándar:
// lo leen los lectores de pantalla para elegir voz y el navegador para la
// partición de sílabas y la traducción automática.
export function useLang(): Lang {
  // Arranca siempre en el idioma del servidor, aunque el DOM diga otra cosa.
  // El servidor no sabe qué idioma eligió el visitante —está en su
  // localStorage—, así que el HTML llega en español. Si el primer render
  // leyera "en" del DOM, React descartaría el árbol entero y se llevaría por
  // delante el `data-theme` que el script inline puso en el <html>.
  // El idioma real se aplica en el efecto de abajo, justo tras hidratar.
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

// El diccionario resuelto al idioma activo: `t.hero.greeting` es un string.
// El `useMemo` evita aplanar las claves en cada render.
export function useTranslation(): { lang: Lang; t: Translated } {
  const lang = useLang();
  const t = useMemo(() => translate(lang), [lang]);
  return { lang, t };
}
