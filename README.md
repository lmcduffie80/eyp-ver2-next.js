# Externally Yours Productions - Next.js Website

A Next.js recreation of the eyp-static.vercel.app website for Externally Yours Productions, LLC.

## Features

- Modern Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design
- Portfolio galleries
- Testimonials section
- Available dates calendar
- Contact form with Honeybook integration
- Review submission form

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js app router pages and layouts
- `components/` - React components
- `public/` - Static assets (images, etc.)

## Pages

- `/` - Home page with all sections
- `/about` - About page
- `/photography` - Photography portfolio
- `/videography` - Videography services
- `/dj-entertainment` - DJ entertainment services

## API Routes

The site expects the following API routes (to be implemented):
- `/api/reviews` - Review submission and retrieval
- `/api/blocked-dates` - Get blocked dates
- `/api/bookings` - Get booking dates

## Deployment

This project is ready to deploy on Vercel:

```bash
vercel
```

## Troubleshooting

### If `pnpm dev`, `pnpm test`, `pnpm lint`, or `pnpm build` hangs

Almost always one of three things, all caused by macOS iCloud / Finder dropping
duplicate copies of files (e.g. `route 2.ts`, `page 3.tsx`) into the repo:

1. **macOS Finder duplicates** inside `app/`, `components/`, `lib/`, or
   `scripts/` confuse Next.js (Duplicate page warnings), ESLint, or the dev
   server.
2. **Stale jest cache or orphan jest processes** from a killed test run
   deadlock the next `pnpm test`.
3. **Jest scanning huge media folders** at the repo root.

Run the health check first to see what's going on, then `pnpm clean` to fix it:

```bash
pnpm health          # read-only health check
pnpm clean           # remove duplicates, kill orphan jest, clear jest cache
pnpm clean:dry       # preview clean without making changes
pnpm clean:dupes     # only remove macOS Finder duplicates
pnpm clean:jest      # only fix jest (kill orphans + clear cache)
```

> Note: `pnpm doctor` is a built-in pnpm command that checks pnpm itself.
> Use `pnpm health` (or `pnpm run doctor`) to run the project's health check.

A pre-commit hook (`.githooks/pre-commit`, auto-installed by `pnpm install`)
also blocks any commit that would introduce a new `* N.ext` duplicate.
