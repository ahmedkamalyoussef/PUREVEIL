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
        background: '#0D0E0E', // Matte Black
        'surface-dim': '#111312',
        'surface-container-lowest': '#090A0A',
        'surface-container-low': '#161817',
        'surface-container': '#1C1F1D', // Deep Charcoal
        'surface-container-high': '#242825', // Deep Olive/Charcoal blend
        'surface-container-highest': '#2D322E',
        'secondary-bg': '#1B201B', // Deep Olive undertone
        surface: '#292C26',
        outline: '#7A7363', // Dark Bronze Outline
        'outline-variant': '#3D382B', // Subtle Dark Bronze
        primary: '#C9A86A', // Warm Metallic Champagne Gold
        'primary-hover': '#D6B77B', // Brightened Warm Gold
        'primary-accent': '#594F3B',
        'luxury-accent': '#8C7F67',
        'on-primary': '#1A1405',
        'on-surface': '#F5F2EA', // Soft Ivory
        'on-surface-variant': '#C7C2B4', // Warm Off-White
        'on-background': '#F5F2EA',
        muted: '#857F71'
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
        'gold-glow': '0 0 35px rgba(201, 168, 106, 0.18)',
        'gold-glow-lg': '0 0 60px rgba(201, 168, 106, 0.28)'
      }
    },
  },
  plugins: [],
}
