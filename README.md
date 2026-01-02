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
