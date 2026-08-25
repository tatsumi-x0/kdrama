/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B10",
        surface: "#15141B",
        line: "#2A2833",
        ink: "#F5F3EE",
        muted: "#8B8894",
        red: "#E23F5C",
        gold: "#F2C879",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
