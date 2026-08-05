"use client";

import "./game.css";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Link from "next/link";
import imgProfile8Bits from "../../../public/icons/iconDev8Bits.gif";

function ElectronOrbit({
  radiusX,
  radiusY,
  rotationAxis,
  rotationAngle,
  speed,
  color,
  electronColor,
}: {
  radiusX: number;
  radiusY: number;
  rotationAxis: THREE.Vector3;
  rotationAngle: number;
  speed: number;
  color: string;
  electronColor: string;
}) {
  const electronRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  const orbitLine = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * radiusX,
          Math.sin(theta) * radiusY,
          0
        )
      );
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 });
    return new THREE.Line(geo, mat);
  }, [radiusX, radiusY, color]);

  useFrame((_, delta) => {
    angleRef.current += speed * delta;

    const x = Math.cos(angleRef.current) * radiusX;
    const y = Math.sin(angleRef.current) * radiusY;

    if (electronRef.current) {
      electronRef.current.position.set(x, y, 0);
    }
    if (glowRef.current) {
      glowRef.current.position.set(x, y, 0);
    }
  });

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(rotationAxis.normalize(), rotationAngle);
    return q;
  }, [rotationAxis, rotationAngle]);

  return (
    <group quaternion={quaternion}>
      <primitive object={orbitLine} />

      {/* Electron */}
      <mesh ref={electronRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={electronColor}
          emissive={electronColor}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Electron glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.15, 100, 100]} />
        <meshBasicMaterial
          color={electronColor}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

function AtomScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.15;
      groupRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} color="#ffffff" intensity={2} />
      <pointLight position={[3, 3, 3]} color="#e8175d" intensity={1} />

      <group ref={groupRef}>
        {/* Núcleo: único punto con el acento */}
        <mesh>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial
            color="#e8175d"
            emissive="#e8175d"
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial
            color="#e8175d"
            transparent
            opacity={0.08}
          />
        </mesh>

        {/* Órbitas en gris; los electrones varían solo en tono */}
        <ElectronOrbit
          radiusX={1.4}
          radiusY={1.2}
          rotationAxis={new THREE.Vector3(0.2, 1, 0.3)}
          rotationAngle={0.4}
          speed={1.8}
          color="#474747"
          electronColor="#f8f8f8"
        />

        <ElectronOrbit
          radiusX={1.5}
          radiusY={1.1}
          rotationAxis={new THREE.Vector3(1, 0.3, 0.1)}
          rotationAngle={1.2}
          speed={1.4}
          color="#474747"
          electronColor="#a8a7a8"
        />

        <ElectronOrbit
          radiusX={1.3}
          radiusY={1.4}
          rotationAxis={new THREE.Vector3(0.5, 0.8, 1)}
          rotationAngle={2.1}
          speed={2.1}
          color="#474747"
          electronColor="#cc527a"
        />
      </group>
    </>
  );
}

function useTypewriter(lines: string[], speed = 35, lineDelay = 300) {
  const [displayedLines, setDisplayedLines] = useState<string[]>(() => 
    new Array(lines.length).fill("")
  );
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentLine >= lines.length) {
      setIsDone(true);
      return;
    }

    const line = lines[currentLine];

    if (line.length === 0 && currentChar === 0) {
      setDisplayedLines((prev) => {
        const updated = [...prev];
        updated[currentLine] = "";
        return updated;
      });
      const skipTimer = setTimeout(() => {
        setCurrentLine((l) => l + 1);
      }, lineDelay / 2);
      return () => clearTimeout(skipTimer);
    }

    if (currentChar === 0 && currentLine > 0) {
      const lineTimer = setTimeout(() => {
        setCurrentChar(1);
      }, lineDelay);
      return () => clearTimeout(lineTimer);
    }

    if (currentChar <= line.length) {
      const charTimer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLine] = line.slice(0, currentChar);
          return updated;
        });
        setCurrentChar((c) => c + 1);
      }, speed);
      return () => clearTimeout(charTimer);
    } else {
      setCurrentLine((l) => l + 1);
      setCurrentChar(0);
    }
  }, [currentLine, currentChar, lines, speed, lineDelay]);

  const visibleLines = displayedLines.slice(0, currentLine + (isDone ? 0 : 1));

  return { displayedLines: visibleLines, isDone };
}

