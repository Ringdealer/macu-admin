/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./backend/pages/**/*.html",
    "./backend/templates/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',       // Deep Blue - main brand color, buttons, header
          hover: '#2563EB',         // Bright Blue - button hover, links
          light: '#E0E7FF',         // Light Blue - backgrounds, cards
        },
        accent: {
          DEFAULT: '#FBBF24',       // Golden Yellow - prices, badges, highlights
          light: '#FEF3C7',         // Light Yellow - subtle badge bg
        },
        neutral: {
          bg: '#F3F4F6',            // Light Gray - main page background
          card: '#FFFFFF',           // White - card background
          border: '#D1D5DB',         // Light border lines
          text: '#111827',           // Dark Gray - main text
          secondary: '#6B7280',      // Secondary text
        },
        success: '#16A34A',         // Green - confirmation messages
        error: '#DC2626',           // Red - error messages
      },
    },
  },
  plugins: [],
}

