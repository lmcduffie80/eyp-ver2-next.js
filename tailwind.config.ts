import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a1a",
        secondary: "#ffffff",
        accent: "#ff6b35",
        "text-dark": "#333",
        "text-light": "#666",
        "bg-light": "#f8f8f8",
      },
    },
  },
  plugins: [],
};
export default config;

