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
    <html lang="es" suppressHydrationWarning>
      <head>
        {}
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
