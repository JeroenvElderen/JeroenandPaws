/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      colors: {
        jp: {
          primary: "var(--jp-primary)",
          secondary: "var(--jp-secondary)",
          tertiary: "var(--jp-tertiary)",
          background: "var(--jp-background)",
          surface: "var(--jp-surface)",
          surfaceStrong: "var(--jp-surface-strong)",
          ink: "var(--jp-ink)",
          muted: "var(--jp-muted)",
          border: "var(--jp-border)"
        },
        brand: {
          purple: "#7650FF",
          purpleDark: "#6A45E8",
          dark: "#07071A",
          white: "#FFFFFF",
        }
      },
      boxShadow: {
        jp: "var(--jp-shadow)",
        jpSoft: "var(--jp-shadow-soft)"
      }
    },
  },
  plugins: [],
}
