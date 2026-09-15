import { Project } from "@/hooks/useStore";
import type { Lang } from "@/i18n/dictionary";

/**
 * Los textos de cada proyecto viajan como par ES/EN dentro del propio dato,
 * no en el diccionario general: van pegados al proyecto que describen, así
 * que añadir uno nuevo es tocar UN sitio y no dos.
 *
 * `localizeProjects` los resuelve al idioma activo y devuelve el mismo
 * `Project` de siempre, de modo que ni las secciones ni el Modal saben que
 * esto es bilingüe.
 */
type Localized = Record<Lang, string>;

interface ProjectSource extends Omit<Project, "description" | "longDescription"> {
  description: Localized;
  longDescription: Localized;
}

const projectSources: ProjectSource[] = [
  {
    id: "project-1",
    title: "GeoWeather",
    description: {
      es: "App del clima con mapa interactivo y pronóstico global.",
      en: "Weather app with an interactive map and a global forecast.",
    },
    longDescription: {
      es: "Aplicación del clima que consulta datos de cualquier punto del planeta. Búsqueda de ciudades con autocompletado de Google Places, geolocalización del navegador y selección directa sobre un mapa de Google Maps. Muestra el día actual y el pronóstico extendido con gráficas de temperatura en Chart.js, además de humedad, viento y su dirección en grados, sensación térmica, y horarios de amanecer y atardecer. Incluye conmutador de unidades °C/°F, estado global con Context API y useReducer, y carga diferida de los recursos de cada condición climática.",
      en: "Weather application that pulls data from anywhere on the planet. City search with Google Places autocomplete, browser geolocation and direct selection on a Google Maps view. It shows the current day and the extended forecast with temperature charts in Chart.js, plus humidity, wind and its direction in degrees, feels-like temperature, and sunrise and sunset times. Includes a °C/°F unit switch, global state with Context API and useReducer, and lazy loading of the assets for each weather condition.",
    },
    tags: ["React", "Vite", "TailwindCSS", "Google Maps API", "Chart.js"],
    image: "/imgPortfolio/geoWeatherReact.png",
    liveUrl: "https://geo-weatherv1.netlify.app",
    repoUrl: "https://github.com/AlanRosete",
    color: "#f8f8f8",
  },
  {
    id: "project-2",
    title: "Minimalist Calendar",
    description: {
      es: "Calendario anual con estética minimalista y nevada animada.",
      en: "Full-year calendar with a minimalist look and animated snowfall.",
    },
    longDescription: {
      es: "Calendario que despliega los doce meses del año en una sola vista, construido con JavaScript vanilla sobre la librería js-year-calendar. El diseño parte de una paleta suave en azul pálido y rosa, tipografía Quicksand para el cuerpo y Dancing Script para los títulos, tarjetas por mes con sombras difusas y realce de fines de semana. Incluye un efecto de nevada generado por completo en JavaScript, donde cada copo recibe posición, tamaño, opacidad y duración aleatorias, animado con keyframes de CSS y aislado de la interacción del usuario.",
      en: "Calendar that lays out all twelve months of the year in a single view, built with vanilla JavaScript on top of the js-year-calendar library. The design starts from a soft palette of pale blue and pink, Quicksand for body text and Dancing Script for headings, per-month cards with diffuse shadows and highlighted weekends. It includes a snowfall effect generated entirely in JavaScript, where each flake gets a random position, size, opacity and duration, animated with CSS keyframes and isolated from user interaction.",
    },
    tags: ["JavaScript", "HTML5", "CSS3", "js-year-calendar", "CSS Animations"],
    image: "/imgPortfolio/minimalistCalendarReact.png",
    liveUrl: "https://minimalist-calendar.netlify.app",
    repoUrl: "https://github.com/AlanRosete",
    color: "#a8a7a8",
  },
  {
    id: "project-5",
    title: "Ecommerce Shoes",
    description: {
      es: "Tienda en línea con catálogo, filtros y carrito persistente.",
      en: "Online store with catalog, filters and a persistent cart.",
    },
    longDescription: {
      es: "E-commerce de moda urbana con catálogo dividido en calzado, bolsos y sombreros. Incluye filtrado por categoría y rango de precio, ordenamiento por destacados, alfabético y precio, carga progresiva del catálogo con IntersectionObserver, y ficha de producto con selección de talla, descuentos y sugerencias relacionadas. El carrito maneja cantidades, eliminación de artículos y cálculo de totales, y persiste en localStorage entre sesiones. Navegación con React Router, estado global mediante Context API y useReducer, notificaciones con React Toastify, y un backend serverless en Netlify Functions que sirve el catálogo.",
      en: "Urban fashion e-commerce with a catalog split into footwear, bags and hats. It includes filtering by category and price range, sorting by featured, alphabetical and price, progressive catalog loading with IntersectionObserver, and a product page with size selection, discounts and related suggestions. The cart handles quantities, item removal and total calculation, and persists in localStorage across sessions. Navigation with React Router, global state through Context API and useReducer, notifications with React Toastify, and a serverless backend on Netlify Functions serving the catalog.",
    },
    tags: ["React", "React Router", "TailwindCSS", "Netlify Functions", "Context API"],
    image: "/imgPortfolio/ecommerceReact.png",
    liveUrl: "https://ecommerce-test-react.netlify.app",
    repoUrl: "https://github.com/AlanRosete",
    color: "#6b7c70",
  },
];

