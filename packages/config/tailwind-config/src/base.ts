/**
 * Base Tailwind CSS V4 configuration
 * 
 * Luxury design system with:
 * - Extended color palette
 * - Custom typography
 * - Spacing system
 * - Animation utilities
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = {
  content: [
    "../../apps/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury color palette
        luxury: {
          gold: {
            50: "#fefdf9",
            100: "#fef9e7",
            200: "#fdf2c4",
            300: "#fbe89e",
            400: "#f8d76b",
            500: "#f5c842",
            600: "#e6a91c",
            700: "#b88216",
            800: "#946414",
            900: "#785112",
            950: "#452807",
          },
          platinum: {
            50: "#f8f9fa",
            100: "#f1f3f5",
            200: "#e9ecef",
            300: "#dee2e6",
            400: "#ced4da",
            500: "#adb5bd",
            600: "#868e96",
            700: "#495057",
            800: "#343a40",
            900: "#212529",
            950: "#0d1117",
          },
          navy: {
            50: "#f0f4f8",
            100: "#d9e2ec",
            200: "#bcccdc",
            300: "#9fb3c8",
            400: "#829ab1",
            500: "#627d98",
            600: "#486581",
            700: "#334e68",
            800: "#243b53",
            900: "#102a43",
            950: "#0a1f33",
          },
        },
        // Alias colors (from kernel)
        alias: {
          blue: "var(--alias-blue, #0000FF)",
          hex: "var(--alias-hex, #000000)",
          hsl: "var(--alias-hsl, hsl(0, 0%, 0%))",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "Times",
          "serif",
        ],
        mono: [
          "var(--font-mono)",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      spacing: {
        // Extended spacing scale for luxury layouts
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        luxury: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "luxury-lg": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
