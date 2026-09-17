"use client";

import React from "react";
import { useTranslation } from "@/hooks/useLang";
import { CV_FILENAME, CV_PATH } from "@/i18n/dictionary";

// Descarga directa del CV en el idioma activo: un `<a download>`, sin ruta
// intermedia ni JavaScript que interceptar.
// `download` hace que el archivo llegue como "Alan-Rosete-CV-ES.pdf" y no
// con el path interno. Funciona porque el PDF se sirve desde el mismo
// origen; desde un CDN externo el atributo se ignora y se abre el visor.
export default function DownloadCvButton({
  className = "",
  style,
  tabIndex,
  onClick,
}: {
  className?: string;
  style?: React.CSSProperties;
  tabIndex?: number;
  onClick?: () => void;
}) {
  const { lang, t } = useTranslation();

  return (
    <a
      href={CV_PATH[lang]}
      download={CV_FILENAME[lang]}
      className={className}
      style={style}
      tabIndex={tabIndex}
      onClick={onClick}
    >
      {t.nav.downloadCv}
    </a>
  );
}
