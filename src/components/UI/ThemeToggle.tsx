"use client";

import React from "react";

export default function ThemeToggle({
  className = "",
  tabIndex,
}: {
  className?: string;

  tabIndex?: number;
}) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      tabIndex={tabIndex}
      className={`theme-toggle ${className}`}

      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      {}
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
