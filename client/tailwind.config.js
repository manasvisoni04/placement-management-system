/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        slate: {
          850: '#172033',
          900: '#0f172a'
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        'neon': '0 0 20px rgba(34, 197, 94, 0.4)',
      },
      backgroundImage: {
        'mesh': 'radial-gradient(at 40% 20%, hsla(280,100%,74%,0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,0.1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,0.1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,0.1) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
