/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,jsx,js,ts,tsx}"],
    theme: {
      extend: {},
      fontFamily: {
        'sans': ['Lato-Regular','ui-sans-serif', 'system-ui'],
        'serif': ['Kanit-Regular', 'ui-serif', 'Georgia'],
        'mono': ['JetBrainsMono-VariableFont', 'ui-monospace', 'SFMono-Regular'],
        'code': ['JetBrainsMono-VariableFont', 'ui-monospace', 'SFMono-Regular'],
        'display': ['Lato-Regular','ui-sans-serif', 'system-ui'],
        'body': ['Lato-Regular','ui-sans-serif', 'system-ui'],
        'heading': ['Kanit-Regular','ui-sans-serif']
      }
    },
    plugins: [],
}
  