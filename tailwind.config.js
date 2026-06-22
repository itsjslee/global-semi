/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core environment palette (matches the 3D scene)
        ocean: {
          DEFAULT: '#1A3A54',
          deep: '#12293C',
        },
        sand: {
          DEFAULT: '#E2D9C5',
          dark: '#C9BFA6',
        },
        // UI accents
        mint: {
          DEFAULT: '#00A86B',
          soft: '#3FBF8C',
        },
        coral: {
          DEFAULT: '#FF7F66',
          soft: '#FF9E8A',
        },
        ink: '#16202A',
        paper: '#FBFAF6',
        cream: '#FDFCFA',
        // Supply-chain layer colors (also used for 3D node markers)
        cat: {
          eda: '#7C5CFF',         // EDA & IP — violet
          materials: '#C56B4A',   // Raw materials — terracotta
          equipment: '#F2A33C',   // Wafer fab equipment — amber
          design: '#00A86B',      // Chip design — mint
          foundry: '#2E8BC0',     // Foundry — blue
          osat: '#FF7F66',        // OSAT / packaging — coral
          integration: '#5E708A', // Integration & OEM — slate
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        marker: '0 6px 20px -6px rgba(16, 32, 42, 0.45)',
        card: '0 24px 60px -20px rgba(16, 32, 42, 0.45)',
        rail: '0 10px 40px -12px rgba(16, 32, 42, 0.35)',
      },
      letterSpacing: {
        widest2: '0.28em',
      },
    },
  },
  plugins: [],
}
