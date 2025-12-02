import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d1117", // Darker background
        surface: "#13192a", // Surface - Deeper blue-gray
        "surface-highlight": "#1a2537", // Surface Highlight
        border: "#243447", // Border - Refined
        primary: {
          DEFAULT: "#40F99B", // Neon Cyan-Green
          50: "#f0fffa",
          100: "#d0fff5",
          200: "#a8ffdb",
          300: "#7dffb3",
          400: "#40F99B", // Base
          500: "#2dd97d",
          600: "#1fb366",
          700: "#158c4e",
          800: "#0d6639",
          900: "#054021",
          foreground: "#0d1117", // Dark text on bright button
        },
        secondary: {
          DEFAULT: "#61707D", // Muted Blue-Gray
          50: "#f5f6f8",
          100: "#e8ecf1",
          200: "#cbd4e0",
          300: "#a1aec2",
          400: "#7a89a0",
          500: "#61707D", // Base
          600: "#505d6d",
          700: "#3d4a5a",
          800: "#2b3647",
          900: "#1a2332",
          foreground: "#ffffff",
        },
        accent: {
          coral: "#FF7A7A", // Softer coral
          orange: "#FFB84D", // Warm orange
          cyan: "#4DD9FF", // Softer cyan
          pink: "#FF66CC", // Vibrant pink
          yellow: "#FFE066", // Mellow yellow
        },
        text: {
          DEFAULT: "#f0f4f8", // Soft white
          muted: "#8a9aaa", // Mid gray
          dim: "#5a6a7a", // Dimmer gray
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"], // Technical font
      },
      backgroundImage: {
        "studio-gradient": "linear-gradient(to bottom right, #18181b, #09090b)",
      },
      boxShadow: {
        "studio": "0 0 0 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.15)",
        "studio-hover": "0 0 0 1px rgba(255,255,255,0.1), 0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.2)",
        "glow": "0 0 20px -5px var(--tw-shadow-color)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
