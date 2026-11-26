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
| M4 | MCQ, SRS, drill generators, board questions, method sheets | done |
| M5 | Exam centre, timed mocks, readiness and predicted GPA | done |
| M6 | Study plan, Focus timer, streaks, notices + web push | done |
| M7 | AI tutor Edge Function, photo marking, rate limits | done |
| M8 | Parent link, teacher dashboard, CSV export, analytics | done |
| M9 | Performance, accessibility, Playwright e2e | done |

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests (Vitest + fake IndexedDB)
npm run test:db      # applies supabase/migrations to a throwaway Postgres and runs RLS tests
npm run build && npm run size   # production build + first-load JS budget check
npm run e2e          # Playwright: onboarding, offline lesson, mock submit, sync after reconnect, axe WCAG AA
```

Without Supabase settings the app runs fully in guest mode (everything in IndexedDB).
To enable sign-in and sync, copy `.env.example` to `.env.local` and fill in the project
URL and anon key. The service-role key and the Anthropic API key are Supabase secrets
and must never be put in the client.

The end-to-end tests build the app twice (guest mode, and against a fake Supabase that
the tests serve from `public/content`) and run them on a 360 px phone viewport in Chromium.
Last measured: 147.8 KB first-load JS (gzip), Lighthouse mobile performance 92,
accessibility 100, best practices 100, SEO 100.

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
- **AI tutor** (`supabase/functions/tutor`, screen `/tutor`): online only, for signed-in
  students. The Edge Function calls Claude (`claude-sonnet-5-5`) with four tools over
  Alo's own data (`search_lessons`, `get_chapter_notes`, `get_student_progress`,
  `get_method_sheet`), and marks photos of handwritten creative answers part by part
  against the question's rubric (marks per part come from the rubric, never the model).
  Daily limits per student (20 questions, 5 photos; `TUTOR_DAILY_MESSAGES` /
  `TUTOR_DAILY_PHOTOS`) and token use are kept in `tutor_usage`; a failed call gives the
  unit back. The tutor is closed while any routine paper is being written. Photos go to
  the private `tutor-photos` bucket, one folder per student. The pure logic lives in
  `supabase/functions/_shared/tutor-logic.ts` and is unit-tested with the app.
  To switch it on: `supabase secrets set ANTHROPIC_API_KEY=...` (in your terminal, not in
  chat) and `supabase functions deploy tutor`.
- **Parents and teachers** (`/connect` for students, `/parent`, `/teacher`): online only.
  The student's own device publishes a small summary (streak, weekly focus minutes,
  readiness per subject, predicted GPA range) to `student_summaries` after each sync;
  linked parents and class teachers read that, never raw answers or tutor chats.
  A parent links with a single-use 8-character code the student makes (valid 2 days,
  10 tries a day). Students join a class with its code and a nickname; teachers see a
  mastery heatmap and mock results (`class_overview`) and can download CSV.
- **Analytics** (`/admin/analytics`): daily active students, lesson completion and
  hardest questions from the `events` and `attempts` tables, aggregated in SQL
  (`admin_analytics`, admins only).
- **PWA**: vite-plugin-pwa precaches the app shell and the Bengali/Latin font subsets.
  supabase-js is excluded from precache and loaded only when needed.

## Content rights

Lessons, explanations, model answers and questions in this repo are original work.
NCTB textbooks (free government PDFs) and public board questions are used only as
references. Nothing is copied from commercial guide books.
