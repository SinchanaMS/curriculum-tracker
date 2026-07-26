/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Module colors
        'js-yellow': '#F7DF1E',
        'browser-blue': '#4285F4',
        'react-cyan': '#61DAFB',
        'nextjs-black': '#000000',
        'arch-purple': '#8B5CF6',
        'design-green': '#10B981',
        'breadth-orange': '#F97316',
      },
    },
  },
  plugins: [],
}