const NEOFETCH_LINES = [
  "alan@portfolio",
  "───────────────────────",
  "OS        Alan OS v3.0 LTS",
  "Host      portfolio.dev",
  "Kernel    frontend-core 3.2.1",
  "Uptime    3 years, 6 months",
  "Packages  47 (npm)",
  "Shell     zsh 5.9",
  "Resolution 1920x1080",
  "DE        VS Code",
  "WM        Chrome 120",
  "Terminal  Hyper",
  "CPU       Coffee-powered @ 3.0GHz",
  "Memory    1337MB / ∞",
];

// Rampa de grises + el acento al final, como una paleta de terminal sobria
const NEOFETCH_COLORS = [
  "#141414", "#2e2e2e", "#474747", "#898989",
  "#a8a7a8", "#f8f8f8", "#cc527a", "#e8175d",
];

function NeofetchPanel() {
  const { displayedLines, isDone } = useTypewriter(NEOFETCH_LINES, 25, 120);

  return (
    <div className="neofetch-panel">
      <div className="neofetch-content">
        {displayedLines.map((line, i) => (
          <div key={i} className="neofetch-line">
            {i === 0 ? (
              <span className="neofetch-user">
                <span style={{ color: "#f8f8f8" }}>alan</span>
                <span style={{ color: "#898989" }}>@</span>
                <span style={{ color: "#ef4a7b" }}>portfolio</span>
              </span>
            ) : i === 1 ? (
              <span className="neofetch-separator">{line}</span>
            ) : (
              <>
                <span className="neofetch-key">
                  {line.split(/\s{2,}/)[0]}
                </span>
                <span className="neofetch-value">
                  {line.split(/\s{2,}/).slice(1).join(" ")}
                </span>
              </>
            )}
          </div>
        ))}

        {!isDone && <span className="terminal-cursor">▋</span>}

        {isDone && (
          <div className="neofetch-colors">
            <div className="color-row">
              {NEOFETCH_COLORS.map((c, i) => (
                <div key={i} className="color-block" style={{ background: c }} />
              ))}
            </div>
            <div className="color-row">
              {NEOFETCH_COLORS.map((c, i) => (
                <div key={i} className="color-block" style={{ background: c, opacity: 0.5 }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CODE_LINES = [
  'const ProfileCard = () => {',
  '  const [status] = useState("available");',
  '',
  '  return (',
  '    <Card className="glass-profile">',
  '      <Avatar src="/alan.jpg" />',
  '      <Badge status={status} />',
  '      <h3>Alan Rosete</h3>',
  '      <p>Frontend Developer</p>',
  '      <DownloadCV />',
  '    </Card>',
  '  );',
  '};',
];

function LiveTerminal() {
  const { displayedLines, isDone } = useTypewriter(CODE_LINES, 30, 150);
  const [showRender, setShowRender] = useState(false);

  useEffect(() => {
    if (isDone) {
      const timer = setTimeout(() => setShowRender(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isDone]);

  return (
    <div className="live-terminal">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="terminal-title">~/portfolio/ProfileCard.tsx</span>
        <div style={{ width: 52 }} />
      </div>

      <div className="terminal-body">
        <div className="code-area">
          {displayedLines.map((line, i) => (
            <div key={i} className="code-line">
              <span className="line-number">{i + 1}</span>
              <span className="code-text">
                <CodeHighlight line={line} />
              </span>
            </div>
          ))}
          {!isDone && (
            <div className="code-line">
              <span className="line-number">{displayedLines.length + 1}</span>
              <span className="terminal-cursor">▋</span>
            </div>
          )}
        </div>

        {isDone && (
          <div className="render-separator">
            <span className="render-arrow">▼</span>
            <span className="render-label">Live Output</span>
            <span className="render-arrow">▼</span>
          </div>
        )}

        {showRender && (
          <div className="render-output animate-fade-in-up">
            <ProfileCardRendered />
          </div>
        )}
      </div>
    </div>
  );
}

function CodeHighlight({ line }: { line: string }) {
  if (!line) return <span>&nbsp;</span>;

  const tokens: { text: string; type: string }[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    let matched = false;

    const kwMatch = remaining.match(/^(const|return|useState|import|from|export|default|function)\b/);
    if (kwMatch) {
      tokens.push({ text: kwMatch[0], type: "keyword" });
      remaining = remaining.slice(kwMatch[0].length);
      matched = true;
      continue;
    }

    const strMatch = remaining.match(/^"[^"]*"/);
    if (strMatch) {
      tokens.push({ text: strMatch[0], type: "string" });
      remaining = remaining.slice(strMatch[0].length);
      matched = true;
      continue;
    }

    const tagMatch = remaining.match(/^(<\/?[A-Z]\w*|<\/?[a-z]\w*)/);
    if (tagMatch) {
      tokens.push({ text: tagMatch[0], type: "tag" });
      remaining = remaining.slice(tagMatch[0].length);
      matched = true;
      continue;
    }

    const closeMatch = remaining.match(/^\/>/);
    if (closeMatch) {
      tokens.push({ text: closeMatch[0], type: "tag" });
      remaining = remaining.slice(closeMatch[0].length);
      matched = true;
      continue;
    }

    const arrowMatch = remaining.match(/^=>/);
    if (arrowMatch) {
      tokens.push({ text: arrowMatch[0], type: "keyword" });
      remaining = remaining.slice(arrowMatch[0].length);
      matched = true;
      continue;
    }

    if ('{}()[]'.includes(remaining[0])) {
      tokens.push({ text: remaining[0], type: "brace" });
      remaining = remaining.slice(1);
      matched = true;
      continue;
    }

    if (remaining[0] === '>' || remaining[0] === '<') {
      tokens.push({ text: remaining[0], type: "tag" });
      remaining = remaining.slice(1);
      matched = true;
      continue;
    }

    if (!matched) {
      const plainMatch = remaining.match(/^[^<>"{}()[\]=>]+/);
      if (plainMatch) {
        tokens.push({ text: plainMatch[0], type: "plain" });
        remaining = remaining.slice(plainMatch[0].length);
      } else {
        tokens.push({ text: remaining[0], type: "plain" });
        remaining = remaining.slice(1);
      }
    }
  }

  // Debe coincidir con las clases .syn-* de game.css
  const colorMap: Record<string, string> = {
    keyword: "#d97f9c",
    string: "#a8a7a8",
    tag: "#ef4a7b",
    brace: "#898989",
    plain: "inherit",
  };

  return (
    <span>
      {tokens.map((token, i) => (
        <span key={i} style={{ color: colorMap[token.type] || "inherit", fontWeight: token.type === "keyword" ? 600 : undefined }}>
          {token.text}
        </span>
      ))}
    </span>
  );
}

function ProfileCardRendered() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="profile-card glass">
      <div className="profile-card-inner">
        {/* Avatar */}
        <div className="profile-avatar">
          <img src={imgProfile8Bits.src} width={80} height={80} alt="" />
        </div>

        {/* Info */}
        <div className="profile-info">
          <h3 className="profile-name">Alan Rosete</h3>
          <p className="profile-role">Frontend Developer</p>
          <p className="profile-open">Open to new opportunities</p>
        </div>
      </div>

      <a
        href="/PDF/Alan Rosete Front CV.pdf"
        download
        className="cv-download-btn"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <svg
          className="cv-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="18"
          height="18"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download CV
        {hovered && <span className="cv-shimmer" />}
      </a>
    </div>
  );
}

export default function GamePage() {
  return (
    <div className="neofetch-page">
      <header className="neofetch-topbar glass-strong">
        <Link
          href="/"
          className="back-link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Portfolio
        </Link>

        <div className="topbar-tag">
          <span className="tag-dot" />
          terminal v1.0
        </div>
      </header>

      <main className="neofetch-main">
        <div className="neofetch-row">
          <div className="atom-container">
            <Canvas
              camera={{ position: [0, 0, 4], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              style={{ background: "transparent" }}
            >
              <AtomScene />
            </Canvas>
          </div>
          <NeofetchPanel />
        </div>
        <LiveTerminal />
      </main>
    </div>
  );
}
