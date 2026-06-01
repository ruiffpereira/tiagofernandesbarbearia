/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta derivada do logo: navy + bordô + creme
        cream:   { DEFAULT: '#f4f1ea', dark: '#e8e1d3' },
        paper:   '#faf8f3',
        navy: {
          DEFAULT: '#27333f',
          dark:    '#1c2630',
          light:   '#3c4d5d',
        },
        maroon: {
          DEFAULT: '#7a261c',
          dark:    '#5e1c14',
          light:   '#9a3a2e',
        },
        silver:  '#b9bdc1',
        ink:     { DEFAULT: '#1f2933', soft: '#54606b', faint: '#8a939c' },
        line:    { DEFAULT: 'rgba(31,41,51,0.12)', strong: 'rgba(31,41,51,0.22)' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(28,38,48,0.08)',
        lift: '0 16px 48px rgba(28,38,48,0.16)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fadeUp: 'fadeUp .55s ease both',
        fadeIn: 'fadeIn .35s ease both',
        slideDown: 'slideDown .2s ease both',
      },
    },
  },
  plugins: [],
}
