"use client";

import React, { useEffect, useRef } from "react";
import { useStore } from "@/hooks/useStore";
import { gsap } from "@/lib/gsap";
import Image from "next/image";

export default function Modal() {
  const { selectedProject, isModalOpen, closeModal } = useStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";

      // Animate in
      if (overlayRef.current && contentRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo(
          contentRef.current,
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.1 }
        );
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen || !selectedProject) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={closeModal}
      style={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative glass-strong rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 0 }}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all duration-300"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Project Image */}
        <div
          className="w-full h-48 rounded-xl mb-6 flex items-center justify-center text-6xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${selectedProject.color}33, ${selectedProject.color}11)`,
            border: `1px solid ${selectedProject.color}44`,
          }}
        >
        {selectedProject.image ? (
          <Image
            src={selectedProject.image}
            alt={selectedProject.title}
            fill
            className="object-cover"
          />
        ) : (
          <span>🚀</span>
        )}
        </div>

        {/* Title */}
        <h2
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-family-heading)" }}
        >
          {selectedProject.title}
        </h2>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedProject.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: `${selectedProject.color}22`,
                color: selectedProject.color,
                border: `1px solid ${selectedProject.color}44`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-text-secondary leading-relaxed mb-6">
          {selectedProject.longDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {selectedProject.liveUrl && (
            <a
              href={selectedProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver Demo
            </a>
          )}
          {selectedProject.repoUrl && (
            <a
              href={selectedProject.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Código
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
