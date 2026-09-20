/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#04060B',
        panel: 'rgba(8,13,22,0.92)',
        gridLine: 'rgba(120,220,240,0.05)',
        cyan: {
          DEFAULT: '#38E8F5',
          bright: '#26E3EF',
        },
        magenta: {
          DEFAULT: '#D84FE0',
          bright: '#E14BEC',
        },
        yellow: {
          DEFAULT: '#FFCE54',
        },
        text: {
          primary: '#F3FCFD',
          body: '#EAF6F8',
          muted: '#8FB9C2',
          disabled: '#546069',
        },
        border: {
          cyan: 'rgba(56,232,245,0.5)',
          hairline: 'rgba(120,220,240,0.2)',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
      }
    },
  },
  plugins: [],
}
