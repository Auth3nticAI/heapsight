"use client";

import { useState, useEffect } from "react";

// Boostify Design Tokens (extracted from Figma CSS)
const T = {
  bg: "#040B10",
  surface: "#071528",
  accent: "#246BFD",
  accentDark: "#0040C3",
  accentGrad: "linear-gradient(95.02deg, #246BFD 13.23%, #0040C3 81.63%)",
  btnShadow: "4px 8px 24px rgba(36, 107, 253, 0.25)",
  dashShadow: "0px 44px 244px -70px rgba(36, 107, 253, 0.8)",
  headingGrad: "radial-gradient(50% 50% at 50% 50%, #FFFFFF 30%, rgba(197, 220, 255, 0.6) 84.77%)",
  sectionGrad: "radial-gradient(45.13% 50.23% at 50% 50%, #FFFFFF 30%, rgba(255, 255, 255, 0.5) 84.77%)",
  white: "#FFFFFF",
  muted: "#AFBCD5",
  logo: "#E7DEFE",
  border: "rgba(255, 255, 255, 0.16)",
  borderLight: "rgba(255, 255, 255, 0.05)",
  green: "#9CD323",
  star: "#F9D006",
  btnRadius: "30px",
  cardRadius: "12px",
  surfaceLight: "rgba(255, 255, 255, 0.05)",
  accentBg: "rgba(36, 107, 253, 0.05)",
  accentBg10: "rgba(36, 107, 253, 0.1)",
};

const GradientText = ({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <span
    style={{
      background: T.headingGrad,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      ...style,
    }}
  >
    {children}
  </span>
);

const PillButton = ({
  children,
  primary = true,
  style = {},
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  primary?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    className={className}
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "16px 24px",
      borderRadius: T.btnRadius,
      border: primary ? "none" : `1px solid ${T.border}`,
      background: primary ? T.accentGrad : "transparent",
      color: T.white,
      cursor: "pointer",
      fontFamily: "Satoshi, sans-serif",
      fontWeight: 500,
      fontSize: "18px",
      lineHeight: "24px",
      boxShadow: primary ? T.btnShadow : "none",
      transition: "all 0.3s ease",
      ...style,
    }}
  >
    {children}
  </button>
);

