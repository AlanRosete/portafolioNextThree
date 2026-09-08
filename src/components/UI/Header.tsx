"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useStore } from "@/hooks/useStore";
import { navLinks } from "@/data/projects";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
      );
    }
  }, []);

  // Bloquea el scroll del documento mientras el menú móvil está abierto.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    closeMobileMenu();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 p-[1%]! transition-all duration-500 ${
          scrolled && !isMobileMenuOpen ? "glass-strong" : ""
        }`}
        style={{ opacity: 0 }}
      >
        <div
          className="mx-auto px-6 flex items-center justify-between"
          style={{ paddingInline: "1.5rem" }}
        >
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#hero");
            }}
            className="flex items-center"
            aria-label="Alan — ir al inicio"
          >
            <img
              src="/world-svgrepo-com.svg"
              alt=""
              width={40}
              height={40}
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 transition-transform duration-300 hover:scale-105"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <a
              href="/game"
              className="text-sm font-medium px-4 py-2 rounded-md border border-line-strong text-text-primary hover:border-accent-primary hover:text-accent-text transition-colors duration-200"
            >
              Download CV
            </a>

            <ThemeToggle />
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative flex h-6 w-6 items-center justify-center"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className="absolute block h-0.5 w-6 transition-all duration-300"
              style={{
                background: isMobileMenuOpen
                  ? "var(--color-accent-primary)"
                  : "var(--color-text-primary)",
                transform: isMobileMenuOpen
                  ? "rotate(45deg)"
                  : "translateY(-7px)",
              }}
            />
            <span
              className="absolute block h-0.5 w-6 bg-text-primary transition-all duration-300"
              style={{ opacity: isMobileMenuOpen ? 0 : 1 }}
            />
            <span
              className="absolute block h-0.5 w-6 transition-all duration-300"
              style={{
                background: isMobileMenuOpen
                  ? "var(--color-accent-primary)"
                  : "var(--color-text-primary)",
                transform: isMobileMenuOpen
                  ? "rotate(-45deg)"
                  : "translateY(7px)",
              }}
            />
          </button>
        </div>
      </header>

      {/*
        El menú vive fuera del <header> a propósito: GSAP deja un transform
        inline en el header y eso lo convierte en bloque contenedor de sus
        hijos `fixed`, lo que rompía el inset-0 del overlay en móvil.
      */}
      <div
        className={`md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 px-6 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "var(--color-bg-primary)" }}
        aria-hidden={!isMobileMenuOpen}
      >
        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            tabIndex={isMobileMenuOpen ? 0 : -1}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(link.href);
            }}
            className="text-3xl font-bold text-center"
            style={{
              color: "var(--color-accent-primary)",
              transform: isMobileMenuOpen
                ? "translateY(0)"
                : "translateY(20px)",
              opacity: isMobileMenuOpen ? 1 : 0,
              transition: "all 0.4s ease",
              transitionDelay: isMobileMenuOpen ? `${i * 70}ms` : "0ms",
            }}
          >
            {link.label}
          </a>
        ))}
        <a
          href="/game"
          tabIndex={isMobileMenuOpen ? 0 : -1}
          onClick={closeMobileMenu}
          className="mt-2 rounded-md border px-6 py-3 text-lg font-medium"
          style={{
            color: "var(--color-accent-primary)",
            borderColor:
              "color-mix(in srgb, var(--color-accent-primary) 45%, transparent)",
            transform: isMobileMenuOpen ? "translateY(0)" : "translateY(20px)",
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: "all 0.4s ease",
            transitionDelay: isMobileMenuOpen
              ? `${navLinks.length * 70}ms`
              : "0ms",
          }}
        >
          Download CV
        </a>

        <div
          style={{
            transform: isMobileMenuOpen ? "translateY(0)" : "translateY(20px)",
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: "all 0.4s ease",
            transitionDelay: isMobileMenuOpen
              ? `${(navLinks.length + 1) * 70}ms`
              : "0ms",
          }}
        >
          <ThemeToggle
            className="theme-toggle--mobile"
            tabIndex={isMobileMenuOpen ? 0 : -1}
          />
        </div>
      </div>
    </>
  );
}
