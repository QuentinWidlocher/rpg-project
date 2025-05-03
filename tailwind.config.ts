import containerQueries from '@tailwindcss/container-queries'
import scrollbar from 'tailwind-scrollbar'

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
  plugins: [
    // containerQueries,
    // scrollbar,
  ]
} satisfies Config;
