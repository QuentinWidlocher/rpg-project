import daisyui from 'daisyui';
import typography from '@tailwindcss/typography'
import  containerQueries from '@tailwindcss/container-queries'
import themes from 'daisyui/src/theming/themes';

import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {}
  },
  daisyui: {
    themes: [
      {
        default: {
          ...themes.light,
          "primary": "#76280F",
          "base-100": "#FFFFFF",
          "base-200": "#F3F1E5",
          "base-300": "#E0DCC3",
          "--rounded-box": "16px",
          "--rounded-btn": "16px",
        },
      },
    ],
  },
  plugins: [
    daisyui,
    typography,
    containerQueries,
  ]
} satisfies Config;
