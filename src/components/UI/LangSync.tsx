"use client";

import { useEffect } from "react";

export default function LangSync() {
  useEffect(() => {
    queueMicrotask(() => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("lang");
      } catch {
      }

      const lang =
        stored === "es" || stored === "en"
          ? stored
          : navigator.language?.toLowerCase().startsWith("es")
            ? "es"
            : "en";

      if (document.documentElement.lang !== lang) {
        document.documentElement.lang = lang;
      }
    });
  }, []);

  return null;
}