/** Resuelve los pares al idioma activo. Barato: tres objetos por cambio. */
export function localizeProjects(lang: Lang): Project[] {
  return projectSources.map(({ description, longDescription, ...rest }) => ({
    ...rest,
    description: description[lang],
    longDescription: longDescription[lang],
  }));
}

export interface Skill {
  name: string;
  icon: string;
  color: string;
  category: string;
}

export const skills: Skill[] = [
  // Frontend
  { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", color: "#61DAFB", category: "Frontend" },
  { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg", color: "#ffffff", category: "Frontend" },
  { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg", color: "#3178C6", category: "Frontend" },
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg", color: "#F7DF1E", category: "Frontend" },
  { name: "Angular", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg", color: "#DD0031", category: "Frontend" },
  { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg", color: "#E34F26", category: "Frontend" },
  { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg", color: "#1572B6", category: "Frontend" },
  { name: "TailwindCSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg", color: "#06B6D4", category: "Frontend" },
  { name: "Sass", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sass/sass-original.svg", color: "#CC6699", category: "Frontend" },
  { name: "Redux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redux/redux-original.svg", color: "#764ABC", category: "Frontend" },
  // { name: "Three.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg", color: "#ffffff", category: "Frontend" },
  // { name: "GSAP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/greensock/greensock-original.svg", color: "#88CE02", category: "Frontend" },
  // Backend
  { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg", color: "#339933", category: "Backend" },
  { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg", color: "#FFCA28", category: "Backend" },
  { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg", color: "#47A248", category: "Backend" },
  { name: "SQL Server", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-original.svg", color: "#CC2927", category: "Backend" },
  { name: "AWS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", color: "#FF9900", category: "Backend" },
  { name: "C#", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg", color: "#239120", category: "Backend" },
  // Mobile
  // { name: "React Native", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", color: "#61DAFB", category: "Mobile" },
  // { name: "Android", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg", color: "#3DDC84", category: "Mobile" },
  // { name: "iOS / Swift", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swift/swift-original.svg", color: "#F05138", category: "Mobile" },
];

/**
 * El enlace guarda una CLAVE del diccionario, no la etiqueta: si guardara el
 * texto, cambiar de idioma no lo tocaría. De paso muere la errata "Proyects",
 * que llevaba meses en el menú.
 */
export const navLinks = [
  { key: "home", href: "#hero" },
  { key: "projects", href: "#projects" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
] as const;
