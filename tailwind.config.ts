import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#06142D',
        'midnight': '#0A1F44',
        'charcoal': '#111111',
        'steel': '#8E99A8',
        'silver': '#C0C0C0',
        'cyan': '#00D4FF',
        'cyan-glow': '#4DEBFF',
        'success': '#2ECC71',
        'alert': '#FF4D4F',
      },
      fontFamily: {
        head: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config