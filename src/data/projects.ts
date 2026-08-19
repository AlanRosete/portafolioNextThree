import { Project } from "@/hooks/useStore";

export const projects: Project[] = [
  {
    id: "project-1",
    title: "GeoWeather",
    description: "App del clima con mapa interactivo y pronóstico global.",
    longDescription:
      "Aplicación del clima que consulta datos de cualquier punto del planeta. Búsqueda de ciudades con autocompletado de Google Places, geolocalización del navegador y selección directa sobre un mapa de Google Maps. Muestra el día actual y el pronóstico extendido con gráficas de temperatura en Chart.js, además de humedad, viento y su dirección en grados, sensación térmica, y horarios de amanecer y atardecer. Incluye conmutador de unidades °C/°F, estado global con Context API y useReducer, y carga diferida de los recursos de cada condición climática.",
    tags: ["React", "Vite", "TailwindCSS", "Google Maps API", "Chart.js"],
    image: "/imgPortfolio/geoWeatherReact.png",
    liveUrl: "https://geo-weatherv1.netlify.app",
    repoUrl: "https://github.com/AlanRosete",
    color: "#f8f8f8",
  },
  {
    id: "project-2",
    title: "Minimalist Calendar",
    description: "Calendario anual completo con estética minimalista y nevada animada.",
    longDescription:
      "Calendario que despliega los doce meses del año en una sola vista, construido con JavaScript vanilla sobre la librería js-year-calendar. El diseño parte de una paleta suave en azul pálido y rosa, tipografía Quicksand para el cuerpo y Dancing Script para los títulos, tarjetas por mes con sombras difusas y realce de fines de semana. Incluye un efecto de nevada generado por completo en JavaScript, donde cada copo recibe posición, tamaño, opacidad y duración aleatorias, animado con keyframes de CSS y aislado de la interacción del usuario.",
    tags: ["JavaScript", "HTML5", "CSS3", "js-year-calendar", "CSS Animations"],
    image: "/imgPortfolio/minimalistCalendarReact.png",
    liveUrl: "https://minimalist-calendar.netlify.app",
    repoUrl: "https://github.com/AlanRosete",
    color: "#a8a7a8",
  },
  {
    id: "project-3",
    title: "Social Media App",
    description: "Red social con chat en tiempo real y stories.",
    longDescription:
      "Aplicación social completa con sistema de posts, stories ephemeral, chat en tiempo real con Socket.io, sistema de followers, notificaciones push y feed algorítmico personalizado.",
    tags: ["React Native", "Firebase", "Socket.io", "Redis"],
    image: "/projects/project-3.jpg",
    color: "#e8175d",
  },
  {
    id: "project-4",
    title: "3D Product Configurator",
    description: "Configurador 3D interactivo para productos custom.",
    longDescription:
      "Configurador de productos en 3D usando Three.js y React Three Fiber. Los usuarios pueden personalizar colores, materiales y componentes del producto en tiempo real con render fotorrealista y exportación a AR.",
    tags: ["Three.js", "R3F", "WebGL", "AR", "GSAP"],
    image: "/projects/project-4.jpg",
    liveUrl: "https://example.com",
    repoUrl: "https://github.com",
    color: "#898989",
  },
  {
    id: "project-5",
    title: "Ecommerce Shoes",
    description: "Tienda online con catálogo, filtros y carrito persistente.",
    longDescription:
      "E-commerce de moda urbana con catálogo dividido en calzado, bolsos y sombreros. Incluye filtrado por categoría y rango de precio, ordenamiento por destacados, alfabético y precio, carga progresiva del catálogo con IntersectionObserver, y ficha de producto con selección de talla, descuentos y sugerencias relacionadas. El carrito maneja cantidades, eliminación de artículos y cálculo de totales, y persiste en localStorage entre sesiones. Navegación con React Router, estado global mediante Context API y useReducer, notificaciones con React Toastify, y un backend serverless en Netlify Functions que sirve el catálogo.",
    tags: ["React", "React Router", "TailwindCSS", "Netlify Functions", "Context API"],
    image: "/imgPortfolio/ecommerceReact.png",
    liveUrl: "https://ecommerce-test-react.netlify.app",
    repoUrl: "https://github.com/AlanRosete",
    color: "#cc527a",
  },
];

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

export const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "Proyects", href: "#projects" },
  { label: "About Me", href: "#about" },
  { label: "Contact", href: "#contact" },
];
