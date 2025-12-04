module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Share Tech Mono", "monospace"],
      },
      animation: {
        "pulse-green": "pulse-green 2s infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 3s ease-in-out infinite",
        matrix: "matrix 5s linear infinite",
      },
      keyframes: {
        "pulse-green": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        glow: {
          from: { textShadow: "0 0 5px #00ff00" },
          to: { textShadow: "0 0 10px #00ff00, 0 0 15px #00ff00" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        matrix: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
