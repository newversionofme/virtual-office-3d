/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        office: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          fl4: '#10b981',
          fl3: '#6366f1',
          fl2: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
      }
    },
  },
  plugins: [],
}
