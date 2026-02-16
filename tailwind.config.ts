import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#12121a",
        primary: "#00ff88",
        danger: "#ff0040",
        warning: "#ffaa00",
        canvas: "#0d0d1a",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      keyframes: {
        pulse_red: {
          "0%, 100%": { boxShadow: "0 0 8px #ff0040" },
          "50%": { boxShadow: "0 0 24px #ff0040, 0 0 48px #ff004066" },
        },
        glow_green: {
          "0%, 100%": { boxShadow: "0 0 8px #00ff88" },
          "50%": { boxShadow: "0 0 20px #00ff88, 0 0 40px #00ff8866" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%": { transform: "translateX(-8px) rotate(-1deg)" },
          "20%": { transform: "translateX(8px) rotate(1deg)" },
          "30%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "50%": { transform: "translateX(-4px)" },
          "60%": { transform: "translateX(4px)" },
          "70%": { transform: "translateX(-2px)" },
          "80%": { transform: "translateX(2px)" },
          "90%": { transform: "translateX(-1px)" },
        },
        modal_in: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        pulse_red: "pulse_red 1s ease-in-out infinite",
        glow_green: "glow_green 2s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out",
        modal_in: "modal_in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
