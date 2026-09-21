#!/usr/bin/env node
/**
 * Elimina los comentarios del codigo fuente para la rama de produccion.
 *
 * Uso:  node scripts/strip-comments.mjs [directorio]
 *
 * El directorio por defecto es el del repo. Pensado para correrse sobre un
 * worktree temporal, no sobre el arbol de trabajo: en dev los comentarios
 * son el material que documenta las decisiones y no deben perderse.
 *
 * No usa expresiones regulares para encontrar los comentarios. Un patron
 * como /\/\/.*$/ se come la barra doble de "https://..." y el cuerpo de una
 * expresion regular literal, y deja el archivo sin compilar. En su lugar
 * recorre el texto con una maquina de estados que sabe si esta dentro de una
 * cadena, un template literal o una regex, y solo borra en codigo real.
 *
 * Se conservan las directivas del compilador y del linter (eslint-disable,
 * ts-ignore, prettier-ignore, source maps) y las licencias /*! ... *\/.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, extname } from "node:path";

const PRESERVE = /^\s*(eslint-|@ts-|prettier-ignore|jsx |jsxImportSource|#__PURE__|@license|@preserve|sourceMappingURL|sourceURL|global |globals |exported |glsl\s*$|wgsl\s*$|html\s*$|css\s*$|sql\s*$|graphql\s*$)/;

const isDirective = (body, bang) =>
  bang || PRESERVE.test(body.replace(/^[/*\s]+/, ""));

/** Comentarios de JavaScript / TypeScript, respetando strings y regex. */
function stripJs(src) {
  let out = "";
  let i = 0;
  // Lo ultimo que se emitio decide si una '/' abre una regex o es division.
  let prev = "";

  const canBeRegex = () => {
    const t = prev.trimEnd();
    if (!t) return true;
    const c = t[t.length - 1];
    if ("+-*/%&|^!~=<>?:;,({[".includes(c)) return true;
    return /\b(return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/.test(t);
  };

  while (i < src.length) {
    const c = src[i];
    const d = src[i + 1];

    if (c === "/" && d === "/") {
      let j = i + 2;
      while (j < src.length && src[j] !== "\n") j++;
      const body = src.slice(i + 2, j);
      if (isDirective(body, false)) {
        out += src.slice(i, j);
        prev += src.slice(i, j);
      } else {
        // Si solo queda espacio antes del comentario, la linea entera sobra.
        const lineStart = out.lastIndexOf("\n") + 1;
        if (out.slice(lineStart).trim() === "") {
          out = out.slice(0, lineStart);
          if (src[j] === "\n") j++;
        } else {
          out = out.replace(/[ \t]+$/, "");
        }
      }
      i = j;
      continue;
    }

    if (c === "/" && d === "*") {
      let j = i + 2;
      while (j < src.length && !(src[j] === "*" && src[j + 1] === "/")) j++;
      j = Math.min(j + 2, src.length);
      const bang = src[i + 2] === "!";
      const body = src.slice(i + 2, j - 2);
      if (isDirective(body, bang)) {
        out += src.slice(i, j);
        prev += src.slice(i, j);
      } else {
        const lineStart = out.lastIndexOf("\n") + 1;
        const soloEnLinea =
          out.slice(lineStart).trim() === "" &&
          /^[ \t]*(\n|$)/.test(src.slice(j));
        if (soloEnLinea) {
          out = out.slice(0, lineStart);
          let k = j;
          while (k < src.length && (src[k] === " " || src[k] === "\t")) k++;
          if (src[k] === "\n") k++;
          j = k;
        } else {
          out = out.replace(/[ \t]+$/, "");
        }
      }
      i = j;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === c) { j++; break; }
        // ${...} de un template puede anidar comillas y llaves.
        if (c === "`" && src[j] === "$" && src[j + 1] === "{") {
          let depth = 1;
          j += 2;
          while (j < src.length && depth > 0) {
            if (src[j] === "{") depth++;
            else if (src[j] === "}") depth--;
            else if (src[j] === '"' || src[j] === "'" || src[j] === "`") {
              const q = src[j++];
              while (j < src.length && src[j] !== q) {
                if (src[j] === "\\") j++;
                j++;
              }
            }
            j++;
          }
          continue;
        }
        j++;
      }
      const chunk = src.slice(i, j);
      out += chunk;
      prev += chunk;
      i = j;
      continue;
    }

    if (c === "/" && canBeRegex()) {
      let j = i + 1;
      let klass = false;
      let ok = false;
      while (j < src.length) {
        const ch = src[j];
        if (ch === "\\") { j += 2; continue; }
        if (ch === "\n") break;
        if (ch === "[") klass = true;
        else if (ch === "]") klass = false;
        else if (ch === "/" && !klass) { j++; ok = true; break; }
        j++;
      }
      if (ok) {
        while (j < src.length && /[dgimsuvy]/.test(src[j])) j++;
        const chunk = src.slice(i, j);
        out += chunk;
        prev += chunk;
        i = j;
        continue;
      }
    }

    out += c;
    prev += c;
    i++;
  }

  return out;
}

