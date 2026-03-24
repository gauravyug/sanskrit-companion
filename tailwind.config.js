/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        saffron: { 50: "#fff8f0", 100: "#ffedd5", 200: "#fed7aa", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c" },
        sacred: { 50: "#fef7ee", 100: "#fdebd0", 500: "#d4a056", 700: "#92671d", 900: "#5c3d0e" },
      },
      fontFamily: {
        sanskrit: ['"Noto Sans Devanagari"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
