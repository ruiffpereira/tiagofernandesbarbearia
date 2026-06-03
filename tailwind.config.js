/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Todas as cores lêem as CSS variables de index.css — muda lá a paleta.
        // Formato rgb(var(...) / <alpha-value>) permite usar /10, /50, etc.
        cream:    { DEFAULT: 'rgb(var(--bg) / <alpha-value>)',       dark: 'rgb(var(--bg-alt) / <alpha-value>)' },
        paper:    'rgb(var(--surface) / <alpha-value>)',
        navy:     { DEFAULT: 'rgb(var(--primary) / <alpha-value>)',  dark: 'rgb(var(--primary-dk) / <alpha-value>)', light: 'rgb(var(--primary-lt) / <alpha-value>)' },
        maroon:   { DEFAULT: 'rgb(var(--red) / <alpha-value>)',      dark: 'rgb(var(--red-dk) / <alpha-value>)',     light: 'rgb(var(--red-lt) / <alpha-value>)' },
        electric: { DEFAULT: 'rgb(var(--blue) / <alpha-value>)',     dark: 'rgb(var(--blue-dk) / <alpha-value>)',    light: 'rgb(var(--blue-lt) / <alpha-value>)' },
        silver:   'rgb(var(--silver) / <alpha-value>)',
        ink:      { DEFAULT: 'rgb(var(--ink) / <alpha-value>)',      soft: 'rgb(var(--ink-soft) / <alpha-value>)',   faint: 'rgb(var(--ink-faint) / <alpha-value>)' },
        // line tem opacidade fixa — não usa <alpha-value>
        line:     { DEFAULT: 'rgb(var(--line) / 0.09)',              strong: 'rgb(var(--line) / 0.16)' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(8,8,18,0.45)',
        lift: '0 16px 48px rgba(8,8,18,0.65)',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pageLoad:  { '0%': { width: '0%' }, '80%': { width: '70%' }, '100%': { width: '100%' } },
      },
      animation: {
        fadeUp:    'fadeUp .55s ease both',
        fadeIn:    'fadeIn .35s ease both',
        slideDown: 'slideDown .2s ease both',
        pageLoad:  'pageLoad .4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
