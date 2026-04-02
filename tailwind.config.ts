import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0D0D12",
          50: "#1E1E2D",
          100: "#16161F",
          200: "#1E1E2D",
          300: "#252536",
          400: "#2D2D42",
          500: "#6B6B7B",
          600: "#B4B4C7",
          700: "#FFFFFF",
        },
        terracotta: {
          50: "#fdf2ee",
          100: "#fbe2d8",
          200: "#f6c2b0",
          300: "#ef9a7e",
          400: "#e67a5a",
          500: "#C75B39",
          600: "#D4714F",
          700: "#b34a2e",
          800: "#7a3223",
          900: "#652c21",
        },
        savanna: {
          50: "#fdf8f1",
          100: "#f9eddb",
          200: "#f2d8b5",
          300: "#e9be87",
          400: "#D4A574",
          500: "#c48f5a",
          600: "#b67a4a",
          700: "#98623e",
          800: "#7a4f37",
          900: "#634230",
        },
        forest: {
          50: "#f0f7f2",
          100: "#dceede",
          200: "#bcdec0",
          300: "#8ec698",
          400: "#5ea86e",
          500: "#2D5A3D",
          600: "#00D9A5",
          700: "#264d34",
          800: "#1c3325",
          900: "#182b20",
        },
        sunset: {
          50: "#fff4ed",
          100: "#ffe6d4",
          200: "#ffc9a8",
          300: "#ffa471",
          400: "#E85D04",
          500: "#d45200",
          600: "#FFB800",
          700: "#b54200",
          800: "#742c04",
          900: "#622708",
        },
        warm: {
          50: "#F5F5F0",
          100: "#E8E6E1",
          200: "#d5d2cb",
          300: "#b8b4ab",
          400: "#9a958a",
          500: "#7e7970",
          600: "#69645c",
          700: "#56524b",
          800: "#494641",
          900: "#3f3d39",
          950: "#0D0D12",
        },
        slate: {
          850: "#1E1E2D",
          900: "#16161F",
          950: "#0D0D12",
        },
      },
      fontFamily: {
        heading: [
          "var(--font-nunito)",
          '"Segoe UI"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        body: [
          "var(--font-nunito)",
          '"Segoe UI"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        glass:
          "0 8px 32px 0 rgba(0, 0, 0, 0.12), 0 2px 8px 0 rgba(0, 0, 0, 0.06)",
        "glass-lg":
          "0 16px 48px 0 rgba(0, 0, 0, 0.15), 0 4px 16px 0 rgba(0, 0, 0, 0.08)",
        "input-focus": "0 0 0 3px rgba(199, 91, 57, 0.15)",
        "btn-hover":
          "0 8px 24px rgba(199, 91, 57, 0.25), 0 4px 8px rgba(0, 0, 0, 0.1)",
        error: "0 0 0 3px rgba(220, 38, 38, 0.2)",
        "dark-card": "0 4px 24px rgba(0,0,0,0.3)",
        "dark-card-hover": "0 8px 32px rgba(199,91,57,0.15)",
        "glow-terracotta": "0 0 40px rgba(199,91,57,0.2)",
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0D0D12 0%, #16161F 100%)",
        "glass-dark": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        "card-hover-dark": "linear-gradient(135deg, rgba(199,91,57,0.1) 0%, rgba(212,165,116,0.05) 100%)",
      },
      animation: {
        "gradient-drift": "gradient-drift 15s ease infinite",
        shake: "shake 0.5s ease-in-out",
        "pulse-success": "pulse-success 0.6s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "gradient-drift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        "pulse-success": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(45, 90, 61, 0.4)",
          },
          "50%": {
            transform: "scale(1.02)",
            boxShadow: "0 0 0 12px rgba(45, 90, 61, 0)",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(45, 90, 61, 0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
    },
  },
  plugins: [],
};
export default config;
