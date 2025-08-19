## NoteSmasher

A minimal web app for per-job daily notes with autosave, keyboard-friendly editing, date navigation, and a simple calendar view.

### Features
- Per-job notes stored locally in your browser (no backend yet)
- Daily note per job with autosave as you type
- Previous/Next navigation that skips empty days and respects a special "Today" rule
- Simple month calendar with dots for days that have notes

### Local Development
```bash
npm install
npm run dev
```

Open the URL printed in your terminal.

### Build
```bash
npm run build
npm run preview
```

### Deploy to GitHub Pages
1. Commit the repo and push to GitHub
2. Set the repo to allow GitHub Pages from `gh-pages` branch
3. Run:
```bash
npm run deploy
```

The site will be published to GitHub Pages. The Vite `base` is set to `./` so it also works from subpaths.

### Next Up
- User accounts and sync (Supabase/Firebase)
- Rich text/markdown support
- Search and cross-day linking
- Mobile layout

