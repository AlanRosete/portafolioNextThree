"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/* Edita estos valores: son los únicos datos personales de la sección. */
const CONTACT_EMAIL = "alanroset3@gmail.com";
const SOCIALS = [
  { name: "GitHub", url: "https://github.com" },
  { name: "LinkedIn", url: "https://linkedin.com" },
  { name: "Twitter", url: "https://twitter.com" },
];

type FormState = { name: string; email: string; message: string };
type FieldName = keyof FormState;

const EMPTY: FormState = { name: "", email: "", message: "" };

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // Una sola timeline para toda la sección: la columna izquierda entra
      // primero y el formulario la sigue, en vez de dos reveals compitiendo.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });

      tl.fromTo(
        ".contact-intro > *",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }
      ).fromTo(
        ".contact-field",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.07 },
        "-=0.45"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const setField = (field: FieldName) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setFormState((s) => ({ ...s, [field]: value }));
    // Limpia el error en cuanto el usuario corrige, no hasta el siguiente submit.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const validate = () => {
    const next: FormState = { ...EMPTY };

    if (!formState.name.trim()) next.name = "Please enter your name.";
    if (!/\S+@\S+\.\S+/.test(formState.email.trim()))
      next.email = "Please enter a valid email address.";
    if (formState.message.trim().length < 10)
      next.message = "Tell me a bit more — at least 10 characters.";

    setErrors(next);
    return !next.name && !next.email && !next.message;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    // Honeypot: los bots rellenan campos ocultos, las personas no.
    const honeypot = (e.currentTarget.elements.namedItem(
      "company"
    ) as HTMLInputElement | null)?.value;
    if (honeypot) return;

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (!response.ok) throw new Error(String(response.status));

      setStatus("sent");
      setFormState(EMPTY);
      setErrors(EMPTY);
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 6000);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section relative flex items-center justify-center"
    >
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ── Columna izquierda: contexto ── */}
          <div className="contact-intro lg:col-span-5 display-flex gap-5 flex-col flex justify-center">
            <p
              className="text-xs font-medium uppercase tracking-[0.18em] text-text-muted mb-5"
              style={{ opacity: 0 }}
            >
              Contact
            </p>

            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6"
              style={{ fontFamily: "var(--font-family-heading)", opacity: 0 }}
            >
              Let&apos;s talk
            </h2>

            <p
              className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-md mb-10"
              style={{ opacity: 0 }}
            >
              Have a project in mind, a role to fill, or just want to swap
              notes on frontend? Drop me a line — I read every message.
            </p>

            <div className="border-t border-line pt-8" style={{ opacity: 0 }}>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted mb-2">
                Email
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-text-primary text-lg hover:text-accent-text transition-colors duration-200 break-all"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2" style={{ opacity: 0 }}>
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* ── Columna derecha: formulario ── */}
          <div className="lg:col-span-7 w-full">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="glass rounded-2xl p-6 sm:p-8 lg:p-10"
            >
              {/* Honeypot — invisible para personas, no para bots. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute w-px h-px -m-px overflow-hidden opacity-0 pointer-events-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="contact-field" style={{ opacity: 0 }}>
                  <label htmlFor="name" className="field-label">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formState.name}
                    onChange={setField("name")}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="field-input"
                    placeholder="Alan Rosete"
                  />
                  {errors.name && (
                    <p id="name-error" className="field-error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="contact-field" style={{ opacity: 0 }}>
                  <label htmlFor="email" className="field-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formState.email}
                    onChange={setField("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="field-input"
                    placeholder="alan.rosete@company.com"
                  />
                  {errors.email && (
                    <p id="email-error" className="field-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="contact-field mt-5" style={{ opacity: 0 }}>
                <label htmlFor="message" className="field-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formState.message}
                  onChange={setField("message")}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className="field-input"
                  placeholder="Tell me about your project, timeline and budget."
                />
                {errors.message && (
                  <p id="message-error" className="field-error">
                    {errors.message}
                  </p>
                )}
              </div>

              <div
                className="contact-field mt-8 pt-8 border-t border-line flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ opacity: 0 }}
              >
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-primary justify-center w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Send message
                    </>
                  )}
                </button>

                {/* aria-live: el estado se anuncia sin mover el layout. */}
                <p
                  role="status"
                  aria-live="polite"
                  className={`text-sm ${
                    status === "error" ? "text-accent-text" : "text-text-secondary"
                  }`}
                >
                  {status === "sent" && "Thanks — I'll get back to you shortly."}
                  {status === "error" &&
                    `Couldn't send. Email me directly at ${CONTACT_EMAIL}.`}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
