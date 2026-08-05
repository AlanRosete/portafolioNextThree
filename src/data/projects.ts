import { Project } from "@/hooks/useStore";

export const projects: Project[] = [
  {
    id: "project-1",
    title: "GeoWeather",
    description: "Full-stack e-commerce con React, Node.js y Stripe.",
    longDescription:
      "Plataforma e-commerce completa con carrito de compras, sistema de pagos con Stripe, panel de administración, y dashboard de analítica. Arquitectura microservicios con API REST y WebSockets para actualizaciones en tiempo real.",
    tags: ["React", "Node.js", "Stripe", "MongoDB", "WebSocket"],
    image: "/imgPortfolio/geoWeatherReact.png",
    liveUrl: "https://example.com",
    repoUrl: "https://github.com",
    color: "#f8f8f8",
  },
  {
    id: "project-2",
    title: "AI Dashboard",
    description: "Dashboard inteligente con visualización de datos en tiempo real.",
    longDescription:
      "Dashboard con machine learning integrado para predicción de métricas. Gráficas interactivas con D3.js, streaming de datos via Server-Sent Events, y sistema de alertas automatizadas con notificaciones push.",
    tags: ["Next.js", "Python", "TensorFlow", "D3.js", "SSE"],
    image: "/projects/project-2.jpg",
    liveUrl: "https://example.com",
    repoUrl: "https://github.com",
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
    description: "Plataforma de CI/CD con monitoreo y despliegue automatizado.",
    longDescription:
      "Plataforma e-commerce completa con carrito de compras, sistema de pagos con Stripe, panel de administración, y dashboard de analítica. Arquitectura microservicios con API REST y WebSockets para actualizaciones en tiempo real.",
    tags: ["Go", "Docker", "K8s", "React", "GraphQL"],
    image: "/imgPortfolio/ecommerceReact.png",
    repoUrl: "https://github.com",
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
