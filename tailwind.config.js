/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary-main)',
                'on-primary': 'var(--primary-text)',
                surface: 'var(--bg-card)',
                background: 'var(--bg-default)',
                'surface-highlight': 'var(--bg-subtle)',
                'text-main': 'var(--text-primary)',
                'text-muted': 'var(--text-secondary)',
                border: 'var(--border-default)',
            },
            spacing: {
                'safe-top': 'var(--sat)',
                'safe-bottom': 'var(--sab)',
            },
            borderRadius: {
                'xl': 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
            }
        }
    },
    plugins: [],
}
