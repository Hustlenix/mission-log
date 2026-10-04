# Mission Log

A personal engineering/build journal. Projects are missions, blog posts are mission logs, and the website is mission control.

## Why I built it

Git commits, screenshots and random messages are terrible ways of remembering how something was built. Mission Log is where I document what worked, what broke, what changed, and what I learned while shipping through Stardance 2026.

## Features

- Create, edit, and delete blog posts with Markdown support
- Reading time calculated from content
- Tags and project-based mission grouping
- Global search across titles, excerpts, content, projects, and tags
- Better Auth email/password authentication
- Server-side authorization for publishing (only authorized authors can create/edit/delete)
- NASA Astronomy Picture of the Day integration
- NASA Near-Earth Object data on article pages
- Responsive design (mobile, tablet, desktop)
- SEO metadata, Open Graph tags, and sitemap
- Custom 404 page

## How it works

Posts are stored in MongoDB via Mongoose. Authentication uses Better Auth with email/password. Publishing is gated by an `AUTHORIZED_AUTHOR_EMAILS` environment variable — being logged in does not automatically grant publishing rights. NASA data is fetched server-side and cached for one hour.

## Tech

- Next.js 16 (App Router, Server Components, Server Actions)
- React 19
- TypeScript
- Mongoose + MongoDB Atlas
- Better Auth
- Tailwind CSS 4
- Vercel (deployment)

## Running locally

```bash
npm install
cp .env.example .env.local
# Fill in your environment variables
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `BETTER_AUTH_URL` | Base URL of your app (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Random secret for Better Auth |
| `NASA_API_KEY` | NASA API key (get one at api.nasa.gov) |
| `AUTHORIZED_AUTHOR_EMAILS` | Comma-separated list of emails allowed to publish |

## Project structure

```
src/
  app/              # Next.js App Router pages
  components/       # Shared components (header, footer)
  lib/              # Database, auth, NASA, server actions
  models/           # Mongoose models
```

## Deployment

This app is designed for Vercel. Connect your GitHub repository, add the environment variables in the Vercel dashboard, and deploy.

## Things I learned

- Hardware debugging is 90% reading datasheets and 10% actually changing code
- Delete code fearlessly — the first version teaches you what to build
- Server-side authorization is not optional — hiding UI elements is not security

## Known limitations

- No image upload yet (cover images are URL-only)
- No comments or reactions
- No RSS feed
- Search is basic regex-based (no full-text index ranking)
