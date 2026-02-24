import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HeapSight vs Codecademy, Udemy, freeCodeCamp — C++ Course Comparison",
  description:
    "See how HeapSight compares to traditional C++ courses. Browser-based, game-focused, portfolio-ready.",
  openGraph: {
    title: "HeapSight vs Codecademy, Udemy, freeCodeCamp — C++ Course Comparison",
    description:
      "See how HeapSight compares to traditional C++ courses. Browser-based, game-focused, portfolio-ready.",
    siteName: "HeapSight",
  },
};

const CHECK = "✅";
const CROSS = "❌";
const PARTIAL = "Varies";

const rows: { feature: string; hs: string; udemy: string; codecademy: string; fcc: string; learncpp: string }[] = [
  {
    feature: "No local setup required",
    hs: CHECK,
    udemy: CROSS,
    codecademy: CHECK,
    fcc: CHECK,
    learncpp: CHECK,
  },
  {
    feature: "Builds real games / projects",
    hs: CHECK,
    udemy: PARTIAL,
    codecademy: CROSS,
    fcc: CROSS,
    learncpp: CROSS,
  },
  {
    feature: "Visual output in the browser",
    hs: CHECK,
    udemy: CROSS,
    codecademy: CROSS,
    fcc: CROSS,
    learncpp: CROSS,
  },
  {
    feature: "C++ focused curriculum",
    hs: CHECK,
    udemy: CHECK,
    codecademy: PARTIAL,
    fcc: CROSS,
    learncpp: CHECK,
  },
  {
    feature: "Interactive coding challenges",
    hs: CHECK,
    udemy: CROSS,
    codecademy: CHECK,
    fcc: CHECK,
    learncpp: CROSS,
  },
  {
    feature: "Structured lesson path",
    hs: CHECK,
    udemy: CHECK,
    codecademy: CHECK,
    fcc: CROSS,
    learncpp: CHECK,
  },
  {
    feature: "Portfolio-ready projects",
    hs: CHECK,
    udemy: PARTIAL,
    codecademy: CROSS,
    fcc: CROSS,
    learncpp: CROSS,
  },
  {
    feature: "Free lessons included",
    hs: CHECK,
    udemy: CROSS,
    codecademy: PARTIAL,
    fcc: CHECK,
    learncpp: CHECK,
  },
  {
    feature: "Systems programming focus",
    hs: CHECK,
    udemy: PARTIAL,
    codecademy: CROSS,
    fcc: CROSS,
    learncpp: CHECK,
  },
];

const competitors = [
  {
    name: "HeapSight vs Udemy",
    body: "Udemy offers great C++ video courses taught by experienced instructors, but learning is passive — you watch, then struggle alone in a local IDE with no visual feedback. HeapSight puts you in an interactive editor where your C++ code compiles to a real game running in the browser within seconds. Every lesson builds toward a playable project you can share.",
  },
  {
    name: "HeapSight vs Codecademy",
    body: "Codecademy teaches many languages with a polished interactive interface, but its C++ coverage is shallow and the exercises don't build toward anything real. HeapSight is C++ only, game-focused, and every line you write contributes to a working raylib game — so the feedback loop is immediate and the payoff is visible.",
  },
  {
    name: "HeapSight vs freeCodeCamp",
    body: "freeCodeCamp is excellent and completely free, but it's built around web technologies — JavaScript, Python, and data science. C++ systems programming is not a primary focus. HeapSight exists specifically for C++ learners who want to understand memory, performance, and game architecture through hands-on projects.",
  },
  {
    name: "HeapSight vs LearnCpp.com",
    body: "LearnCpp.com is the best free C++ reference on the internet — thorough, accurate, and well-maintained. But it's a text tutorial, not an interactive course. HeapSight complements it: you read the concept, then immediately apply it inside a browser editor and watch your game respond. No copy-paste into an IDE, no setup friction.",
  },
];

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link
            href="/"
            className="text-xs font-mono text-[#AFBCD5]/50 hover:text-primary transition-colors mb-8 inline-block"
          >
            &larr; HeapSight
          </Link>
          <div className="inline-block mb-4 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            Comparison
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            How does HeapSight compare?
          </h1>
          <p className="text-base text-[#AFBCD5]/70 max-w-2xl">
            HeapSight is the only C++ learning platform where your code compiles to a real game running in the browser — no IDE, no setup, no waiting. Here&apos;s how that changes the learning experience.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* Comparison table */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Feature comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                  <th className="text-left px-4 py-3 font-semibold text-[#AFBCD5]/70 w-48">Feature</th>
                  <th className="px-4 py-3 font-bold text-primary text-center">HeapSight</th>
                  <th className="px-4 py-3 font-semibold text-[#AFBCD5]/70 text-center">Udemy C++</th>
                  <th className="px-4 py-3 font-semibold text-[#AFBCD5]/70 text-center">Codecademy</th>
                  <th className="px-4 py-3 font-semibold text-[#AFBCD5]/70 text-center">freeCodeCamp</th>
                  <th className="px-4 py-3 font-semibold text-[#AFBCD5]/70 text-center">LearnCpp.com</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#AFBCD5]/80 font-medium">{row.feature}</td>
                    <td className="px-4 py-3 text-center font-mono text-base bg-primary/[0.04]">{row.hs}</td>
                    <td className="px-4 py-3 text-center font-mono text-base text-[#AFBCD5]/60">{row.udemy}</td>
                    <td className="px-4 py-3 text-center font-mono text-base text-[#AFBCD5]/60">{row.codecademy}</td>
                    <td className="px-4 py-3 text-center font-mono text-base text-[#AFBCD5]/60">{row.fcc}</td>
                    <td className="px-4 py-3 text-center font-mono text-base text-[#AFBCD5]/60">{row.learncpp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] font-mono text-[#AFBCD5]/30 mt-3">
            Varies = depends on specific course or instructor. Data reflects general platform capabilities as of 2026.
          </p>
        </section>

        {/* Per-competitor prose */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-white">In depth</h2>
          {competitors.map((c, i) => (
            <div key={i} className="p-6 rounded-xl border border-white/[0.08] bg-[#071528]">
              <h3 className="text-base font-bold text-white mb-3">{c.name}</h3>
              <p className="text-sm text-[#AFBCD5]/70 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="p-8 rounded-2xl border border-white/[0.08] bg-[#071528] text-center">
          <p className="text-lg font-bold text-white mb-2">
            Ready to learn C++ the right way?
          </p>
          <p className="text-sm text-[#AFBCD5]/60 mb-6 max-w-md mx-auto">
            5 free lessons on every path. No credit card, no local setup. Your first game runs in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Building Free &rarr;
          </Link>
        </section>

      </div>
    </main>
  );
}
