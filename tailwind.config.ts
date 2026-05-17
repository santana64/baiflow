import type { Config } from "tailwindcss";

// ElevenLabs-inspired design system, adapted for BailFlow
// Eggshell surfaces · Pill buttons · Minimal shadows · Inter type

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        // Surfaces
        surface: "#fdfcfc",   // eggshell — page background
        paper:   "#fdfcfc",   // alias for backward compat
        powder:  "#f5f3f1",   // hover states, section highlights

        // Borders
        line:    "#e5e5e5",   // chalk — universal border
        "line-strong": "#d4d4d4",

        // Text
        ink:     "#0a0a0a",   // obsidian — primary text
        cinder:  "#57534e",   // secondary text
        stone:   "#a8a29e",   // muted/placeholder

        // CTA / brand navy → now clean black
        navy:    "#0a0a0a",

        // BailFlow green accent (kept from brand)
        sage:    "#16a34a",
        "sage-light": "#f0fdf4",
        "sage-mid":   "#dcfce7",

        // Semantic
        blue:    "#2563eb",
        "blue-light": "#eff6ff",
        danger:  "#dc2626",
        "danger-light": "#fef2f2",
        warning: "#ca8a04",
        "warning-light": "#fefce8"
      },
      borderRadius: {
        pill: "9999px"
      },
      boxShadow: {
        // ElevenLabs-style minimal elevation
        card:    "rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px",
        soft:    "rgba(0,0,0,0.08) 0px 4px 24px",
        panel:   "rgba(0,0,0,0.4) 0px 0px 1px 0px, rgba(0,0,0,0.04) 0px 4px 4px",
        inset:   "rgba(0,0,0,0.075) 0px 0px 0px 0.5px inset"
      }
    }
  },
  plugins: []
};

export default config;
