import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/tailwind-scrollbar/**/*.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      flex: {
        "1-3": "1 3",
      },
      height: {
        "95percents": "95%",
      },
      colors: {
        "sneakers-second": "#111313",
        "sneakers-first": "#191b1c",
        "sneakers-button": "rgb(13,130,102)",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};

export default config;
