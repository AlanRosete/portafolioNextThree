import { Project } from "@/hooks/useStore";
import type { Lang } from "@/i18n/dictionary";

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
    image: "/imgPortfolio/geoWeatherReact.webp",
    liveUrl: "https://geo-weatherv1.netlify.app",
    repoUrl: "https://github.com/AlanRosete/GeoWeather",
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
    image: "/imgPortfolio/minimalistCalendarReact.webp",
    liveUrl: "https://minimalist-calendar.netlify.app",
    repoUrl: "https://github.com/AlanRosete/calendar_minimalist",
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
    image: "/imgPortfolio/ecommerceReact.webp",
    liveUrl: "https://ecommerce-test-react.netlify.app",
    repoUrl: "https://github.com/AlanRosete/ecommerce_React_Dev",
    color: "#6b7c70",
  },
];

export function localizeProjects(lang: Lang): Project[] {
  return projectSources.map(({ description, longDescription, ...rest }) => ({
    ...rest,
    description: description[lang],
    longDescription: longDescription[lang],
  }));
}

export interface Role {
  company: string;
  from: string;
  to: string;
  current?: boolean;
  title: Record<"es" | "en", string>;
  impact: Record<"es" | "en", string>;
  stack: string[];
}

export const roles: Role[] = [
  {
    company: "Banco Azteca",
    from: "2024",
    to: "",
    current: true,
    title: {
      es: "Desarrollador React",
      en: "React Developer",
    },
    impact: {
      es: "Microfrontends con Single-SPA para Captación, Inversiones y Nómina. Cobertura de pruebas del 80-100% bajo quality gates de SonarQube.",
      en: "Single-SPA microfrontends for Deposits, Investments and Payroll. 80-100% test coverage under SonarQube quality gates.",
    },
    stack: ["React", "TypeScript", "Single-SPA", "Jest", "RTL"],
  },
  {
    company: "Mexicode",
    from: "2023",
    to: "2024",
    title: {
      es: "Desarrollador Full Stack",
      en: "Full Stack Web Developer",
    },
    impact: {
      es: "Sistema de gestión de asistencias de punta a punta para clientes internacionales. Revisión de código y gestión de PRs.",
      en: "End-to-end attendance management system for international clients. Code review and PR management.",
    },
    stack: ["React", "C#", ".NET", "MS SQL", "LINQ"],
  },
  {
    company: "Holding SI",
    from: "2023",
    to: "2023",
    title: {
      es: "Desarrollador de Software",
      en: "IT Software Developer",
    },
    impact: {
      es: "Aplicaciones internas de core empresarial y gestión de garantías. Eficiencia operativa mejorada cerca de un 40%.",
      en: "Internal core-business and warranty management apps. Operational efficiency improved by around 40%.",
    },
    stack: ["Django", "Python", "SQLite", "SQL"],
  },
];

export interface SkillGroup {
  label: Record<"es" | "en", string>;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: { es: "Frontend", en: "Frontend" },
    items: [
      "React",
      "Next.js",
      "JavaScript (ES6+)",
      "TypeScript",
      "HTML5",
      "CSS3",
      "Sass",
      "Tailwind",
    ],
  },
  {
    label: { es: "Backend", en: "Backend" },
    items: ["Node.js", "Django", ".NET", "C#"],
  },
  {
    label: { es: "Testing y DevOps", en: "Testing & DevOps" },
    items: [
      "Jest",
      "Testing Library",
      "Enzyme",
      "Docker",
      "Rancher",
      "Harbor",
      "Postman",
    ],
  },
  {
    label: { es: "Datos y nube", en: "Data & Cloud" },
    items: ["MS SQL", "PostgreSQL", "MongoDB", "Firebase", "AWS"],
  },
  {
    label: { es: "Explorando", en: "Exploring" },
    items: ["Three.js", "React Native", "RTK Query", "Swift"],
  },
];

export const navLinks = [
  { key: "home", href: "#hero" },
  { key: "projects", href: "#projects" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
] as const;
