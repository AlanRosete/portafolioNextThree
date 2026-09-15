"use client";

import React from "react";

/**
 * Renderiza los `**negritas**` y `_cursivas_` de una cadena del diccionario.
 *
 * La bio del About llevaba el énfasis como JSX (`<strong>`, `<em>`) incrustado
 * en el párrafo. Eso no se puede traducir: el texto quedaba partido en trozos
 * sueltos entre etiquetas, y en inglés y español el énfasis no cae en el mismo
 * sitio ni en el mismo orden.
 *
 * Con el marcado DENTRO de la cadena, cada idioma decide dónde va su énfasis y
 * la traducción se lee entera de un vistazo en el diccionario.
 *
 * Es un partidor deliberadamente tonto —sin anidamiento, sin escapes, sin
 * enlaces—: cubre lo único que se usa. Meter una librería de Markdown para
 * dos párrafos sería justo el tipo de andamiaje desproporcionado que sobra.
 */
export function RichText({ text }: { text: string }) {
  // Un solo paso de split conserva los delimitadores en el array
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
