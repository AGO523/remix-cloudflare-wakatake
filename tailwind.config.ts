import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        flipPage: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
      },
      animation: {
        "flip-page": "flipPage 2s ease-in-out forwards",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["retro", "winter", "dark", "aqua"],
  },
} satisfies Config;
