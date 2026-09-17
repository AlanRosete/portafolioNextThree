"use client";

import React from "react";
import { useTranslation } from "@/hooks/useLang";
import { CV_FILENAME, CV_PATH } from "@/i18n/dictionary";

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
