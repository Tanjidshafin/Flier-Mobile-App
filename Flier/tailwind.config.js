/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F59E0B',
          primaryDeep: '#D97706',
          primarySoft: '#FCD34D',
          accent: '#0F766E',
          surface: '#FFFFFF',
          surfaceMuted: '#F6F1EA',
          surfaceElevated: '#FFF8F0',
          text: '#1F2937',
          muted: '#6B7280',
          border: '#E7DED2',
          dot: '#E7DED2',
          warning: '#F59E0B',
          error: '#DC2626',
          shadow: 'rgba(17, 24, 39, 0.08)',
        },
      },
      borderRadius: {
        hero: '110px',
        card: '32px',
        pill: '20px',
      },
      fontFamily: {
        sans: ['Poppins-Regular'],
        medium: ['Poppins-Medium'],
        semibold: ['Poppins-SemiBold'],
        bold: ['Poppins-Bold'],
        extrabold: ['Poppins-ExtraBold'],
      },
    },
  },
  plugins: [],
};
