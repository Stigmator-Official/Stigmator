import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          DEFAULT: "#22c55e",
          dim: "#22c55e20",
        },
        panel: "#1a1a1a",
        border: "#22c55e33",
        error: "#dc2626",
        success: "#4ade80",
        warning: "#fbbf24",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        spin: "spin 1s linear infinite",
        shake: "shake 0.5s ease-in-out",
        "fade-slide": "fade-slide 0.2s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scan-line 8s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px #22c55e20" },
          "50%": { boxShadow: "0 0 20px #22c55e20" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%": { transform: "translateX(-5px)" },
          "20%": { transform: "translateX(5px)" },
          "30%": { transform: "translateX(-5px)" },
          "40%": { transform: "translateX(5px)" },
          "50%": { transform: "translateX(-3px)" },
          "60%": { transform: "translateX(3px)" },
          "70%": { transform: "translateX(-2px)" },
          "80%": { transform: "translateX(2px)" },
          "90%": { transform: "translateX(-1px)" },
        },
        "fade-slide": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      boxShadow: {
        "focus-green": "0 0 0 2px rgba(74, 222, 128, 0.5)",
        "focus-red": "0 0 0 2px rgba(220, 38, 38, 0.5)",
        "focus-error": "0 0 0 3px rgba(220, 38, 38, 0.2)",
      },
      transitionDuration: {
        "0": "0ms",
        "10": "10ms",
      },
    },
  },
  plugins: [
    // Add custom utilities for reduced motion
    function({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        ".motion-reduce\\:transition-none": {
          "@media (prefers-reduced-motion: reduce)": {
            "transition-property": "none",
          },
        },
        ".motion-reduce\\:animate-none": {
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        },
        ".motion-reduce\\:transform-none": {
          "@media (prefers-reduced-motion: reduce)": {
            transform: "none",
          },
        },
      });
    },
  ],
};

export default config;
