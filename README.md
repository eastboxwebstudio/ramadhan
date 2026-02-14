# Ramadan Web App (Malaysia)

Ramadan-focused React app for Malaysian users with prayer times, countdowns, Ramadan calendar highlights, daily motivation, and Klinik Al-Quran session availability.

## Tech Stack
- React + Vite
- Tailwind CSS
- Lucide React icons
- Client-side state with React Hooks
- Deployment target: Cloudflare Pages

## Local Setup
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

This generates production assets in `dist/`.

## Deploy to Cloudflare Pages

### Option A: Drag-and-drop
1. Run `npm run build`.
2. Open Cloudflare Dashboard > Pages > Create project.
3. Choose `Direct Upload`.
4. Upload the `dist/` folder.

### Option B: Git Integration (recommended)
1. Push this project to GitHub/GitLab.
2. Cloudflare Pages > Create project > Connect to Git.
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `>=18`
4. Save and deploy.

### Option C: Wrangler CLI
```bash
npm install -D wrangler
npx wrangler pages deploy dist --project-name ramadhan-malaysia
```

## Notes
- Prayer times are fetched from Aladhan public API using geolocation or selected Malaysia zone coordinates.
- Klinik Al-Quran is active only from 10:30 PM to 11:00 PM local browser time.
- Daily Doa and Hadith are loaded from a local JSON file (`src/data/dailyContent.json`).