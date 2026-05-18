/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        bg: "#070b10",
        panel: "#0e141d",
        panel2: "#121a25",
        line: "#223044",
        muted: "#8ea0b8",
        text: "#e7edf6",
        long: "#18c683",
        short: "#ff5f6d",
        warn: "#f6c343",
        danger: "#ff3d57",
        cyan: "#27c7d8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(39,199,216,.12), 0 18px 60px rgba(0,0,0,.35)",
      },
    },
  },
  plugins: [],
};
