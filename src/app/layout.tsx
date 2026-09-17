import type { Metadata } from "next";
import "./globals.css";
import LangSync from "@/components/UI/LangSync";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Alan Rosete | Frontend Developer — React & TypeScript",
  description:
    "Desarrollador frontend con más de 3 años construyendo aplicaciones React y TypeScript en entornos de alta demanda. Microfrontends, testing con Jest y despliegues en la nube.",
  authors: [{ name: "Alan Rosete" }],
  creator: "Alan Rosete",
  openGraph: {
    title: "Alan Rosete | Frontend Developer — React & TypeScript",
    description:
      "Aplicaciones React y TypeScript en entornos de alta demanda. Microfrontends, testing y despliegues en la nube.",
    type: "profile",
    locale: "es_MX",
    alternateLocale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Alan Rosete — Frontend Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alan Rosete | Frontend Developer — React & TypeScript",
    description:
      "Aplicaciones React y TypeScript en entornos de alta demanda. Microfrontends, testing y despliegues en la nube.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: el script de abajo escribe data-theme y lang
    // en <html> antes de que React hidrate, así que el HTML del servidor y el
    // del cliente difieren a propósito en esos atributos. Solo silencia este
    // elemento.
    //
    // `lang="es"` es el valor del SERVIDOR y el que ven los buscadores; el
    // script de abajo lo corrige a "en" si el visitante lo eligió antes.
    //
    // OJO con `lang`: no se comporta como `data-theme`. Al hidratar, React
    // RESTAURA los atributos que él mismo renderiza, así que el `lang="en"`
    // que escribía el script inline se revertía a "es" en cuanto arrancaba el
    // bundle — el interruptor funcionaba, pero el idioma no sobrevivía a una
    // recarga. `suppressHydrationWarning` solo calla el aviso; no evita la
    // restauración. Por eso el idioma se re-aplica desde `LangSync`, ya
    // dentro del árbol de React, y el script inline sigue existiendo para
    // cubrir el hueco ANTES de la hidratación (que es lo que evita el
    // parpadeo). Los dos hacen falta: uno para pintar, otro para mandar.
    <html lang="es" suppressHydrationWarning>
      <head>
        {/*
          Va PRIMERO y sin `defer`/`async` a propósito: un script inline en
          <head> bloquea el parseo, así que corre antes del primer pintado.
          Ese es justo el punto — si el tema se aplicara desde un useEffect,
          la pantalla de "Cargando experiencia" alcanzaría a pintarse en
          oscuro y saltaría a claro (el clásico flash de tema).

          Sin dependencias del bundle: tiene que existir antes que React.

          Hace lo mismo con el IDIOMA, y por el mismo motivo: si `lang` se
          aplicara desde un useEffect, el primer pintado saldría en español y
          el texto saltaría a inglés a la vista del usuario. Cuando no hay nada
          guardado se mira el idioma del navegador — sólo se asume inglés si
          NO empieza por "es", para que el resto del mundo no caiga en español.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}try{var l=localStorage.getItem('lang');if(l!=='es'&&l!=='en'){l=(navigator.language||'es').toLowerCase().indexOf('es')===0?'es':'en'}document.documentElement.lang=l}catch(e){document.documentElement.lang='es'}})()`,
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
      <body className="antialiased">
        <LangSync />
        {children}
      </body>
    </html>
  );
}
