"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";

const ThreeScene = dynamic(() => import("@/components/Scene/ThreeScene"), {
  ssr: false,
});
const HeroScene = dynamic(() => import("@/components/Scene/HeroScene"), {
  ssr: false,
});

export default function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 1.5 });

      tl.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      )
        .fromTo(
          ".hero-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".hero-desc",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.3"
        );
    }, textRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <ThreeScene
          className="w-full h-full"
          shadows
          camera={{ position: [0, 0.6, 9], fov: 42 }}
          dpr={[1, 1.75]}
        >
          <HeroScene />
        </ThreeScene>
      </div>

      {/* Veil that keeps the copy readable over the 3D scene */}
      <div className="hero-veil z-1" />

      {/* Content — centered on all viewports */}
      <div ref={textRef} className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full pb-[34vh] md:pb-0">
        <div className="max-w-3xl mx-auto text-center md:text-left md:mx-0 lg:max-w-2xl responsive-hero-desktop">
          <p
            className="hero-subtitle text-text-muted text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-4 md:mb-6"
            style={{ opacity: 0 }}
          >
            Frontend Developer & Mobile Engineer
          </p>

          <h1
            className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] mb-5 md:mb-8"
            style={{ fontFamily: "var(--font-family-heading)", opacity: 0 }}
          >
            <span className="block text-text-secondary font-normal">Hi, I'm</span>
            <span className="block text-text-primary">Alan Rosete</span>
          </h1>

          <p
            className="hero-desc text-text-secondary text-base md:text-lg lg:text-xl leading-relaxed mb-8 md:mb-10 max-w-lg mx-auto md:mx-0"
            style={{ opacity: 0 }}
          >
            I build immersive web experiences with{" "}
            <span className="text-text-primary font-medium">React</span>,{" "}
            <span className="text-text-primary font-medium">Javascript</span>{" "}
            and{" "}
            <span className="text-text-primary font-medium">
              React Native
            </span>
            .
          </p>

          <div className="hero-cta flex flex-wrap gap-4 justify-center md:justify-start" style={{ opacity: 0 }}>
            <a href="#projects" className="btn-primary">
              View projects
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
            <a href="#contact" className="btn-secondary">
              Contact me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
