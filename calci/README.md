# Calci

Minimal React + Vite calculator app.

Getting started

1. Install dependencies (if you want the full React/Vite app):

```powershell
npm install
```

2. Start the dev server:

```powershell
npm start
```

If npm install is blocked by OS/permissions (common on Windows), there's a quick static fallback you can use without any Node tools:

Open `demo.html` in your browser (double-click the file or right-click -> Open with -> Browser). This is a standalone static demo that uses `index.css` and a tiny vanilla-JS calculator so you can preview the UI and basic functionality without installing dependencies.

Notes

- This repo originally used Tailwind classes; I replaced the Tailwind directives with a plain-CSS utility set in `index.css` so the components work without Tailwind installed.
- If you want Tailwind instead, install `tailwindcss` and `autoprefixer` as dev dependencies and restore the original `@tailwind` directives.
# Calci

This is a small React calculator app.

Getting started

1. Install dependencies:

```powershell
npm install
```

2. Start the dev server:

```powershell
npm start
```

This project uses Vite as the dev server. If you want to build for production, run `npm run build`.
