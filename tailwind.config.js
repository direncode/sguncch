/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'carolina-blue': '#4B9CD3',
        'navy': '#13294B',
      },
    },
  },
  plugins: [],
}
