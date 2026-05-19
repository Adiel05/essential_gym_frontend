/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gym-blue-light': '#6EC8E0',
        'gym-blue': '#1A4B8C',
        'gym-white': '#FFFFFF',
        'gym-gray-light': '#F5F7FA',
        'gym-gold': '#C9A227',
        'gym-gold-light': '#E5B73B',
        'gym-dark': '#1A1A1A',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      },
    },
  },
  plugins: [],
}
