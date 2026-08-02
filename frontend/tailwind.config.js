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
        background: '#242A23', // Rich Deep Olive Green (matching logo background)
        'surface-dim': '#1E241D',
        'surface-container-lowest': '#1A201A',
        'surface-container-low': '#20251E',
        'surface-container': '#20251E', // Dark Olive container
        'surface-container-high': '#283027',
        'surface-container-highest': '#2D362C',
        'secondary-bg': '#20251E', // Dark Olive Surface
        surface: '#20251E',
        outline: '#494736', // Muted Olive Border
        'outline-variant': '#494736',
        primary: '#BCB496', // Lighter Warm Sand Beige (100% Beige, Clear & Elegant)
        'primary-hover': '#C8C0A4', // Slightly Brighter Sand Beige
        'primary-accent': '#494736',
        'luxury-accent': '#BCB496',
        'on-primary': '#20251E', // Dark Olive text on primary beige
        'on-surface': '#C8C0A4', // Lighter Warm Sand Beige (Headings)
        'on-surface-variant': '#B8B094', // Lighter Sand Beige (Body Text)
        'on-background': '#C8C0A4',
        muted: '#8E866F', // Legible Muted Sand Beige
        // Semantic UI Feedback Accents
        favorite: '#D32F2F', // Rich Premium Red for Active Heart
        error: '#C62828', // Refined Crimson
        success: '#2E7D32', // Elegant Muted Green
        warning: '#E65100', // Warm Amber
        info: '#455A64' // Muted Slate/Blue-Gray
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Noto Serif Arabic', 'serif'],
        sans: ['Inter', 'Manrope', 'sans-serif'],
        display: ['Cormorant Garamond', 'Noto Serif Arabic', 'serif']
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
        'gold-glow': '0 0 35px rgba(188, 180, 150, 0.22)',
        'gold-glow-lg': '0 0 60px rgba(188, 180, 150, 0.32)',
        'brand-glow': '0 0 35px rgba(188, 180, 150, 0.22)',
        'seal-shadow': '0 4px 18px rgba(0, 0, 0, 0.4)'
      }
    },
  },
  plugins: [],
}
