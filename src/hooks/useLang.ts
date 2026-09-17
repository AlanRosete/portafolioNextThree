"use client";

import { useEffect, useMemo, useState } from "react";
import { translate, type Lang, type Translated } from "@/i18n/dictionary";

const SSR_LANG: Lang = "es";

function readLang(): Lang {
  if (typeof document === "undefined") return SSR_LANG;
  return document.documentElement.lang === "en" ? "en" : "es";
}

export function useLang(): Lang {
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

export function useTranslation(): { lang: Lang; t: Translated } {
  const lang = useLang();
  const t = useMemo(() => translate(lang), [lang]);
  return { lang, t };
}