/**
 * Comentarios dentro de un shader escrito en un template literal.
 *
 * El contenido de `/* glsl *\/ ` ... ` ` es codigo GLSL, no JavaScript, asi que
 * el recorrido principal lo trata como cadena y no lo toca. GLSL usa la misma
 * sintaxis de comentarios que C, y aqui no hay regex ni cadenas que proteger,
 * pero si `${...}`: lo que va dentro vuelve a ser JavaScript y se deja igual.
 */
function stripShaders(src) {
  return src.replace(
    /(\/\* (?:glsl|wgsl) \*\/\s*`)([\s\S]*?)(`)/g,
    (_m, open, body, close) => {
      const clean = body
        .split("\n")
        .map((line) => {
          if (line.includes("${")) return line;
          const i = line.indexOf("//");
          return i === -1 ? line : line.slice(0, i).replace(/\s+$/, "");
        })
        .filter((line, idx, arr) => {
          if (line.trim() !== "") return true;
          return idx > 0 && arr[idx - 1].trim() !== "";
        })
        .join("\n");
      return open + clean + close;
    }
  );
}

/** Comentarios de CSS. Solo existe /* ... *\/ y no hay regex que proteger. */
function stripCss(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === c) { j++; break; }
        j++;
      }
      out += src.slice(i, j);
      i = j;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      let j = i + 2;
      while (j < src.length && !(src[j] === "*" && src[j + 1] === "/")) j++;
      j = Math.min(j + 2, src.length);
      if (src[i + 2] === "!") {
        out += src.slice(i, j);
        i = j;
        continue;
      }
      const lineStart = out.lastIndexOf("\n") + 1;
      if (out.slice(lineStart).trim() === "" && /^[ \t]*(\n|$)/.test(src.slice(j))) {
        out = out.slice(0, lineStart);
        let k = j;
        while (k < src.length && (src[k] === " " || src[k] === "\t")) k++;
        if (src[k] === "\n") k++;
        j = k;
      } else {
        out = out.replace(/[ \t]+$/, "");
      }
      i = j;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

const root = process.argv[2] ?? process.cwd();

const files = execFileSync(
  "git",
  ["-C", root, "ls-files", "src", "scripts"],
  { encoding: "utf8" }
)
  .split("\n")
  .filter((f) => /\.(ts|tsx|mjs|js|jsx|css)$/.test(f))
  .filter((f) => !f.endsWith("strip-comments.mjs"));

let changed = 0;
for (const rel of files) {
  const abs = join(root, rel);
  const src = readFileSync(abs, "utf8");
  const out =
    extname(rel) === ".css" ? stripCss(src) : stripJs(stripShaders(src));
  // Deja una sola linea en blanco donde el borrado dejo varias.
  const tidy = out.replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");
  if (tidy !== src) {
    writeFileSync(abs, tidy);
    changed++;
    const n = src.split("\n").length - tidy.split("\n").length;
    console.log(`  ${rel} (-${n} lineas)`);
  }
}
console.log(`\n${changed} archivos limpiados de ${files.length}.`);
