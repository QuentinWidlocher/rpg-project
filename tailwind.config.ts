import daisyui from 'daisyui';
import typography from '@tailwindcss/typography'
import containerQueries from '@tailwindcss/container-queries'
import scrollbar from 'tailwind-scrollbar'
import themes from 'daisyui/src/theming/themes';

import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      aria: {
        current: 'current="true"'
      },
      fontFamily: {
        serif: ['Platypi Variable', 'serif']
      },
      colors: {
        "base-400": "#97916c",
      }
    }
  },
  daisyui: {
    themes: [
      {
        default: {
          ...themes.light,
          "primary": "#991b1b",
          "base-100": "#FFFFFF",
          "base-200": "#F3F1E5",
          "base-300": "#E0DCC3",
          "--rounded-box": "6px",
          "--rounded-btn": "6px",
        },
      },
    ],
  },
  plugins: [
    daisyui,
    typography,
    containerQueries,
    scrollbar,
  ]
} satisfies Config;
