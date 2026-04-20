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
        forest: {
          DEFAULT: "#2D5016",
          light: "#4A7C2E",
          pale: "#EBF2E5",
          50: "#F0F5EB",
          100: "#D8EBCA",
          200: "#B3D494",
          300: "#8DBE5E",
          400: "#6AA83A",
          500: "#4A7C2E",
          600: "#2D5016",
          700: "#1E3A0D",
          800: "#102308",
          900: "#060D03",
        },
        field: {
          DEFAULT: "#D4A017",
          light: "#F2D97A",
          pale: "#FBF5E0",
          50: "#FEFBF0",
          100: "#FBF5E0",
          200: "#F5E9B8",
          300: "#F2D97A",
          400: "#ECC840",
          500: "#D4A017",
          600: "#A87C0F",
          700: "#7A5A0A",
          800: "#4E3906",
          900: "#261C02",
        },
        brick: {
          DEFAULT: "#A0412A",
          light: "#C4614A",
          pale: "#F8EAE7",
          50: "#FDF4F2",
          100: "#F8EAE7",
          200: "#F0C9C2",
          300: "#E4A090",
          400: "#D4735E",
          500: "#C4614A",
          600: "#A0412A",
          700: "#7A2E1A",
          800: "#521D0F",
          900: "#2A0D06",
        },
        linen: {
          DEFAULT: "#F5EFE6",
          dark: "#E8DDD0",
        },
        sand: "#C4B49E",
        bark: "#7A6552",
        soil: "#3D2B1A",
      },

      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.125rem" }],
        sm: ["0.875rem", { lineHeight: "1.313rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.688rem" }],
        xl: ["1.25rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.375rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.75rem" }],
      },

      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },

      boxShadow: {
        card: "0 2px 8px 0 rgba(61, 43, 26, 0.08)",
        "card-hover": "0 4px 16px 0 rgba(61, 43, 26, 0.14)",
        button: "0 2px 4px 0 rgba(45, 80, 22, 0.20)",
        "button-hover": "0 4px 8px 0 rgba(45, 80, 22, 0.28)",
        answer: "0 2px 6px 0 rgba(61, 43, 26, 0.10)",
        "answer-selected": "0 0 0 3px #4A7C2E",
        toast: "0 8px 24px 0 rgba(61, 43, 26, 0.18)",
        modal: "0 16px 48px 0 rgba(61, 43, 26, 0.24)",
      },

      animation: {
        confetti: "confetti 0.8s ease-out",
        "leaf-fall": "leaf-fall 1.2s ease-in-out",
        shake: "shake 0.4s ease-in-out",
        pop: "pop 0.25s ease-out",
        fanfare: "fanfare 0.6s ease-out",
        "draw-check": "draw-check 0.5s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "progress-fill": "progress-fill 0.5s ease-out",
        "tree-grow": "tree-grow 0.4s ease-out forwards",
        spin: "spin 1s linear infinite",
      },

      keyframes: {
        confetti: {
          "0%": { opacity: "0", transform: "scale(0.5) rotate(-10deg)" },
          "60%": { opacity: "1", transform: "scale(1.1) rotate(5deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "leaf-fall": {
          "0%": {
            opacity: "0",
            transform: "translateY(-20px) rotate(-30deg)",
          },
          "50%": { opacity: "1", transform: "translateY(10px) rotate(10deg)" },
          "100%": { opacity: "0", transform: "translateY(40px) rotate(30deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        fanfare: {
          "0%": { opacity: "0", transform: "scale(0.6) translateY(8px)" },
          "70%": { opacity: "1", transform: "scale(1.05) translateY(-4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "draw-check": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "tree-grow": {
          "0%": { transform: "scaleY(0)", transformOrigin: "bottom center" },
          "100%": { transform: "scaleY(1)", transformOrigin: "bottom center" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
