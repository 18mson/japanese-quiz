/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Klee One"', '"Hiragino Sans"', '"Yu Gothic"', '"Meiryo"', 'sans-serif'],
        jp: ['"Klee One"', '"Hiragino Sans"', '"Yu Gothic"', '"Meiryo"', 'sans-serif'],
      },
      colors: {
        // Japanese Charcoal & Washi Warm Dark Palette
        slate: {
          50: '#F8FAFC',  // Kertas Light Slate bersih untuk Light Mode (Opsi 2)
          100: '#EDEAE4', // Teks Utama Dark Mode (Off-white lembut seperti kertas washi)
          200: '#e4e2db',
          300: '#cfccc4',
          400: '#9E9CA3', // Teks Muted / Sub (Furigana / arti kata sekunder)
          500: '#777582',
          600: '#55535F',
          700: '#3E3D48',
          750: '#34343E',
          800: '#2C2C34', // Border / Divider (Garis batas lembut & tidak kontras kaku)
          850: '#24242B',
          900: '#1C1C21', // Surface / Card / Background Utama
          950: '#1C1C21', // Charcoal hangat selaras dengan card content
        },
        stone: {
          50: '#F8FAFC',
          100: '#EDEAE4', // Teks Utama
          200: '#e4e2db',
          300: '#cfccc4',
          400: '#9E9CA3', // Teks Muted / Sub
          500: '#777582',
          600: '#55535F',
          700: '#3E3D48',
          750: '#34343E',
          800: '#2C2C34', // Border / Divider
          850: '#24242B',
          900: '#1C1C21', // Surface / Card
          950: '#1C1C21',
        },
        zinc: {
          50: '#F8FAFC',
          100: '#EDEAE4',
          200: '#e4e2db',
          300: '#cfccc4',
          400: '#9E9CA3',
          500: '#777582',
          600: '#55535F',
          700: '#3E3D48',
          750: '#34343E',
          800: '#2C2C34',
          850: '#24242B',
          900: '#1C1C21',
          950: '#1C1C21',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#EDEAE4',
          200: '#e4e2db',
          300: '#cfccc4',
          400: '#9E9CA3',
          500: '#777582',
          600: '#55535F',
          700: '#3E3D48',
          750: '#34343E',
          800: '#2C2C34',
          850: '#24242B',
          900: '#1C1C21',
          950: '#1C1C21',
        },
        // Semantic Nihongo Dark Palette
        nihongo: {
          bg: '#1C1C21',
          surface: '#1C1C21',
          card: '#1C1C21',
          border: '#2C2C34',
          torii: '#E05A47',
          'torii-light': '#F87171',
          matcha: '#10B981',
          'matcha-light': '#34D399',
          washi: '#EDEAE4',
          muted: '#9E9CA3',
          aizome: '#1B365D',
        },
        // Traditional Japanese Indigo Navy (Aizome / 藍染) - Aksen Utama Light Mode
        aizome: {
          DEFAULT: '#1B365D',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#334E68',
          600: '#1B365D',
          700: '#142A4A',
          800: '#0F2038',
          900: '#0A1526',
          950: '#060D18',
          hover: '#142A4A',
          light: '#2E5B88',
        },
        // Re-map indigo scale to Aizome Japanese Navy to calm down electric purple accents
        indigo: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#334E68',
          600: '#1B365D',
          700: '#142A4A',
          800: '#0F2038',
          900: '#0A1526',
          950: '#060D18',
        },
        // Aksen Utama (Torii) - Tombol CTA Dark Mode, streak, badge aktif
        torii: {
          DEFAULT: '#E05A47',
          50: '#FDF3F2',
          100: '#FCE7E4',
          200: '#F8C8C2',
          300: '#F4A59B',
          400: '#F87171',
          500: '#E05A47',
          600: '#C74432',
          700: '#9E3224',
          800: '#752419',
          900: '#4D170F',
          hover: '#C74432',
          light: '#F87171',
          dark: '#E05A47',
        },
        // Aksen Sekunder (Matcha) - Jawaban benar / indikator hafal
        matcha: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          hover: '#059669',
          light: '#34D399',
          dark: '#10B981',
        },
        primary: {
          DEFAULT: '#1B365D',
          hover: '#142A4A',
        },
        secondary: '#F9A8D4',
        accent: '#0D9488',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      }
    },
  },
  plugins: [],
}