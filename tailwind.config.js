/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        palm: {
          50: '#f5fbf6',
          100: '#e6f6e8',
          500: '#2f8f5b',
          700: '#1f6a42',
          900: '#12422a'
        },
        gold: {
          100: '#fff7dc',
          300: '#f3d27a',
          500: '#d6ad45'
        }
      },
      boxShadow: {
        soft: '0 10px 35px -20px rgba(18, 66, 42, 0.45)'
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};