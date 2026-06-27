/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        background: '#F6FAF9',
        foreground: '#0B2B2A',
        mint: {
          50: '#EFFCF6',
          100: '#D6F5E8',
          200: '#ABEBD3',
          300: '#74DDB8',
          400: '#3FCB9C',
          500: '#1FB088',
          600: '#138F6E',
          700: '#117259',
          800: '#0E5747',
          900: '#0B433A',
        },
        sky: {
          50: '#F0F8FF',
          100: '#DDEFFE',
          200: '#B6DFFD',
          300: '#84C9FB',
          400: '#52AEF5',
          500: '#2C8FE8',
          600: '#1E6FC4',
          700: '#1B5899',
          800: '#1A487A',
          900: '#193D64',
        },
        danger: {
          50: '#FFF1F0',
          100: '#FFDDDA',
          400: '#FF6B61',
          500: '#F5392C',
          600: '#D32418',
          700: '#A91B12',
        },
        warn: {
          50: '#FFF8EC',
          400: '#FFB23F',
          500: '#F2940B',
          600: '#C97500',
        },
        card: 'rgba(255,255,255,0.6)',
        border: 'rgba(11,67,58,0.10)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl2: '1.75rem',
        xl3: '2.25rem',
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(15, 60, 53, 0.12)',
        glassLg: '0 16px 48px -8px rgba(15, 60, 53, 0.18)',
        soft: '0 2px 12px rgba(15,60,53,0.06)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(31,176,136,0.45)' },
          '70%': { boxShadow: '0 0 0 14px rgba(31,176,136,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(31,176,136,0)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        breathe: 'breathe 4.5s ease-in-out infinite',
        blink: 'blink 4s ease-in-out infinite',
        pulseRing: 'pulseRing 2.2s ease-out infinite',
        rise: 'rise 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
