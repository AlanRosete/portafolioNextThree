"use client";

import { useTranslation } from "@/hooks/useLang";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { localizeProjects } from "@/data/projects";
import { useStore } from "@/hooks/useStore";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const ProjectPreview = dynamic(
  () => import("@/components/Scene/ProjectPreview"),
  { ssr: false }
);

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { lang, t } = useTranslation();
  const projects = useMemo(() => localizeProjects(lang), [lang]);
  const [active, setActive] = useState(0);
  const selectProject = useStore((s) => s.selectProject);

  const [canHover, setCanHover] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (canHover === null || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".project-row__inner").forEach((row) => {
        gsap.fromTo(
          row,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 88%" },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".project-row__rule").forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: "power3.inOut",
            scrollTrigger: { trigger: rule, start: "top 95%" },
          }
        );
      });

      gsap.fromTo(
        ".projects-head",
        { clipPath: "inset(0% 0% 100% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [canHover]);

  const handleActivate = useCallback((index: number) => {
    setActive(index);
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="section projects">
      <header className="projects-head">
        <h2 className="projects-head__title">{t.projects.headTitle}</h2>
        <p className="projects-head__lead">{t.projects.headLead}</p>
      </header>

      <div className="projects-layout">
        <ol className="projects-list">
          {projects.map((project, i) => (
            <li
              key={project.id}
              className={`project-row${i === active ? " is-active" : ""}`}
              onMouseEnter={() => handleActivate(i)}
            >
              <div className="project-row__inner">
                <span className="project-row__index">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="project-row__body">
                  <h3 className="project-row__heading">
                    <button
                      type="button"
                      className="project-row__open"
                      onClick={() => selectProject(project)}
                      onFocus={() => handleActivate(i)}
                    >
                      {project.title}
                    </button>
                  </h3>

                  <p className="project-row__stack">
                    {project.tags.join(" · ")}
                  </p>

                  <p className="project-row__desc">{project.description}</p>

                  {canHover === false && (
                    <div className="project-row__thumb">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="project-row__links">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.projects.live} <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.projects.code} <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <span className="project-row__rule" aria-hidden="true" />
            </li>
          ))}
        </ol>

        {canHover === true && (
          <div className="projects-preview" aria-hidden="true">
            <div className="projects-preview__frame">
              <ProjectPreview projects={projects} index={active} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
