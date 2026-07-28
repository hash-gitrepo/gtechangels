# GTECH Angels Platform

Matchmaking platform between GTECH member angel investors and Kerala startups,
built against `GTECH_Angels_Platform_PRS_v1.docx` (Section 4 functional
requirements are referenced by ID, e.g. `FR-18`, throughout the codebase).

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Prisma ORM** + **PostgreSQL** (hosted on [Railway](https://railway.app))
- **NextAuth.js** — OTP/magic-link login, no passwords ever stored
- **Resend** — transactional email (login codes, approvals, introductions, screening outcomes)
- **Cloudinary** — pitch deck PDF uploads (max 20MB), uploaded directly from the browser
- **Netlify** — hosting, via `@netlify/plugin-nextjs`

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY, CLOUDINARY_*
npm run db:push        # or `npm run db:migrate` once you're versioning migrations
npm run db:seed        # seeds controlled lists (sectors, domains, ...)
npm run dev
```

Open http://localhost:3000. Sign-up flows are at `/signup/angel` and
`/signup/startup`; both end at `/auth/verify`, where a 6-digit code emailed
via Resend both confirms the address and signs the user in.

If `RESEND_API_KEY` isn't set, emails are logged to the console instead of
sent — useful for local development. The OTP is also embedded in a link in
the (would-be) email body, so `console.log`ing it is enough to sign in
without a working inbox.

## Project layout

```
prisma/schema.prisma       7 core entities (Member, Startup, ScreeningRecord,
                            Introduction, Investment, Partnership, Event) plus
                            NextAuth's User/Account/Session/VerificationToken
                            and supporting tables (ControlledList, AuditLog).
src/lib/auth/               OTP issuing/verification + NextAuth options
src/lib/email/              Resend client, HTML templates, typed senders
src/lib/cloudinary.ts       Signed direct-to-Cloudinary upload (see below)
src/lib/actions/            Server Actions for mutations (screening,
                            introductions, outcomes, events)
src/lib/kpi.ts              FR-32 KPI dashboard query
src/middleware.ts           Role-based route protection
src/app/(auth|signup)/      Public auth & signup flows
src/app/angel/               Angel dashboard: directory + introduction requests
src/app/startup/             Startup dashboard: profile, deck upload, angel directory
src/app/admin/               Screening, introductions, outcomes, events, KPIs
src/app/screener/            Screener's scoped view of the screening queue
src/app/leadership/          View-only KPI dashboard
```

## Design notes worth knowing before you extend this

- **OTP, not classic magic-link tokens.** NextAuth's Credentials provider
  backs a custom 6-digit code flow (`src/lib/auth/otp.ts`), reusing the
  `VerificationToken` table as code storage. Sessions are JWT-based because
  Credentials providers can't use NextAuth's database session strategy.
- **Pitch decks upload straight to Cloudinary from the browser**
  (`src/lib/cloudinary.ts` signs the request, the client PUTs the file,
  then a small JSON callback persists the URL). Netlify's Lambda-based
  functions cap request bodies well under 20MB, so proxying the PDF through
  an API route would break for larger decks — signed direct upload avoids
  that entirely.
- **FR-02 (member register verification)** is stubbed in
  `src/lib/memberRegister.ts` and currently always passes. Wire it to
  whatever the Secretariat's actual member register turns out to be.
- **Prisma binary targets** include `rhel-openssl-3.0.x` for Netlify's Lambda
  runtime alongside `native` for local dev — keep both in
  `prisma/schema.prisma` if you change hosts.
- **Open questions from the PRD (Section 10)** are implemented with the
  PRD's stated defaults and are easy to flip: angel amount visibility
  defaults to `BAND` (`Member.amountVisibility`), startups do see the angel
  directory (`src/app/startup/page.tsx`), and introductions default to
  admin-facilitated (`Introduction.facilitatedByAdmin`).

## What's scaffolded vs. stubbed

Implemented end-to-end: signup → OTP verification → profile → screening
pipeline → directory browsing → introduction requests → admin-recorded
investments/partnerships → KPI dashboard → pitch deck upload.

Not built (Phase 2 per the PRD, or intentionally out of scope): automated
match scoring (FR-29), in-platform messaging (FR-40), WhatsApp notifications
(FR-39), monthly EC report export (FR-33), profile-completeness scoring
(FR-11), and a dedicated admin UI for controlled lists / user management
beyond the seed script — the `ControlledList` and `AuditLog` tables exist and
are ready for that UI.

## Deploying

- **Database:** provision PostgreSQL on Railway, copy the connection string into `DATABASE_URL`.
- **Netlify:** connect the repo; `netlify.toml` already points the build at
  `@netlify/plugin-nextjs`. Set the same env vars from `.env.example` in the
  Netlify site's environment settings, plus `NEXTAUTH_URL` set to the live domain.
- **Resend:** verify your sending domain before going live, or `EMAIL_FROM` will bounce.
- **Cloudinary:** no extra setup — the signed-upload flow works against any Cloudinary account.
