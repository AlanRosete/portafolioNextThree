"use client";

import React from "react";
import { useTranslation } from "@/hooks/useLang";
import { CV_FILENAME, CV_PATH } from "@/i18n/dictionary";

/**
 * Descarga directa del CV en el idioma activo.
 *
 * Antes este botón navegaba a `/game`, una terminal animada: prometía un PDF
 * y entregaba otra cosa. Ahora es un `<a download>` y nada más — sin ruta
 * intermedia, sin JavaScript que interceptar.
 *
 * `download` con el nombre bonito hace que el archivo llegue como
 * "Alan-Rosete-CV-ES.pdf" y no con el path interno. Funciona porque el PDF
 * se sirve desde el MISMO origen que la página; con un CDN externo el
 * atributo se ignoraría y el navegador abriría el visor.
 */
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
