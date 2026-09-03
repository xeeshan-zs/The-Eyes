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
        brutal: {
          bg: '#0A0A0E',
          surface: '#121218',
          card: '#181822',
          border: '#272736',
          white: '#FFFFFF',
          yellow: '#FFE600',
          green: '#00F5A0',
          pink: '#FF2E63',
          cyan: '#00F0FF',
          purple: '#A855F7',
          orange: '#FF8A00',
        }
      },
      boxShadow: {
        'brutal-sm': '3px 3px 0px 0px #000000',
        'brutal': '5px 5px 0px 0px #000000',
        'brutal-lg': '7px 7px 0px 0px #000000',
        'brutal-yellow': '5px 5px 0px 0px #FFE600',
        'brutal-green': '5px 5px 0px 0px #00F5A0',
        'brutal-pink': '5px 5px 0px 0px #FF2E63',
        'brutal-cyan': '5px 5px 0px 0px #00F0FF',
        'brutal-white': '5px 5px 0px 0px #FFFFFF',
        'brutal-border': '4px 4px 0px 0px rgba(255, 255, 255, 0.15)',
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
