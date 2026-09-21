"use client";

import React, { useEffect, useRef, useState } from "react";
import { roles, skillGroups } from "@/data/projects";
import { useTranslation } from "@/hooks/useLang";
import { RichText } from "@/i18n/RichText";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { lang, t } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
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
      gsap.fromTo(
        ".skill-group",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".skills-grid",
            start: "top 85%",
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="section relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto relative z-10 px-4">
        <h2
          className="about-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-14 text-center"
          style={{ fontFamily: "var(--font-family-heading)", opacity: 0 }}
        >
          <span className="text-text-primary">{t.about.title}</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center space-mt">
          <div className="about-bio" style={{ opacity: 0 }}>
            <div className="glass rounded-2xl p-6 md:p-8 lg:p-10" style={{ padding: "5%" }}>
              <h3
                className="text-2xl font-bold mb-4 text-text-primary"
                style={{ fontFamily: "var(--font-family-heading)" }}
              >
                {t.about.role}
              </h3>
              <br />
              <p className="text-text-secondary leading-relaxed mb-4">
                <RichText text={t.about.bio1} />
              </p>
              <div className="role-list mt-10 pt-8 border-t border-line">
                <h4 className="role-list__label">{t.about.experience}</h4>

                {roles.map((role) => (
                  <article key={role.company} className="role-row">
                    <p className="role-row__when">
                      {role.from} — {role.current ? t.about.present : role.to}
                    </p>

                    <div className="role-row__body">
                      <h5 className="role-row__company">{role.company}</h5>
                      <p className="role-row__title">{role.title[lang]}</p>
                      <p className="role-row__impact">{role.impact[lang]}</p>
                      <p className="role-row__stack">{role.stack.join(" · ")}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="skills-grid">
            {skillGroups.map((group) => (
              <div
                key={group.label.en}
                className="skill-group"
                style={{ opacity: 0 }}
              >
                <h4 className="skill-group__label">{group.label[lang]}</h4>
                <p className="skill-group__items">{group.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}