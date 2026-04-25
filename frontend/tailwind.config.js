/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          light: '#fdf5e6',
          dark: '#4e342e',
          green: '#2e7d32',
        },
      },
    },
  },
  plugins: [],
}