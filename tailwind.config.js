/** @type {import('tailwindcss').Config} */
// Design tokeny Institutu efektivity – sdílíme paletu s institutefektivity.cz.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1E3A5F",
          "blue-light": "#2A4A73",
          "blue-dark": "#142943",
          teal: "#2EC4B6",
          "teal-light": "#3DD4C6",
          "teal-dark": "#1FA294",
          gray: "#F8FAFC",
          "gray-dark": "#64748B",
        },
        page: "#FAFBFC",
        // electionmap akcent (co-branding) – z loga electionmap.cz
        emap: {
          DEFAULT: "#1666D7",
          navy: "#0B1D3A",
          red: "#E21039",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(30,58,95,.08)",
        "card-hover": "0 12px 40px rgba(30,58,95,.14)",
        glass: "0 8px 32px rgba(30,58,95,.10)",
        cta: "0 10px 30px rgba(46,196,182,.30)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up .6s cubic-bezier(.16,1,.3,1) both",
        "scale-in": "scale-in .4s cubic-bezier(.16,1,.3,1) both",
      },
    },
  },
  plugins: [],
};
