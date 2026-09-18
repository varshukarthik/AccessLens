/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#ebeff4',
          200: '#d3dce7',
          300: '#adc0d3',
          400: '#819fbc',
          500: '#6082a5',
          600: '#4a698c',
          700: '#3c5471',
          800: '#34475e',
          900: '#2d3d4f',
          950: '#1b2532',
        },
        slate: {
          850: '#151e2e',
          950: '#0a0f19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
