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
        brand: {
          purple: "#7650FF",
          purpleDark: "#6A45E8",
          dark: "#07071A",
          white: "#FFFFFF",
        }
      }
    },
  },
  plugins: [],
}
