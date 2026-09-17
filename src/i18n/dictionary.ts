/**
 * Diccionario único del sitio.
 *
 * Un solo objeto y no un archivo por idioma: con ~60 claves, partirlo en dos
 * ficheros obliga a saltar entre ellos para comparar una traducción y hace
 * fácil que una clave exista en uno y falte en el otro. Aquí las dos versiones
 * viven en la misma línea y el tipo `Dict` obliga a que estén las dos.
 *
 * Las claves van agrupadas por sección y en plano (`hero.title`, no anidado):
 * el acceso es `t.hero.title` igualmente, pero el objeto se lee de arriba
 * abajo como un inventario de todo el texto visible del sitio.
 */

export type Lang = "es" | "en";

/** Cada entrada es la MISMA frase en los dos idiomas, nunca una sola. */
type Entry = Record<Lang, string>;

const dictionary = {
  nav: {
    home: { es: "Inicio", en: "Home" },
    projects: { es: "Proyectos", en: "Projects" },
    about: { es: "Sobre mí", en: "About Me" },
    contact: { es: "Contacto", en: "Contact" },
    downloadCv: { es: "Descargar CV", en: "Download CV" },
    openMenu: { es: "Abrir menú", en: "Open menu" },
    closeMenu: { es: "Cerrar menú", en: "Close menu" },
    goHome: { es: "Alan — ir al inicio", en: "Alan — go to top" },
  },

  loading: {
    label: { es: "Cargando", en: "Loading" },
    text: { es: "Cargando experiencia", en: "Loading experience" },
  },

  hero: {
    role: {
      es: "Desarrollador Frontend e Ingeniero Móvil",
      en: "Frontend Developer & Mobile Engineer",
    },
    greeting: { es: "Hola, soy", en: "Hi, I'm" },
    descPrefix: { es: "Creo experiencias web inmersivas con", en: "I build immersive web experiences with" },
    descJoin: { es: "y", en: "and" },
    viewProjects: { es: "Ver proyectos", en: "View projects" },
    contactMe: { es: "Contáctame", en: "Contact me" },
  },

  projects: {
    /** El del MENÚ, corto. El de la sección es `headTitle`. */
    title: { es: "Proyectos", en: "Projects" },
    headTitle: { es: "Mis proyectos", en: "My Projects" },
    headLead: {
      es: "Tres productos publicados. Elige uno para ver el detalle.",
      en: "Three shipped products. Pick one for the full write-up.",
    },
    live: { es: "Ver demo", en: "Live" },
    code: { es: "Código", en: "Code" },
    closeModal: { es: "Cerrar ventana", en: "Close modal" },
  },

  about: {
    title: { es: "Sobre mí", en: "About Me" },
    role: { es: "Desarrollador Frontend", en: "Frontend Developer" },
    bio1: {
      es: "Soy **Alan Rosete Mendoza**, desarrollador frontend con más de 3 años de experiencia construyendo aplicaciones web modernas y escalables. A lo largo de mi carrera he trabajado en proyectos para empresas como _Banco Azteca_, _Mexicode_ y _Holding HSI_, donde diseñé e implementé interfaces dinámicas con **React, TypeScript, JavaScript, Redux** y arquitecturas basadas en componentes. También tengo experiencia en integración de APIs, optimización de rendimiento, microfrontends, pruebas unitarias con Jest y despliegues en entornos Cloud.",
      en: "I'm **Alan Rosete Mendoza**, a frontend developer with over 3 years of experience building modern and scalable web applications. Throughout my career, I've worked on projects for companies such as _Banco Azteca_, _Mexicode_, and _Holding HSI_, where I designed and implemented dynamic interfaces using **React, TypeScript, JavaScript, Redux**, and component-based architecture patterns. I also have experience with API integration, performance optimization, microfrontends, unit testing with Jest, and deployments in Cloud environments.",
    },
    bio2: {
      es: "También desarrollo aplicaciones móviles con React Native (iOS / Android) y, cuando no estoy programando, me gusta explorar shaders de WebGL y optimización de rendimiento.",
      en: "I also build mobile apps with React Native (iOS / Android) and enjoy exploring WebGL shaders and performance optimizations when not coding.",
    },
    experience: { es: "Trayectoria", en: "Experience" },
    /** Cierre del rango del puesto actual. */
    present: { es: "hoy", en: "now" },
  },

  contact: {
    title: { es: "Contacto", en: "Contact" },
    intro: {
      es: "¿Tienes un proyecto en mente, una vacante que cubrir o simplemente quieres intercambiar ideas? Escríbeme.",
      en: "Have a project in mind, a role to fill, or just want to swap ideas? Drop me a line.",
    },
    emailLabel: { es: "Correo", en: "Email" },
    fieldName: { es: "Nombre", en: "Name" },
    fieldEmail: { es: "Correo", en: "Email" },
    fieldMessage: { es: "Mensaje", en: "Message" },
    placeholderMessage: {
      es: "Cuéntame sobre tu proyecto, plazos y presupuesto.",
      en: "Tell me about your project, timeline and budget.",
    },
    send: { es: "Enviar mensaje", en: "Send message" },
    sending: { es: "Enviando…", en: "Sending…" },
    sentTitle: { es: "Mensaje enviado", en: "Message sent" },
    sentBody: {
      es: "Mensaje enviado. Te respondo en un par de días.",
      en: "Message sent. I'll get back to you within a couple of days.",
    },
    sentNote: {
      es: "Te respondo en un par de días.",
      en: "I'll get back to you within a couple of days.",
    },
    errorTitle: { es: "No se pudo enviar el mensaje.", en: "Couldn't send the message." },
    errorName: { es: "Escribe tu nombre.", en: "Please enter your name." },
    errorEmail: { es: "Escribe un correo válido.", en: "Please enter a valid email address." },
    errorMessage: {
      es: "Cuéntame un poco más — al menos 10 caracteres.",
      en: "Tell me a bit more — at least 10 characters.",
    },
  },

  footer: {
    tagline: {
      es: "Construyendo experiencias digitales increíbles",
      en: "Building incredible digital experiences",
    },
    rights: { es: "Todos los derechos reservados.", en: "All rights reserved." },
  },

  langToggle: {
    /** El botón anuncia a qué idioma LLEVA, no en cuál está. */
    label: { es: "Switch to English", en: "Cambiar a español" },
  },
} satisfies Record<string, Record<string, Entry>>;

export type Dict = typeof dictionary;

/**
 * Aplana el diccionario al idioma pedido: `t.hero.title` devuelve ya el
 * string, no el par. Se memoiza en el hook, así que esto corre una vez por
 * cambio de idioma y no en cada render.
 */
export type Translated = {
  [S in keyof Dict]: { [K in keyof Dict[S]]: string };
};

export function translate(lang: Lang): Translated {
  const out = {} as Record<string, Record<string, string>>;
  for (const [section, entries] of Object.entries(dictionary)) {
    const resolved: Record<string, string> = {};
    for (const [key, entry] of Object.entries(entries)) {
      resolved[key] = (entry as Entry)[lang];
    }
    out[section] = resolved;
  }
  return out as Translated;
}

/** Ruta del CV por idioma. Basta con sustituir el PDF, no hay que tocar código. */
export const CV_PATH: Record<Lang, string> = {
  es: "/cv/alan-rosete-cv-es.pdf",
  en: "/cv/alan-rosete-cv-en.pdf",
};

/** Nombre con el que se guarda la descarga, para no exponer el path interno. */
export const CV_FILENAME: Record<Lang, string> = {
  es: "Alan-Rosete-CV-ES.pdf",
  en: "Alan-Rosete-CV-EN.pdf",
};
