/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        postman: {
          orange: '#FF6C37',
          'orange-dark': '#E05A28',
          dark: '#1A1A2E',
          darker: '#12121F',
          sidebar: '#1E1E2E',
          panel: '#252535',
          surface: '#2D2D3F',
          border: '#3A3A4D',
          'border-light': '#4A4A5E',
          text: '#E2E2EF',
          'text-muted': '#9090AA',
          'text-dim': '#6A6A80',
          accent: '#FF6C37',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
