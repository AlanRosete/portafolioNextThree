"use client";
import React, { useEffect, useRef, useState } from "react";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" }); // Nuevo: Errores para validación
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { gsap } = require("@/lib/gsap");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-title",
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
        ".contact-form",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-form",
            start: "top 85%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email: "", message: "" };

    if (!formState.name.trim()) {
      newErrors.name = "El nombre es requerido";
      valid = false;
    }
    if (!formState.email.trim() || !/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = "Email válido es requerido";
      valid = false;
    }
    if (!formState.message.trim()) {
      newErrors.message = "El mensaje es requerido";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return; // Validación client-side

    setStatus("sending");

    try {
      // Envío real: Reemplaza con tu endpoint (e.g., Formspree, Netlify Forms, o backend)
      const response = await fetch("/api/contact", { // Placeholder: ajusta a tu API
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!response.ok) throw new Error("Error en el envío");

      setStatus("sent");
      setFormState({ name: "", email: "", message: "" });
      setErrors({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section relative min-h-screen flex items-center justify-center" // Mejora: min-h-screen y centering para mejor height en desktop
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-4xl mx-auto relative z-10 w-full px-4 sm:px-6 lg:px-8"> {/* Ajuste: paddings responsivos */}
        {/* Title */}
        <div className="text-center mb-12 md:mb-16"> {/* Más espacio en desktop */}
          <h2
            className="contact-title text-4xl md:text-6xl font-bold mb-4"
            style={{ fontFamily: "var(--font-family-heading)", opacity: 0 }}
          >
            <span className="gradient-text">Hablemos</span>
          </h2>
          <p className="contact-title text-text-secondary text-lg" style={{ opacity: 0 }}>
            ¿Tienes un proyecto en mente? ¡Me encantaría escucharte!
          </p>
        </div>
        {/* Form */}
        <div className="contact-form glass rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16"> {/* Mejora: paddings escalados para mejor height */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-text-secondary text-sm font-medium mb-2"
                >
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  aria-required="true"
                  value={formState.name}
                  onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50 transition-all duration-300"
                  placeholder="Tu nombre"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-text-secondary text-sm font-medium mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  aria-required="true"
                  value={formState.email}
                  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50 transition-all duration-300"
                  placeholder="tu@email.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-text-secondary text-sm font-medium mb-2"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                aria-required="true"
                rows={6} // Mejora: Aumentado a 6 para mejor height base, pero responsivo
                value={formState.message}
                onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50 transition-all duration-300 resize-y min-h-[120px] md:min-h-[180px]" // Mejora: resize-y y min-h responsivo
                placeholder="Cuéntame sobre tu proyecto..."
              />
              {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
            </div>
            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" // Mejora: gap-2 para iconos
              >
                {status === "sending" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : status === "sent" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Enviado!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar Mensaje
                  </>
                )}
              </button>
              {status === "error" && (
                <p role="status" className="text-red-400 text-sm">
                  Error al enviar. Intenta de nuevo.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}