/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#141714',
        'surface-dim': '#131313',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        'secondary-bg': '#24241D',
        surface: '#333125',
        outline: '#99907c',
        'outline-variant': '#484737',
        primary: '#d4af37',
        'primary-hover': '#f2ca50',
        'primary-accent': '#6E6953',
        'luxury-accent': '#9A9379',
        'on-primary': '#3c2f00',
        'on-surface': '#F4F2EC',
        'on-surface-variant': '#B8B39D',
        'on-background': '#F4F2EC',
        muted: '#7D7867'
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Noto Serif', 'serif'],
        sans: ['Inter', 'Manrope', 'sans-serif'],
        display: ['Cormorant Garamond', 'Noto Serif', 'serif']
      },
      fontSize: {
        'display-hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline-lg': ['3rem', { lineHeight: '1.2' }],
        'headline-md': ['2rem', { lineHeight: '1.3' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'label-sm': ['0.75rem', { lineHeight: '1.0', letterSpacing: '0.1em' }]
      },
      spacing: {
        'gutter': '32px',
        'section-padding': '120px',
        'element-gap-sm': '16px',
        'element-gap-md': '24px'
      },
      boxShadow: {
        'gold-glow': '0 0 35px rgba(212, 175, 55, 0.15)',
        'gold-glow-lg': '0 0 60px rgba(212, 175, 55, 0.25)'
      }
    },
  },
  plugins: [],
}
