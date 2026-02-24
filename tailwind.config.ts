import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bordeau: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d8',
          300: '#f4a8b8',
          400: '#ec7591',
          500: '#e04370',
          600: '#cc2155',
          700: '#ab1644',
          800: '#8f1540',
          900: '#7a143b',
          950: '#44071e',
        },
        wine: {
          50: '#f9f0f2',
          100: '#f4e0e5',
          200: '#ecc5cf',
          300: '#de9cac',
          400: '#ca6b80',
          500: '#b54560',
          600: '#9c3350',
          700: '#832944',
          800: '#6b2439',
          900: '#5c2033',
          950: '#3b1120',
        },
        dark: {
          50: '#1a1a1a',
          100: '#141414',
          200: '#111111',
          300: '#0d0d0d',
          400: '#0a0a0a',
          500: '#080808',
        },
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#d4af37',
          600: '#b8942a',
          700: '#92751c',
        },
        surface: {
          DEFAULT: '#1c1c1e',
          elevated: '#2c2c2e',
          overlay: '#3a3a3c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #1a0a0a 0%, #0d0d0d 50%, #1a0f00 100%)',
        'gradient-card': 'linear-gradient(145deg, #1c1c1e 0%, #141414 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #b8942a 100%)',
        'gradient-wine': 'linear-gradient(180deg, #6b2439 0%, #3b1120 100%)',
      },
      boxShadow: {
        premium: '0 0 0 1px rgba(212, 175, 55, 0.15), 0 4px 24px rgba(0, 0, 0, 0.6)',
        card: '0 2px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glow-wine': '0 0 20px rgba(107, 36, 57, 0.4)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'wine-fill': 'wineFill 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        wineFill: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
} satisfies Config
