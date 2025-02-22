/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'hover-bg': 'var(--hover-bg)',
        'border-color': 'var(--border-color)',
        'video-hover': 'var(--video-hover)',
        'sidebar-bg': 'var(--sidebar-bg)',
      }
    },
  },
  plugins: []
}; 