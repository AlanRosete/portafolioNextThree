"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useStore } from "@/hooks/useStore";
import { navLinks } from "@/data/projects";

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

  const handleNavClick = (href: string) => {
    closeMobileMenu();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "glass-strong shadow-lg" : ""
      }`}
      style={{ opacity: 0 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#hero");
          }}
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-family-heading)" }}
        >
          <span className="gradient-text">Alan</span>
          <span className="text-text-secondary">.dev</span>
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
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="/game"
            className="text-sm font-medium px-4 py-2 rounded-lg border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10 transition-all duration-300"
          >
            📑 Download CV
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex flex-col gap-1.5 p-2 z-50"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 glass-strong z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(link.href);
            }}
            className="text-3xl font-bold text-text-primary hover:text-accent-primary transition-colors"
            style={{
              transitionDelay: isMobileMenuOpen ? `${i * 100}ms` : "0ms",
              transform: isMobileMenuOpen ? "translateY(0)" : "translateY(20px)",
              opacity: isMobileMenuOpen ? 1 : 0,
              transition: "all 0.4s ease",
            }}
          >
            {link.label}
          </a>
        ))}
        <a
          href="/game"
          className="text-xl font-bold text-accent-primary"
          style={{
            transitionDelay: isMobileMenuOpen ? `${navLinks.length * 100}ms` : "0ms",
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: "all 0.4s ease",
          }}
        >
          📑 Download CV
        </a>
      </div>
    </header>
  );
}
