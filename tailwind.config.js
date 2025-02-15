/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'yt-black': '#0f0f0f',
        'yt-dark': '#272727',
        'yt-secondary': '#303030',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ]
}; 