/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        terminal: ['"VT323"', 'monospace'],
      },
    },
  },
  plugins: [],
}
