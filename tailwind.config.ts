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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // RGB triplets in globals.css — must use rgb(), not hsl()
        crimson: {
          50: "rgb(var(--crimson-50) / <alpha-value>)",
          100: "rgb(var(--crimson-100) / <alpha-value>)",
          200: "rgb(var(--crimson-200) / <alpha-value>)",
          300: "rgb(var(--crimson-300) / <alpha-value>)",
          400: "rgb(var(--crimson-400) / <alpha-value>)",
          500: "rgb(var(--crimson-500) / <alpha-value>)",
          600: "rgb(var(--crimson-600) / <alpha-value>)",
          700: "rgb(var(--crimson-700) / <alpha-value>)",
          800: "rgb(var(--crimson-800) / <alpha-value>)",
          900: "rgb(var(--crimson-900) / <alpha-value>)",
          950: "rgb(var(--crimson-950) / <alpha-value>)",
        },
        red: {
          50: "rgb(var(--red-50) / <alpha-value>)",
          100: "rgb(var(--red-100) / <alpha-value>)",
          200: "rgb(var(--red-200) / <alpha-value>)",
          300: "rgb(var(--red-300) / <alpha-value>)",
          400: "rgb(var(--red-400) / <alpha-value>)",
          500: "rgb(var(--red-500) / <alpha-value>)",
          600: "rgb(var(--red-600) / <alpha-value>)",
          700: "rgb(var(--red-700) / <alpha-value>)",
          800: "rgb(var(--red-800) / <alpha-value>)",
          900: "rgb(var(--red-900) / <alpha-value>)",
        },
        // Text colors
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          accent: "hsl(var(--text-accent))",
        },
        // Background colors
        bg: {
          primary: "hsl(var(--bg-primary))",
          secondary: "hsl(var(--bg-secondary))",
          tertiary: "hsl(var(--bg-tertiary))",
        },
        // Glass colors
        glass: {
          bg: "hsl(var(--glass-bg))",
          border: "hsl(var(--glass-border))",
          hover: "hsl(var(--glass-hover))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "crimson-gradient":
          "linear-gradient(135deg, rgb(var(--crimson-600)) 0%, rgb(var(--crimson-700)) 50%, rgb(var(--crimson-800)) 100%)",
        "red-gradient":
          "linear-gradient(135deg, rgb(var(--red-600)) 0%, rgb(var(--red-700)) 50%, rgb(var(--red-800)) 100%)",
      },
      boxShadow: {
        "glow-crimson": "0 0 20px rgb(var(--shadow-crimson))",
        "glow-red": "0 0 20px rgb(var(--red-600) / 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
