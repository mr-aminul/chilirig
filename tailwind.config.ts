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
        // Custom ChiliRig colors from CSS variables
        crimson: {
          50: "hsl(var(--crimson-50))",
          100: "hsl(var(--crimson-100))",
          200: "hsl(var(--crimson-200))",
          300: "hsl(var(--crimson-300))",
          400: "hsl(var(--crimson-400))",
          500: "hsl(var(--crimson-500))",
          600: "hsl(var(--crimson-600))",
          700: "hsl(var(--crimson-700))",
          800: "hsl(var(--crimson-800))",
          900: "hsl(var(--crimson-900))",
          950: "hsl(var(--crimson-950))",
        },
        red: {
          50: "hsl(var(--red-50))",
          100: "hsl(var(--red-100))",
          200: "hsl(var(--red-200))",
          300: "hsl(var(--red-300))",
          400: "hsl(var(--red-400))",
          500: "hsl(var(--red-500))",
          600: "hsl(var(--red-600))",
          700: "hsl(var(--red-700))",
          800: "hsl(var(--red-800))",
          900: "hsl(var(--red-900))",
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
        "crimson-gradient": "linear-gradient(135deg, hsl(var(--crimson-600)) 0%, hsl(var(--crimson-700)) 50%, hsl(var(--crimson-800)) 100%)",
        "red-gradient": "linear-gradient(135deg, hsl(var(--red-600)) 0%, hsl(var(--red-700)) 50%, hsl(var(--red-800)) 100%)",
      },
      boxShadow: {
        "glow-crimson": "0 0 20px hsl(var(--shadow-crimson))",
        "glow-red": "0 0 20px hsl(var(--red-600) / 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
