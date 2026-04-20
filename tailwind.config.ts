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
        // Placeholder-palett - Linnéa levererar detaljerad palett senare
        // Inspirerat av skånsk natur: skogsgrön, höstgul, tegelröd
        forest: {
          50: "#f0f7f0",
          100: "#d9edd9",
          200: "#b3dbb3",
          300: "#7ec27e",
          400: "#4fa34f",
          500: "#2d7d2d", // Primär skogsgrön
          600: "#226022",
          700: "#1a4d1a",
          800: "#133913",
          900: "#0d260d",
        },
        autumn: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Höstgul
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        brick: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#b91c1c", // Tegelröd
          700: "#991b1b",
          800: "#7f1d1d",
          900: "#6b1010",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
