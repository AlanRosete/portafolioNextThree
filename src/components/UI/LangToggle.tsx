"use client";

import React from "react";
import { useLang } from "@/hooks/useLang";

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
