/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 500:"#7c3aed", 600:"#6d28d9", 700:"#5b21b6" }
      }
    }
  },
  plugins: []
}