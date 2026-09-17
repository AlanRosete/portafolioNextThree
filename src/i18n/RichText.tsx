"use client";

import React from "react";

// Renderiza los `**negritas**` y `_cursivas_` de una cadena del diccionario.
// Con el énfasis como JSX el texto queda partido entre etiquetas y no se
// puede traducir: el énfasis no cae en el mismo sitio en los dos idiomas.
// Partidor deliberadamente simple —sin anidamiento, escapes ni enlaces—:
// cubre lo único que se usa.
export function RichText({ text }: { text: string }) {
  // Un solo split conserva los delimitadores en el array
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("_") && part.endsWith("_")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
