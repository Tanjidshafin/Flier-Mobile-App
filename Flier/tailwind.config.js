/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF9F1A',
          primaryDeep: '#FF8B0A',
          primarySoft: '#FFC468',
          surface: '#FFFFFF',
          surfaceMuted: '#FFF7EA',
          text: '#262B36',
          muted: '#A8ADB7',
          border: '#E8E8EC',
          dot: '#D9DDE3',
          shadow: 'rgba(17, 24, 39, 0.08)',
        },
      },
      borderRadius: {
        hero: '110px',
        card: '32px',
        pill: '20px',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
