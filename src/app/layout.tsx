import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alan Rosete | Frontend Developer & Creative Engineer",
  description:
    "Portafolio interactivo 3D de Alan Rosete. Desarrollador Frontend especializado en React, Three.js, y experiencias web inmersivas.",
  keywords: [
    "frontend developer",
    "react",
    "three.js",
    "web developer",
    "portfolio",
    "creative developer",
    "webgl",
    "alan rosete",
  ],
  authors: [{ name: "Alan Rosete" }],
  openGraph: {
    title: "Alan Rosete | Frontend Developer & Creative Engineer",
    description:
      "Portafolio interactivo 3D — Experiencias web inmersivas con React y Three.js",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alan Rosete | Frontend Developer",
    description:
      "Portafolio interactivo 3D — Experiencias web inmersivas con React y Three.js",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: el script de abajo escribe data-theme en <html>
    // antes de que React hidrate, así que el HTML del servidor y el del cliente
    // difieren a propósito en ese atributo. Solo silencia este elemento.
    <html lang="es" suppressHydrationWarning>
      <head>
        {/*
          Va PRIMERO y sin `defer`/`async` a propósito: un script inline en
          <head> bloquea el parseo, así que corre antes del primer pintado.
          Ese es justo el punto — si el tema se aplicara desde un useEffect,
          la pantalla de "Cargando experiencia" alcanzaría a pintarse en
          oscuro y saltaría a claro (el clásico flash de tema).

          Sin dependencias del bundle: tiene que existir antes que React.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`,
          }}
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
