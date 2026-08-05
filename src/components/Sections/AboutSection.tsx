"use client";

import React, { useEffect, useRef, useState } from "react";
import { skills } from "@/data/projects";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Helper: normaliza el nombre de la skill y genera candidatos de filenames
 * También contiene un map de excepciones conocidas (react, tailwind, c# etc.)
 */
const ICON_EXCEPTIONS: Record<string, string> = {
  react: "iconReact.svg.png",
  tailwind: "iconTailwind.svg.png",
  typescript: "iconTypeScript.svg",
  "c#": "iconCsharp.png",
  csharp: "iconCsharp.png",
  "microsoft sql": "iconMicrosoftSql.svg",
  "microsoftsql": "iconMicrosoftSql.svg",
  javascript: "iconJavascript.png",
  node: "iconNode.svg",
  firebase: "iconFirebase.svg",
  mongo: "iconMongo.svg",
  django: "iconDjango.webp",
  html: "iconHtml.png",
  css: "iconCss.png",
  bootstrap: "iconBootstrap.svg",
  sass: "iconSass.png",
  angular: "iconAngular.svg",
  amazon: "iconAmazon.svg",
  redux: "iconRedux.svg",
  gsap: "iconGsap.svg",
  threejs: "iconThreejs.png",
  android: "iconAndroid.svg",
  sqlserver: "iconMicrosoftSql.svg",
  aws: "iconAmazon.svg",
  swift: "iconSwift.svg",
  nextjs: "iconNext.svg",
};

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[\s+#.]/g, "")
    .replace(/\+/g, "plus");
}

function buildCandidates(name: string) {
  const n = name.toLowerCase().trim();

  // Buscar match exacto primero
  if (ICON_EXCEPTIONS[n]) {
    return [`/icons/${ICON_EXCEPTIONS[n]}`];
  }

  // Buscar match parcial (ej: "Node.js" matchea key "node")
  const partialKey = Object.keys(ICON_EXCEPTIONS).find(
    (key) => n.includes(key) || key.includes(n.replace(/[.\s]/g, "").toLowerCase())
  );

  if (partialKey) {
    return [`/icons/${ICON_EXCEPTIONS[partialKey]}`];
  }

  // fallback patterns
  const base = normalizeName(name);
  return [
    `/icons/icon${base}.svg`,
    `/icons/icon${base}.png`,
    `/icons/icon${base}.webp`,
    `/icons/icon${base}.svg.png`,
    `/icons/${base}.svg`,
    `/icons/${base}.png`,
  ];
}

/** PlanetSkill: intenta cargar varias variantes de filename y hace fallback a iniciales */
function PlanetSkill({ name }: { name: string }) {
  const candidates = buildCandidates(name);
  const [srcIndex, setSrcIndex] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const onError = () => {
    setErrorCount((c) => c + 1);
    // intenta el siguiente candidato
    setSrcIndex((i) => (i + 1 < candidates.length ? i + 1 : i));
  };

  // iniciales como fallback si todas fallan
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="planet-skill group w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center relative transform-gpu"
      style={{ willChange: "transform" }}
    >
      {/* Superficie plana con hairline: mantiene la silueta de planeta sin el halo difuso */}
      <div
        className={`relative z-10 w-full h-full rounded-full flex items-center justify-center border border-line bg-bg-secondary transition-colors duration-300 group-hover:border-line-strong`}
      >
        {errorCount >= candidates.length ? (
          <div className="text-xs font-semibold text-text-primary">{initials}</div>
        ) : (
          // no uso next/image aquí por simplicidad y porque assets están en public
          <img
            src={candidates[srcIndex]}
            alt={name}
            onError={onError}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        ".about-title",
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

      // Bio animation
      gsap.fromTo(
        ".about-bio",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-bio",
            start: "top 85%",
          },
        }
      );

      // Planet items entrance
      gsap.fromTo(
        ".planet-skill",
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: ".skills-grid",
            start: "top 85%",
          },
        }
      );

      // Floating loop for planets (subtle)
      const planets = gsap.utils.toArray<HTMLElement>(".planet-skill");
      planets.forEach((el, i) => {
        const dur = 3 + (i % 4); // variance duration
        gsap.to(el, {
          y: "+=" + (6 + (i % 4)),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          duration: dur,
          delay: (i % 3) * 0.15,
        });
        // tiny rotation
        gsap.to(el, {
          rotation: (i % 2 === 0 ? 2 : -2),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          duration: dur * 1.2,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const categories = [...new Set(skills.map((s) => s.category))];

  // Stats (puedes ajustar)
  const stats = [
    { value: "3+", label: "Years exp." },
    { value: "20+", label: "Projects" },
    { value: "10+", label: "Technologies" },
  ];

  return (
    <section id="about" ref={sectionRef} className="section relative">
      {/* Halo neutro muy tenue: da profundidad sin teñir la sección */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto relative z-10 px-4">
        {/* Title */}
        <h2
          className="about-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-14 text-center"
          style={{ fontFamily: "var(--font-family-heading)", opacity: 0 }}
        >
          <span className="text-text-primary">About Me</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-start space-mt">
          {/* Bio */}
          <div className="about-bio" style={{ opacity: 0 }}>
            <div className="glass rounded-2xl p-6 md:p-8 lg:p-10" style={{ padding: "5%" }}>
              <h3
                className="text-2xl font-bold mb-4 text-text-primary"
                style={{ fontFamily: "var(--font-family-heading)" }}
              >
                Frontend Developer
              </h3>
              <br />
              {/* Updated paragraph (your requested version) */}
              <p className="text-text-secondary leading-relaxed mb-4">
                I’m <strong>Alan Rosete Mendoza</strong>, a frontend developer with
                over 3 years of experience building modern and scalable web
                applications. Throughout my career, I’ve worked on projects for
                companies such as <em>Banco Azteca</em>, <em>Mexicode</em>, and
                <em>Holding HSI</em>, where I designed and implemented dynamic
                interfaces using <strong>React, TypeScript, JavaScript, Redux</strong>, and
                component-based architecture patterns. I also have experience with API
                integration, performance optimization, microfrontends, unit testing with
                Jest, and deployments in Cloud environments.
              </p>

              <p className="text-text-secondary leading-relaxed mb-4">
                I also build mobile apps with React Native (iOS / Android) and enjoy
                exploring WebGL shaders and performance optimizations when not
                coding.
              </p>
              <br />
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6 mt-8 pt-6 border-t border-line">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl lg:text-3xl font-semibold text-text-primary">
                      {s.value}
                    </div>
                    <div className="text-text-muted text-xs lg:text-sm mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills grid (planetitas) */}
          <div className="skills-grid space-y-6">
            {categories.map((category, ci) => (
              <div key={category}>
                <div className="flex flex-wrap gap-8 items-center justify-center" style={ci > 0 ? { paddingTop: "100px" } : undefined}>
                  {skills
                    .filter((s) => s.category === category)
                    .map((skill) => (
                      <div key={skill.name}>
                        <PlanetSkill name={skill.name} />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}