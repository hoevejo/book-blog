// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // or wherever your files are
  ],
  theme: {
    extend: {
      keyframes: {
        bounceDot: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.5" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "bounce-dot": "bounceDot 1.2s infinite",
      },
    },
  },
  plugins: [],
};
