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
    <html lang="es">
      <head>
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
