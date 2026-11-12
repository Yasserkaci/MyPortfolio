# Yaser Kaci, portfolio

A React + Vite portfolio backed by Supabase, with an admin panel that controls every word, color, image and section on the public site.

## Stack

- React 19, Vite 7 (Rollup WASM build, works with Windows Smart App Control), React Router
- Supabase (Postgres, Auth, Storage) with row-level security
- Motion for animation, Lenis for smooth scrolling
- Tiptap rich-text editor in the admin
- Geist (self-hosted via Fontsource), Phosphor icons

## Run locally

```bash
npm install
npm run dev
```

`.env` already points at the Supabase project. For a different project, copy `.env.example` to `.env` and fill in the URL and publishable key.

## Admin

- Public site: `/`
- Project pages: `/work/<slug>`
- Admin: `/admin` (sign in at `/admin/login`)

Admin sections:

| Section | What it controls |
| --- | --- |
| Overview | Counts, recently edited projects, quick links |
| Projects | Create, edit, reorder (drag), feature, publish, delete. Rich editor with images, links, quotes, code, YouTube embeds, plus cover image and gallery |
| Experience | Timeline entries, drag to reorder |
| Skills | Stack chips grouped by category, with simpleicons.org icon slugs |
| Messages | Contact-form submissions, mark read, reply via email |
| Site settings | Identity, hero, navigation, marquee, work, about, experience, contact, socials, footer, theme (colors, font, corner style, effects), section order and visibility, SEO |
| Account | Change password |

Only emails listed in the `admin_users` table can write. Anyone else who signs in sees a "not on the allowlist" message. To add another admin, insert their email into `admin_users` in the Supabase dashboard and create the user under Authentication.

## Database

Tables: `site_settings` (single JSON row), `projects`, `experience`, `skills`, `messages`, `admin_users`. Storage bucket: `media` (public read, admin write). Schema lives in the Supabase migration `portfolio_schema`.

## Deploy

```bash
npm run build
```

Deploy the `dist` folder to Vercel, Netlify or any static host. `vercel.json` and `public/_redirects` already rewrite all routes to `index.html` for client-side routing. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on the host if you do not commit `.env`.

After deploying, add the production URL to Supabase: Authentication, URL configuration, Site URL and Redirect URLs.
