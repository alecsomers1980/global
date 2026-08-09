import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amber: '#FFAF19',
        'amber-soft': '#FFB156',
        // Brand amber is 1.84:1 on white — far below WCAG AA. It stays for fills
        // and for text on ink (10:1 there). This darker amber is for text and
        // icons sitting on white, where it measures 4.91:1.
        'amber-text': '#9A6600',
        ink: '#141414',
        paper: '#FFFFFF',
        text: '#1F1F1F',
      },
      borderRadius: { DEFAULT: '3px' },
      fontFamily: { sans: ['var(--font-josefin)', 'sans-serif'] },
      letterSpacing: { wide2: '0.08em', wide3: '0.12em', wide4: '0.2em' },
      maxWidth: { container: '1200px' },
    },
  },
  plugins: [],
};

export default config;
