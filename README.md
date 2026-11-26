# আলো (Alo)

A free, phone-first, Bangla-first learning platform for SSC 2027 students in Bangladesh
(NCTB National Curriculum 2012, Class 9-10). *একবারে একটি পাঠ* — one lesson at a time.

Built for low-end Android phones on prepaid data: offline-first PWA, under 250 KB of
first-load JavaScript, lessons as narrated scenes instead of video.

## Status

| Milestone | Scope | State |
|---|---|---|
| M1 | App shell, i18n (bn/en), auth + guest mode, onboarding, PWA, offline banner | done |
| M2 | Content model, admin CMS, seed data, subjects/chapters | done |
| M3 | Lesson player, offline download, data saver | done |
| M4 | MCQ, SRS, drill generators, board questions, method sheets | next |
| M5 | Exam centre, timed mocks, readiness and predicted GPA | |
| M6 | Study plan, Focus timer, streaks, notices + web push | |
| M7 | AI tutor Edge Function, photo marking, rate limits | |
| M8 | Parent link, teacher dashboard, CSV export, analytics | |
| M9 | Performance, accessibility, Playwright e2e | |

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests (Vitest + fake IndexedDB)
npm run test:db      # applies supabase/migrations to a throwaway Postgres and runs RLS tests
npm run build && npm run size   # production build + first-load JS budget check
```

Without Supabase settings the app runs fully in guest mode (everything in IndexedDB).
To enable sign-in and sync, copy `.env.example` to `.env.local` and fill in the project
URL and anon key. The service-role key and the Anthropic API key are Supabase secrets
and must never be put in the client.

## Content

- Seed content is authored in `content/` as TypeScript (`{ bn, en }` text, written once per
  language). `npx tsx scripts/build-content.ts` validates it (4 options per MCQ, CQ rubrics
  add up to the marks, 8-10 scenes per lesson with a check question every 2-3 scenes) and
  writes `public/content/` (offline packs) and `supabase/seed.sql`.
- The admin CMS lives at `/admin`. With Supabase it edits the tables (admins only, enforced by
  RLS). Without Supabase it runs in local mode: edits stay in the browser, show up in the
  student screens, and can be exported as JSON.
- Narration: `build-content.ts` makes placeholder audio with espeak-ng (Opus, mono, 24 kbps,
  about 3 KB per second) when `espeak-ng` and `ffmpeg` are installed, and fails the build if a
  lesson goes over 3 MB per 10 minutes. Real recordings replace it through the scene editor.
- Question bulk import: `/admin/import` takes a CSV (template downloadable there); every row
  is validated and only valid rows are imported.

## Live preview

Every push to `main` or a milestone branch (`m*`) deploys to GitHub Pages at
https://albhi07.github.io/alo/ (Settings → Pages → Source must be "GitHub Actions").

## How it fits together

- **React 18 + Vite + TypeScript + Tailwind**, routes lazy-loaded per screen.
- **i18n**: `src/i18n/bn.json` and `en.json` hold every string. A post-processor turns
  digits into ০-৯ when the UI is Bangla; `useT()` also gives Bangla dates
  ("১৪ মার্চ ২০২৭") and timers. Switching language never reloads the page.
- **Offline data**: Dexie (`src/db`). Every write goes to IndexedDB and an outbox in one
  transaction (`saveLocal`). `flush()` pushes the outbox in batches with exponential
  backoff when online and signed in. Ids are minted on the device and upserted on `id`,
  and a Postgres trigger (`lww_guard`) applies last-write-wins by `updated_at`, so
  retries never duplicate and late, older writes never win.
- **Guest mode**: rows are stored with `user_id = null`. On sign-in, `adoptGuestRows`
  stamps them with the new user id and queues them.
- **Exam dates are data**: `src/data/exam.ts` is the offline fallback; the live copy comes
  from the `exam_config` and `routine` tables. Seeded 2027 dates are flagged
  **unverified** until an admin checks them against the board PDF.
- **PWA**: vite-plugin-pwa precaches the app shell and the Bengali/Latin font subsets.
  supabase-js is excluded from precache and loaded only when needed.

## Content rights

Lessons, explanations, model answers and questions in this repo are original work.
NCTB textbooks (free government PDFs) and public board questions are used only as
references. Nothing is copied from commercial guide books.
