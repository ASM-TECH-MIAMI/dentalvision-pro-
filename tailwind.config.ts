import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0A0A',
          charcoal: '#1A1A1A',
          'warm-gray': '#2D2D2D',
          'mid-gray': '#6B6B6B',
          'light-gray': '#F5F5F3',
          cream: '#FAF9F7',
          gold: '#C4A265',
          'gold-light': '#D4B87A',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
      spacing: {
        'section': '96px',
      }
    },
  },
  plugins: [],
};
export default config;
