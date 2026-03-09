"use client";

import React from "react";
import dynamic from "next/dynamic";
import Header from "@/components/UI/Header";
import Footer from "@/components/UI/Footer";
import Modal from "@/components/UI/Modal";
import LoadingScreen from "@/components/UI/LoadingScreen";
import SmoothScroll from "@/components/UI/SmoothScroll";

const HeroSection = dynamic(
  () => import("@/components/Sections/HeroSection"),
  { ssr: false }
);
const ProjectsSection = dynamic(
  () => import("@/components/Sections/ProjectsSection"),
  { ssr: false }
);
const AboutSection = dynamic(
  () => import("@/components/Sections/AboutSection"),
  { ssr: false }
);
const ContactSection = dynamic(
  () => import("@/components/Sections/ContactSection"),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      <LoadingScreen />
      <Header />
      <SmoothScroll>
        <main>
          <HeroSection />
          <ProjectsSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
      </SmoothScroll>
      <Modal />
    </>
  );
}
