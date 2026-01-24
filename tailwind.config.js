/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Merriweather', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark mode palette based on "The Nature of Things" design
        background: '#1a1614', // Deep warm brown/black
        surface: '#2c2420',    // Lighter warm brown
        accent: '#d4b483',     // Gold/Paper color
      }
    },
  },
  plugins: [],
};
