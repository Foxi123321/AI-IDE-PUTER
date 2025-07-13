/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/renderer/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#1e1e1e',
        'editor-sidebar': '#252526',
        'editor-line': '#2d2d30',
        'editor-text': '#d4d4d4',
        'editor-comment': '#6a9955',
        'editor-keyword': '#569cd6',
        'editor-string': '#ce9178',
        'ai-suggestion': '#264f78',
        'ai-highlight': '#0078d4',
        'ghost-text': '#6a737d',
      },
      fontFamily: {
        'mono': ['Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 2s steps(20, end) infinite',
      },
      keyframes: {
        typing: {
          '0%': { width: '0' },
          '50%': { width: '100%' },
          '100%': { width: '0' },
        }
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
};