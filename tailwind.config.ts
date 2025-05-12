import type { Config } from "tailwindcss";
import { content, plugin } from 'flowbite-react/tailwind';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    content()
  ],
  safelist: [
    'bg-green-400',
    'bg-red-400',
    'bg-orange-400',
    'bg-blue-400',
    'bg-purple-400',
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Inter', ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [plugin()],
} satisfies Config;
