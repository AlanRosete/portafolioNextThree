"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const ThreeScene = dynamic(() => import("@/components/Scene/ThreeScene"), {
  ssr: false,
});
const Gallery = dynamic(() => import("@/components/Scene/Gallery"), {
  ssr: false,
});

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { gsap, ScrollTrigger } = require("@/lib/gsap");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".projects-title",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
      gsap.fromTo(
        ".projects-subtitle",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="section relative flex flex-col justify-center items-center gap-12 sm:gap-16 md:gap-24 lg:gap-32"
      style={{ minHeight: "100vh" }}
    >
      {/* Title */}
      <div className="text-center relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 sm:gap-6">
        <h2
          className="projects-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
          style={{ fontFamily: "var(--font-family-heading)", opacity: 0 }}
        >
          <span className="gradient-text">Mis Proyectos</span>
        </h2>
        <p
          className="projects-subtitle text-text-secondary text-sm md:text-base lg:text-lg"
          style={{ opacity: 0 }}
        >
          Haz clic en cualquier proyecto para ver los detalles. Gira la galería
          con el cursor.
        </p>
      </div>

      {/* 3D Gallery */}
      <div className="w-full flex justify-center items-center">
        <div className="w-full max-w-6xl h-[500px] sm:h-[550px] md:h-[650px] lg:h-[700px] xl:h-[750px] relative">
          <ThreeScene className="w-full h-full" interactive>
            <Gallery />
          </ThreeScene>
        </div>
      </div>
    </section>
  );
}