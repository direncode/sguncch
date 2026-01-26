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
        // UNC Brand Colors
        'carolina-blue': {
          DEFAULT: '#4B9CD3',
          50: '#E8F4FB',
          100: '#D1E9F7',
          200: '#A3D3EF',
          300: '#75BDE7',
          400: '#4B9CD3',
          500: '#2B7BB8',
          600: '#215F8E',
          700: '#184465',
          800: '#0E293B',
          900: '#050E12',
        },
        navy: {
          DEFAULT: '#13294B',
          50: '#E6E9EE',
          100: '#CCD3DD',
          200: '#99A7BB',
          300: '#667B99',
          400: '#334F77',
          500: '#13294B',
          600: '#0F213C',
          700: '#0B192D',
          800: '#08111E',
          900: '#04080F',
        },
        // Project Bold accent colors
        'bold-green': '#007749',
        'bold-gold': '#E8B00F',
        'bold-red': '#CC0000',
        'bold-purple': '#5B2C6F',
        'bold-orange': '#FF6B35',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