const CheckItem = ({
  children,
  checked = true,
}: {
  children: React.ReactNode;
  checked?: boolean;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
    <div
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        background: checked ? T.green : T.muted,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
        <path
          d={checked ? "M1 5L4.5 8.5L11 1.5" : "M3 3L9 9M9 3L3 9"}
          stroke={T.bg}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span
      style={{
        fontFamily: "Satoshi, sans-serif",
        fontWeight: 500,
        fontSize: "18px",
        lineHeight: "150%",
        letterSpacing: "-0.02em",
        color: checked ? T.white : T.muted,
      }}
    >
      {children}
    </span>
  </div>
);

const SectionLabel = ({
  children,
  className = "hs-sec-label",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={className}
    style={{
      fontFamily: "Satoshi, sans-serif",
      fontWeight: 700,
      fontSize: "20px",
      lineHeight: "150%",
      textAlign: "center",
      letterSpacing: "-0.02em",
      textTransform: "uppercase",
      color: T.accent,
      marginBottom: "12px",
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({
  children,
  className = "hs-sec-title",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2
    className={className}
    style={{
      fontFamily: "Satoshi, sans-serif",
      fontWeight: 700,
      fontSize: "40px",
      lineHeight: "150%",
      textAlign: "center",
      letterSpacing: "-0.03em",
      margin: "0 0 8px 0",
    }}
  >
    <GradientText>{children}</GradientText>
  </h2>
);

const SectionDesc = ({
  children,
  className = "hs-sec-desc",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p
    className={className}
    style={{
      fontFamily: "Satoshi, sans-serif",
      fontWeight: 400,
      fontSize: "20px",
      lineHeight: "150%",
      textAlign: "center",
      letterSpacing: "-0.01em",
      color: T.muted,
      margin: "0",
      maxWidth: "568px",
      marginLeft: "auto",
      marginRight: "auto",
    }}
  >
    {children}
  </p>
);

const CodeDemo = () => {
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const i = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(i);
  }, []);

  return (
    <div
      style={{
        background: T.bg,
        borderRadius: "13px",
        border: `1px solid ${T.accent}`,
        boxShadow: T.dashShadow,
        overflow: "hidden",
      }}
    >
      {/* macOS title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          background: T.accentBg,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28ca42" }} />
        </div>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: "rgba(160,181,255,0.4)",
            fontFamily: "monospace",
          }}
        >
          lesson-01.cpp
        </span>
      </div>

      {/* Code + Live Preview split */}
      <div
        className="hs-code-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 200px", minHeight: "280px" }}
      >
        <pre
          className="hs-code-pre"
          style={{
            padding: "20px 24px",
            margin: 0,
            fontSize: "13px",
            lineHeight: 1.85,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: "#c9d1d9",
            overflow: "hidden",
            background: T.bg,
          }}
        >
          <span style={{ color: "#596780" }}>{"// Lesson 1: Boot the Starfield"}</span>
          {"\n"}
          <span style={{ color: "#c084fc" }}>{"void"}</span>{" "}
          <span style={{ color: "#60a5fa" }}>{"UpdateDrawFrame"}</span>(
          <span style={{ color: "#c084fc" }}>{"void"}</span>) {"{"}{"\n"}
          {"  "}
          <span style={{ color: "#60a5fa" }}>{"BeginDrawing"}</span>();{"\n"}
          {"  "}
          <span style={{ color: "#60a5fa" }}>{"ClearBackground"}</span>(
          <span style={{ color: T.muted }}>{"BLACK"}</span>);{"\n\n"}
          {"  "}
          <span style={{ color: "#c084fc" }}>{"for"}</span> (
          <span style={{ color: "#c084fc" }}>{"int"}</span>{" "}
          <span style={{ color: "#e2e8f0" }}>{"i"}</span>=
          <span style={{ color: T.star }}>{"0"}</span>; {"i<"}
          <span style={{ color: T.star }}>{"80"}</span>; {"i++"}) {"{"}{"\n"}
          {"    "}{"stars[i].y += stars[i].speed;"}{"\n"}
          {"    "}
          <span style={{ color: "#60a5fa" }}>{"DrawPixel"}</span>({"stars[i].x,"}{"\n"}
          {"              "}{"stars[i].y, "}
          <span style={{ color: "#4ade80" }}>{"WHITE"}</span>);{"\n"}
          {"  "}{"}"}{"\n"}
          {"  "}
          <span style={{ color: "#60a5fa" }}>{"EndDrawing"}</span>();{"\n"}
          {"}"}<span style={{ opacity: showCursor ? 1 : 0, color: T.accent }}>{"▊"}</span>
        </pre>

        <div
          className="hs-code-preview"
          style={{
            background: "rgba(0,0,0,0.4)",
            borderLeft: `1px solid ${T.borderLight}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "160px",
              height: "200px",
              background: "#000",
              borderRadius: "4px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: i % 3 === 0 ? "2px" : "1px",
                  height: i % 3 === 0 ? "2px" : "1px",
                  background: i % 5 === 0 ? "#60a5fa" : "#fff",
                  left: `${(i * 41 + 7) % 155}px`,
                  top: `${(i * 29 + 13) % 195}px`,
                  opacity: 0.3 + (i % 4) * 0.2,
                  animation: `starfall ${1.5 + (i % 3) * 0.5}s linear infinite`,
                  animationDelay: `${(i * 0.1) % 2}s`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  background: T.accent,
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  filter: `drop-shadow(0 0 6px ${T.accent})`,
                }}
              />
            </div>
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "rgba(160,181,255,0.3)",
              marginTop: "8px",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Live Preview
          </div>
        </div>
      </div>

      <style>{`@keyframes starfall { from { transform: translateY(-10px); opacity: 0; } 20% { opacity: 1; } to { transform: translateY(200px); opacity: 0; } }`}</style>
    </div>
  );
};

export default function HeapSightLanding() {
  const [hoveredPath, setHoveredPath] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number>(0);

  const paths = [
    {
      emoji: "🚀",
      name: "Space Shooter",
      tier: "Beginner",
      paradigm: "ECS Architecture",
      color: "#8b5cf6",
      desc: "Data-oriented design, entity batching, spatial partitioning",
    },
    {
      emoji: "⚡",
      name: "Platformer",
      tier: "Intermediate",
      paradigm: "State Machines",
      color: "#f59e0b",
      desc: "Physics simulation, collision resolution, game feel engineering",
    },
    {
      emoji: "⚔️",
      name: "Simple RPG",
      tier: "Advanced",
      paradigm: "Data-Driven OOP",
      color: "#10b981",
      desc: "Command pipelines, event systems, inventory architecture",
    },
    {
      emoji: "🏰",
      name: "Dungeon Crawler",
      tier: "Expert",
      paradigm: "3D Spatial Math",
      color: "#06b6d4",
      desc: "Camera math, raycasting, lighting, procedural generation",
    },
  ];

  const benefits = [
    {
      num: "1",
      title: "Write Real C++",
      desc: "Not pseudocode, not blocks. The same language powering Unreal Engine, compiled to WASM in your browser.",
    },
    {
      num: "2",
      title: "See It Run Instantly",
      desc: "Every lesson produces visible output. Ships move, bullets fire, dungeons render — all in your browser.",
    },
    {
      num: "3",
      title: "Ship Portfolio Projects",
      desc: "Export to GitHub with progressive commits. Employers see months of consistent development activity.",
    },
  ];

  const faqs = [
    {
      q: "What programming experience do I need?",
      a: "None for the Space Shooter path — it starts from absolute zero. The Platformer assumes basic familiarity, RPG expects intermediate skills, and Dungeon Crawler is for experienced developers.",
    },
    {
      q: "How does the browser compiler work?",
      a: "Your C++ code is sent to our cloud compiler (Emscripten + raylib), compiled to WebAssembly, and runs instantly in your browser. No local installs needed.",
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes, cancel anytime. Your progress is saved and you keep access to free-tier lessons. Resubscribe to pick up where you left off.",
    },
    {
      q: "Is there a free trial available?",
      a: "Lessons 1-5 on every path are completely free — no credit card required. That's 20 lessons across all 4 paths to try before committing.",
    },
  ];

  const journey = [
    { l: "L1", s: "Boot Starfield", p: "Boot & Gravity", r: "Boot Dungeon Grid", c: "Boot Dungeon 3D" },
    { l: "L5", s: "First Bullet", p: "Accel & Friction", r: "Turn Pipeline", c: "Multi-Room Map" },
    { l: "L10", s: "Enemy Waves", p: "Wall Jump", r: "Micro Dungeon", c: "Explorable Dungeon" },
    {
      l: "L30",
      s: "Heap Freeze Gate",
      p: "Heap Freeze Gate",
      r: "Heap Freeze Gate",
      c: "Heap Freeze Gate",
    },
    {
      l: "L100",
      s: "Portfolio Ship 🎓",
      p: "Portfolio Ship 🎓",
      r: "Portfolio Ship 🎓",
      c: "Portfolio Ship 🎓",
    },
  ];

  return (
    <div
      style={{
        fontFamily: "Satoshi, -apple-system, sans-serif",
        background: T.bg,
        color: T.white,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ===== RESPONSIVE STYLES ===== */}
      <style>{`
        /* --- TABLET: 641px – 1024px --- */
        @media (min-width: 641px) and (max-width: 1024px) {
          .hs-nav { padding: 0 48px !important; }
          .hs-nav-links { display: none !important; }
          .hs-hero { padding: 80px 48px 60px !important; }
          .hs-hero-title { font-size: 52px !important; }
          .hs-hero-sub { font-size: 20px !important; }
          .hs-section-pad { padding-left: 48px !important; padding-right: 48px !important; }
          .hs-metrics-heading { font-size: 36px !important; }
          .hs-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hs-sec-title { font-size: 36px !important; }
          .hs-sec-desc { font-size: 18px !important; }
          .hs-benefits-grid { gap: 48px !important; }
          .hs-paths-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hs-journey-scroll { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
          .hs-journey-card { min-width: 700px !important; overflow: visible !important; }
          .hs-footer { padding: 80px 48px 60px !important; }
          .hs-footer-grid { grid-template-columns: 1fr 1fr 1fr !important; gap: 40px !important; }
          .hs-footer-brand { grid-column: 1 / -1 !important; }
        }

        /* --- MOBILE: ≤640px --- */
        @media (max-width: 640px) {
          /* Nav */
          .hs-nav { padding: 0 20px !important; height: 64px !important; }
          .hs-nav-links { display: none !important; }
          .hs-nav-login-btn { display: none !important; }
          .hs-logo-text { font-size: 20px !important; }

          /* Hero */
          .hs-hero { padding: 60px 20px 40px !important; }
          .hs-hero-content { gap: 32px !important; width: 100% !important; }
          .hs-hero-headline-group { max-width: 100% !important; }
          .hs-hero-title { font-size: 36px !important; line-height: 120% !important; }
          .hs-hero-sub { font-size: 18px !important; max-width: 100% !important; }
          .hs-hero-cta-group { width: 100% !important; align-items: stretch !important; }
          .hs-hero-cta-btn { width: 100% !important; height: 48px !important; font-size: 16px !important; box-sizing: border-box !important; }
          .hs-hero-stars-text { font-size: 11px !important; }

          /* Code demo */
          .hs-code-grid { grid-template-columns: 1fr !important; }
          .hs-code-pre { font-size: 11px !important; padding: 16px !important; }
          .hs-code-preview { height: 180px !important; border-left: none !important; border-top: 1px solid rgba(255,255,255,0.05) !important; }

          /* Section padding */
          .hs-section-pad {
            padding-left: 20px !important;
            padding-right: 20px !important;
            padding-top: 48px !important;
            padding-bottom: 48px !important;
          }

          /* Metrics */
          .hs-metrics-heading { font-size: 28px !important; margin-bottom: 32px !important; }
          .hs-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .hs-stat-card { padding: 20px !important; }
          .hs-stat-num { font-size: 32px !important; }

          /* Section headers */
          .hs-sec-label { font-size: 16px !important; }
          .hs-sec-title { font-size: 28px !important; }
          .hs-sec-desc { font-size: 16px !important; }
          .hs-section-header { margin-bottom: 40px !important; }

          /* Benefits */
          .hs-benefits-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hs-benefit-num { width: 40px !important; height: 40px !important; min-width: 40px !important; }
          .hs-benefit-title { font-size: 20px !important; }
          .hs-benefit-desc { font-size: 14px !important; }

          /* Paths */
          .hs-paths-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .hs-path-card { padding: 24px !important; }
          .hs-path-name { font-size: 20px !important; }

          /* Journey table */
          .hs-journey-scroll { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
          .hs-journey-card { min-width: 700px !important; overflow: visible !important; }
          .hs-journey-header { font-size: 13px !important; }
          .hs-journey-row { font-size: 13px !important; }

          /* Pricing */
          .hs-pricing-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .hs-pricing-btn { width: 100% !important; }

          /* FAQ */
          .hs-faq-item { padding: 24px 0 !important; }
          .hs-faq-q-row { gap: 16px !important; }
          .hs-faq-inner { gap: 24px !important; }
          .hs-faq-num { font-size: 18px !important; min-width: 24px !important; }
          .hs-faq-q { font-size: 18px !important; }
          .hs-faq-icon { width: 18px !important; height: 18px !important; }
          .hs-faq-icon-v { height: 18px !important; }
          .hs-faq-icon-h { width: 18px !important; }
          .hs-faq-ans { margin-left: 0 !important; font-size: 16px !important; }

          /* CTA */
          .hs-cta-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .hs-cta-title { font-size: 32px !important; }
          .hs-cta-desc { font-size: 16px !important; }
          .hs-cta-deco { display: none !important; }
          .hs-cta-btn { width: 100% !important; }

          /* Footer */
          .hs-footer { padding: 60px 20px 40px !important; }
          .hs-footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
          .hs-footer-brand { grid-column: 1 / -1 !important; }
          .hs-footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 16px !important;
          }
          .hs-footer-bottom-links { justify-content: center !important; }
        }
      `}</style>

      {/* ===== NAV ===== */}
      <nav
        className="hs-nav"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 120px",
          height: "100px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: T.accentGrad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "16px", fontWeight: 900, color: T.white }}>H</span>
          </div>
          <span
            className="hs-logo-text"
            style={{
              fontSize: "24px",
              fontWeight: 700,
              lineHeight: "80%",
              letterSpacing: "-0.03em",
              color: T.logo,
            }}
          >
            HeapSight
          </span>
        </div>

        <div
          className="hs-nav-links"
          style={{ display: "flex", gap: "40px", alignItems: "center" }}
        >
          {["Features", "Paths", "Pricing", "FAQ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: T.muted,
                textDecoration: "none",
                fontSize: "16px",
                lineHeight: "22px",
              }}
            >
              {item}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <PillButton
            className="hs-nav-login-btn"
            primary={false}
            style={{ height: "56px" }}
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </PillButton>
          <PillButton
            style={{ height: "56px" }}
            onClick={() => (window.location.href = "/signup")}
          >
            Get Started Free
          </PillButton>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section
        className="hs-hero"
        style={{
          padding: "120px 120px 80px",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        <div
          className="hs-hero-content"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "48px",
          }}
        >
          <div
            className="hs-hero-headline-group"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              maxWidth: "972px",
            }}
          >
            <h1
              className="hs-hero-title"
              style={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: "76px",
                lineHeight: "120%",
                textAlign: "center",
                margin: 0,
              }}
            >
              <GradientText>Master C++ by Building Real Games</GradientText>
            </h1>
            <p
              className="hs-hero-sub"
              style={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 400,
                fontSize: "24px",
                lineHeight: "160%",
                textAlign: "center",
                color: T.muted,
                maxWidth: "654px",
                margin: 0,
              }}
            >
              4 paths from absolute beginner to 3D engine builder. Write C++ in your browser, see it
              run instantly, ship portfolio projects.
            </p>
          </div>

          <div
            className="hs-hero-cta-group"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <PillButton
              className="hs-hero-cta-btn"
              style={{ height: "56px", fontSize: "18px" }}
              onClick={() => (window.location.href = "/signup")}
            >
              <span style={{ fontSize: "20px" }}>⚡</span> Start Free — Lessons 1-5
            </PillButton>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} width="24" height="24" viewBox="0 0 24 24">
                    <path
                      d="M12 3L14.5 8.5L21 9.5L16.5 14L17.5 21L12 17.5L6.5 21L7.5 14L3 9.5L9.5 8.5L12 3Z"
                      fill={T.star}
                    />
                  </svg>
                ))}
              </div>
              <span
                className="hs-hero-stars-text"
                style={{ fontSize: "12px", lineHeight: "16px", color: T.white }}
              >
                No credit card · No installs
              </span>
            </div>
          </div>
        </div>

        {/* Code Demo card */}
        <div
          style={{
            marginTop: "80px",
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <CodeDemo />
        </div>
      </section>

      {/* ===== METRICS BAR ===== */}
      <section
        className="hs-section-pad"
        style={{ padding: "60px 120px", maxWidth: "1440px", margin: "0 auto" }}
      >
        <h3
          className="hs-metrics-heading"
          style={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: "40px",
            lineHeight: "150%",
            textAlign: "center",
            letterSpacing: "-0.03em",
            margin: "0 0 48px 0",
          }}
        >
          <GradientText
            style={{
              background: T.sectionGrad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            4 Paradigms. 400+ Lessons. 100% Browser.
          </GradientText>
        </h3>
        <div
          className="hs-metrics-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}
        >
          {(
            [
              ["400+", "Lessons"],
              ["4", "Unique Paths"],
              ["0", "Setup Required"],
              ["100%", "Portfolio Ready"],
            ] as const
          ).map(([val, label], i) => (
            <div
              key={i}
              className="hs-stat-card"
              style={{
                background: T.surface,
                borderRadius: T.cardRadius,
                padding: "32px",
                textAlign: "center",
              }}
            >
              <div
                className="hs-stat-num"
                style={{
                  fontSize: "40px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: T.white,
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: T.muted,
                  letterSpacing: "-0.02em",
                  marginTop: "4px",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section
        id="features"
        className="hs-section-pad"
        style={{ padding: "80px 120px", maxWidth: "1440px", margin: "0 auto" }}
      >
        <div className="hs-section-header" style={{ textAlign: "center", marginBottom: "64px" }}>
          <SectionLabel>Benefits</SectionLabel>
          <SectionTitle>Why Choose HeapSight?</SectionTitle>
          <SectionDesc>
            See how HeapSight makes learning C++ engaging, effective, and career-ready.
          </SectionDesc>
        </div>

        <div
          className="hs-benefits-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
        >
          {/* Left: benefit items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "44px" }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
                <div
                  className="hs-benefit-num"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: T.cardRadius,
                    background: T.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: T.white, fontWeight: 700, fontSize: "20px" }}>{b.num}</span>
                </div>
                <div>
                  <h3
                    className="hs-benefit-title"
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      lineHeight: "150%",
                      letterSpacing: "-0.03em",
                      color: T.white,
                      margin: "0 0 12px 0",
                    }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="hs-benefit-desc"
                    style={{
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "150%",
                      letterSpacing: "-0.02em",
                      color: T.muted,
                      margin: 0,
                    }}
                  >
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: comparison card */}
          <div
            style={{
              background: T.accent,
              borderRadius: T.cardRadius,
              padding: "32px",
              position: "relative",
            }}
          >
            <div style={{ background: T.surface, borderRadius: "8px", padding: "28px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#ef4444",
                  letterSpacing: "0.5px",
                  marginBottom: "16px",
                }}
              >
                OTHER PLATFORMS
              </div>
              {["Hello World", "FizzBuzz", "Linked List homework", "??? (70% dropout)"].map(
                (t, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "16px",
                      color: i === 3 ? "rgba(175,188,213,0.4)" : T.muted,
                      padding: "8px 0",
                      borderBottom: i < 3 ? `1px solid ${T.borderLight}` : "none",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    ✕ {t}
                  </div>
                )
              )}
            </div>
            <div
              style={{ background: T.bg, borderRadius: "8px", padding: "28px", marginTop: "16px" }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: T.accent,
                  letterSpacing: "0.5px",
                  marginBottom: "16px",
                }}
              >
                HEAPSIGHT
              </div>
              {[
                "Starfield renders in browser",
                "Ship moves with keyboard",
                "Bullets fire and hit enemies",
                "Full game with waves + score",
                "Portfolio project on GitHub",
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "16px",
                    color: T.white,
                    padding: "8px 0",
                    borderBottom: i < 4 ? `1px solid ${T.borderLight}` : "none",
                    letterSpacing: "-0.02em",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: T.green }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4 LEARNING PATHS ===== */}
      <section
        id="paths"
        className="hs-section-pad"
        style={{ padding: "80px 120px", maxWidth: "1440px", margin: "0 auto" }}
      >
        <div className="hs-section-header" style={{ textAlign: "center", marginBottom: "64px" }}>
          <SectionLabel>Learning Paths</SectionLabel>
          <SectionTitle>4 Paths. 4 Paradigms. Not Reskins.</SectionTitle>
          <SectionDesc>
            Each path teaches fundamentally different architecture. Same language, completely different
            thinking.
          </SectionDesc>
        </div>

        <div
          className="hs-paths-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}
        >
          {paths.map((p, i) => (
            <div
              key={i}
              className="hs-path-card"
              onMouseEnter={() => setHoveredPath(i)}
              onMouseLeave={() => setHoveredPath(null)}
              style={{
                background: T.surface,
                borderRadius: T.cardRadius,
                padding: "32px",
                border: hoveredPath === i ? `1px solid ${p.color}40` : `1px solid transparent`,
                transition: "all 0.3s",
                cursor: "pointer",
                boxShadow: hoveredPath === i ? `0 8px 32px ${p.color}15` : "none",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>{p.emoji}</div>
              <h3
                className="hs-path-name"
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: T.white,
                  margin: "0 0 4px 0",
                }}
              >
                {p.name}
              </h3>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: p.color,
                  letterSpacing: "-0.02em",
                  marginBottom: "4px",
                }}
              >
                {p.paradigm}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: T.muted,
                  letterSpacing: "-0.02em",
                  marginBottom: "16px",
                }}
              >
                {p.tier} · 100 lessons
              </div>
              <p
                style={{
                  fontSize: "16px",
                  color: T.muted,
                  lineHeight: "150%",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== JOURNEY TABLE (HOW IT WORKS) ===== */}
      <section
        className="hs-section-pad"
        style={{ padding: "80px 120px", maxWidth: "1440px", margin: "0 auto" }}
      >
        <div className="hs-section-header" style={{ textAlign: "center", marginBottom: "64px" }}>
          <SectionLabel>How It Works</SectionLabel>
          <SectionTitle>Same Milestone. Different Paradigm.</SectionTitle>
          <SectionDesc>
            Follow the path that fits your level. Each one builds a complete, portfolio-ready project.
          </SectionDesc>
        </div>

        {/* Scroll wrapper for tablet/mobile */}
        <div className="hs-journey-scroll">
          <div
            className="hs-journey-card"
            style={{ background: T.surface, borderRadius: T.cardRadius, overflow: "hidden" }}
          >
            {/* Header row */}
            <div
              className="hs-journey-header"
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 1fr 1fr 1fr",
                fontSize: "14px",
                fontWeight: 700,
                color: T.muted,
                padding: "16px 24px",
                borderBottom: `1px solid ${T.border}`,
                letterSpacing: "-0.02em",
              }}
            >
              <div />
              <div>🚀 Shooter</div>
              <div>⚡ Platformer</div>
              <div>⚔️ RPG</div>
              <div>🏰 Crawler</div>
            </div>

            {journey.map((row, i) => (
              <div
                key={i}
                className="hs-journey-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 1fr 1fr 1fr",
                  fontSize: "16px",
                  padding: "14px 24px",
                  letterSpacing: "-0.02em",
                  borderBottom: i < journey.length - 1 ? `1px solid ${T.borderLight}` : "none",
                  background: i === journey.length - 1 ? T.accentBg : "transparent",
                }}
              >
                <div style={{ color: T.accent, fontWeight: 700, fontFamily: "monospace" }}>
                  {row.l}
                </div>
                <div style={{ color: T.muted }}>{row.s}</div>
                <div style={{ color: T.muted }}>{row.p}</div>
                <div style={{ color: T.muted }}>{row.r}</div>
                <div style={{ color: T.muted }}>{row.c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section
        id="pricing"
        className="hs-section-pad"
        style={{ padding: "80px 120px", maxWidth: "1440px", margin: "0 auto" }}
      >
        <div className="hs-section-header" style={{ textAlign: "center", marginBottom: "64px" }}>
          <SectionLabel>Pricing</SectionLabel>
          <SectionTitle>Simple, Transparent Pricing</SectionTitle>
          <SectionDesc>Start free. Upgrade when you&apos;re hooked. Cancel anytime.</SectionDesc>
        </div>

        <div
          className="hs-pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Free tier */}
          <div
            style={{
              background: T.surface,
              borderRadius: T.cardRadius,
              padding: "32px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: T.accentBg10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: T.accent, fontSize: "16px" }}>♡</span>
              </div>
              <span style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em" }}>
                Free
              </span>
            </div>
            <div
              style={{
                fontSize: "16px",
                color: T.muted,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
              }}
            >
              Perfect to try it out
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "40px", fontWeight: 700, letterSpacing: "-0.03em" }}>$0</span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: T.muted,
                  letterSpacing: "-0.02em",
                  marginLeft: "4px",
                }}
              >
                /forever
              </span>
            </div>
            <p
              style={{
                fontSize: "16px",
                color: T.muted,
                lineHeight: "150%",
                letterSpacing: "-0.02em",
                marginBottom: "32px",
              }}
            >
              Try 5 lessons on every path. No credit card required.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                marginBottom: "auto",
                paddingBottom: "32px",
              }}
            >
              <CheckItem>5 lessons per path</CheckItem>
              <CheckItem>All 4 paths accessible</CheckItem>
              <CheckItem>Browser C++ compiler</CheckItem>
              <CheckItem>Automated test validation</CheckItem>
              <CheckItem checked={false}>AI error explainer</CheckItem>
            </div>
            <PillButton
              className="hs-pricing-btn"
              style={{ width: "100%", height: "52px", fontSize: "16px", fontWeight: 700 }}
              onClick={() => (window.location.href = "/signup")}
            >
              Get Started
            </PillButton>
          </div>

          {/* Pro Monthly — Most Popular */}
          <div
            style={{
              background: T.surface,
              borderRadius: T.cardRadius,
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: T.accentGrad,
                borderRadius: T.btnRadius,
                padding: "4px 16px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: T.white,
                }}
              >
                Most Popular
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: T.accentBg10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: T.accent, fontSize: "16px" }}>♛</span>
              </div>
              <span style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em" }}>
                Pro
              </span>
            </div>
            <div
              style={{
                fontSize: "16px",
                color: T.muted,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
              }}
            >
              For serious learners building skills
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "40px", fontWeight: 700, letterSpacing: "-0.03em" }}>
                $29
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: T.muted,
                  letterSpacing: "-0.02em",
                  marginLeft: "4px",
                }}
              >
                /month
              </span>
            </div>
            <p
              style={{
                fontSize: "16px",
                color: T.muted,
                lineHeight: "150%",
                letterSpacing: "-0.02em",
                marginBottom: "32px",
              }}
            >
              Full access to all lessons, AI tutoring, and portfolio export.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                marginBottom: "auto",
                paddingBottom: "32px",
              }}
            >
              <CheckItem>All 400+ lessons</CheckItem>
              <CheckItem>AI error explainer</CheckItem>
              <CheckItem>GitHub portfolio export</CheckItem>
              <CheckItem>Memory visualization</CheckItem>
              <CheckItem>Priority support</CheckItem>
            </div>
            <PillButton
              className="hs-pricing-btn"
              style={{ width: "100%", height: "52px", fontSize: "16px", fontWeight: 700 }}
              onClick={() => (window.location.href = "/upgrade")}
            >
              Try Free for 14 Days
            </PillButton>
          </div>

          {/* Annual */}
          <div
            style={{
              background: T.surface,
              borderRadius: T.cardRadius,
              padding: "32px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: T.accentBg10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: T.accent, fontSize: "16px" }}>⚡</span>
              </div>
              <span style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em" }}>
                Annual
              </span>
            </div>
            <div
              style={{
                fontSize: "16px",
                color: T.muted,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
              }}
            >
              Best value for committed learners
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "40px", fontWeight: 700, letterSpacing: "-0.03em" }}>
                $199
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: T.muted,
                  letterSpacing: "-0.02em",
                  marginLeft: "4px",
                }}
              >
                /year
              </span>
            </div>
            <p
              style={{
                fontSize: "16px",
                color: T.muted,
                lineHeight: "150%",
                letterSpacing: "-0.02em",
                marginBottom: "32px",
              }}
            >
              Save 43% compared to monthly. Everything in Pro included.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                marginBottom: "auto",
                paddingBottom: "32px",
              }}
            >
              <CheckItem>Everything in Pro</CheckItem>
              <CheckItem>Save 43% annually</CheckItem>
              <CheckItem>Early access to new paths</CheckItem>
              <CheckItem>Exclusive Discord community</CheckItem>
              <CheckItem>Dedicated account manager</CheckItem>
            </div>
            <PillButton
              className="hs-pricing-btn"
              style={{ width: "100%", height: "52px", fontSize: "16px", fontWeight: 700 }}
              onClick={() => (window.location.href = "/upgrade")}
            >
              Subscribe Annually
            </PillButton>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section
        id="faq"
        className="hs-section-pad"
        style={{ padding: "80px 120px", maxWidth: "1440px", margin: "0 auto" }}
      >
        <div className="hs-section-header" style={{ textAlign: "center", marginBottom: "64px" }}>
          <SectionLabel>FAQ&apos;s</SectionLabel>
          <SectionTitle>Got Questions? We&apos;ve Got Answers</SectionTitle>
          <SectionDesc>Find quick answers to the most common queries about HeapSight.</SectionDesc>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="hs-faq-item"
              style={{ borderTop: `1px solid ${T.border}`, padding: "32px 0" }}
            >
              <div
                className="hs-faq-q-row"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: "48px",
                }}
              >
                <div
                  className="hs-faq-inner"
                  style={{ display: "flex", alignItems: "center", gap: "70px" }}
                >
                  <span
                    className="hs-faq-num"
                    style={{
                      fontFamily: "Satoshi, sans-serif",
                      fontWeight: 900,
                      fontSize: "24px",
                      lineHeight: "160%",
                      color: T.white,
                      minWidth: "32px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="hs-faq-q"
                    style={{
                      fontFamily: "Satoshi, sans-serif",
                      fontWeight: 500,
                      fontSize: "24px",
                      lineHeight: "160%",
                      color: T.white,
                    }}
                  >
                    {faq.q}
                  </span>
                </div>
                {/* Plus / cross icon */}
                <div
                  className="hs-faq-icon"
                  style={{ width: "23px", height: "23px", position: "relative", flexShrink: 0 }}
                >
                  <div
                    className="hs-faq-icon-v"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "0",
                      width: "1.5px",
                      height: "23px",
                      background: T.white,
                      transform: `translateX(-50%) ${openFaq === i ? "rotate(90deg)" : ""}`,
                      transition: "transform 0.3s",
                    }}
                  />
                  <div
                    className="hs-faq-icon-h"
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "50%",
                      width: "23px",
                      height: "1.5px",
                      background: T.white,
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
              </div>
              {openFaq === i && (
                <div
                  className="hs-faq-ans"
                  style={{
                    marginTop: "16px",
                    marginLeft: "102px",
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 400,
                    fontSize: "20px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: T.muted,
                    maxWidth: "1015px",
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.border}` }} />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        className="hs-section-pad"
        style={{ padding: "80px 120px", maxWidth: "1440px", margin: "0 auto" }}
      >
        <div
          className="hs-cta-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                lineHeight: "150%",
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: T.accent,
                marginBottom: "12px",
              }}
            >
              Start today!
            </div>
            <h2
              className="hs-cta-title"
              style={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: "40px",
                lineHeight: "150%",
                letterSpacing: "-0.03em",
                margin: "0 0 24px 0",
              }}
            >
              <GradientText>Stop Reading Tutorials. Start Building Games.</GradientText>
            </h2>
            <p
              className="hs-cta-desc"
              style={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "150%",
                letterSpacing: "-0.01em",
                color: T.muted,
                margin: "0 0 32px 0",
              }}
            >
              Your first spaceship renders in under 2 minutes. No setup, no installs — just C++ in
              your browser.
            </p>
            <PillButton
              className="hs-cta-btn"
              style={{ height: "56px", fontSize: "18px" }}
              onClick={() => (window.location.href = "/signup")}
            >
              <span style={{ fontSize: "20px" }}>⚡</span> Start Your Free Trial
            </PillButton>
          </div>

          {/* Decorative card */}
          <div
            className="hs-cta-deco"
            style={{
              background: T.accent,
              borderRadius: "16px 0 0 0",
              padding: "32px",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: T.bg,
                borderRadius: "8px",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "150px" }}
              >
                {[80, 45, 95, 65, 50, 100, 70, 75, 95, 85, 65, 90].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: "10px",
                      height: `${h}%`,
                      background: i === 5 ? "rgba(160,181,255,0.2)" : T.surfaceLight,
                      borderRadius: "25px 25px 0 0",
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ background: T.surface, borderRadius: "8px", padding: "20px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div
                  style={{
                    height: "15px",
                    width: "176px",
                    background: T.accent,
                    borderRadius: "15px",
                  }}
                />
                <div
                  style={{
                    height: "7px",
                    width: "36px",
                    background: "rgba(144,163,191,0.1)",
                    borderRadius: "7px",
                    alignSelf: "center",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <div
                  style={{
                    height: "15px",
                    width: "176px",
                    background: T.accent,
                    borderRadius: "15px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="hs-footer"
        style={{ background: T.surface, padding: "120px 120px 80px" }}
      >
        <div
          className="hs-footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "190px 1fr 1fr 1fr 1fr",
            gap: "60px",
            marginBottom: "80px",
          }}
        >
          {/* Brand column */}
          <div className="hs-footer-brand">
            <div
              style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: T.accentGrad,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 900, color: T.white }}>H</span>
              </div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  lineHeight: "80%",
                  letterSpacing: "-0.03em",
                  color: T.logo,
                }}
              >
                HeapSight
              </span>
            </div>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "150%",
                letterSpacing: "-0.02em",
                color: T.muted,
                margin: "0 0 32px 0",
              }}
            >
              Master C++ by building real games in your browser.
            </p>
            <a
              href="mailto:hello@heapsight.com"
              style={{
                fontSize: "16px",
                color: T.muted,
                letterSpacing: "-0.02em",
                textDecoration: "none",
              }}
            >
              hello@heapsight.com
            </a>
          </div>

          {/* Link columns */}
          {[
            { title: "Product", links: ["Space Shooter", "Platformer", "RPG", "Dungeon Crawler"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Resources", links: ["Docs", "Pricing", "FAQ", "Changelog"] },
            { title: "Follow Us", links: ["Twitter", "GitHub", "Discord", "YouTube"] },
          ].map((col, i) => (
            <div key={i}>
              <h4
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "150%",
                  letterSpacing: "-0.02em",
                  color: T.white,
                  margin: "0 0 32px 0",
                }}
              >
                {col.title}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {col.links.map((link, j) => (
                  <a
                    key={j}
                    href="#"
                    style={{
                      fontSize: "16px",
                      lineHeight: "150%",
                      letterSpacing: "-0.02em",
                      color: T.muted,
                      textDecoration: "none",
                    }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer bottom */}
        <div
          className="hs-footer-bottom"
          style={{
            borderTop: `1px solid ${T.border}`,
            paddingTop: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            className="hs-footer-bottom-links"
            style={{ display: "flex", gap: "32px", alignItems: "center" }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: T.white,
              }}
            >
              Privacy Policy
            </span>
            <span style={{ color: T.border }}>|</span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: T.white,
              }}
            >
              Terms &amp; Conditions
            </span>
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: T.muted,
            }}
          >
            © HeapSight 2026. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
