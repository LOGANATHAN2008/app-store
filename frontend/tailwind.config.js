/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#1C1C1E',
        surfaceRaised: '#2C2C2E',
        border: 'rgba(255,255,255,0.1)',
        accent: '#0A84FF',
        accentGreen: '#30D158',
        accentRed: '#FF453A',
        accentOrange: '#FF9F0A',
        accentPurple: '#BF5AF2',
        textPrimary: '#FFFFFF',
        textSecondary: '#8E8E93',
        textTertiary: '#48484A',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        icon: '22%',
        pill: '100px',
        modal: '20px',
      },
      backdropBlur: {
        nav: '20px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse_glow: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        pulse_glow: 'pulse_glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
