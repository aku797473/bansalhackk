/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#16a34a', light: '#22c55e', dark: '#15803d' },
        soil:     { DEFAULT: '#92400e', light: '#b45309', dark: '#78350f' },
        'sky-brand': { DEFAULT: '#0369a1', light: '#0ea5e9', dark: '#075985' },
        harvest:  { DEFAULT: '#ca8a04', light: '#eab308', dark: '#a16207' },
        surface:  '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        card:    '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)',
        'map':   '0 24px 64px rgba(0,0,0,0.12)',
        'nav':   '0 2px 20px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-sm':  'bounceSm 1.5s ease-in-out infinite',
        'spin-slow':  'spin 4s linear infinite',
        'ping-slow':  'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceSm:  { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
