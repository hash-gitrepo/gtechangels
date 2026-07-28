# GTECH Angels Platform

Matchmaking platform between GTECH member angel investors and Kerala startups,
built against `GTECH_Angels_Platform_PRS_v1.docx` (Section 4 functional
requirements are referenced by ID, e.g. `FR-18`, throughout the codebase).

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Prisma ORM** + **PostgreSQL** (hosted on [Railway](https://railway.app))
- **NextAuth.js** — OTP/magic-link login, no passwords ever stored
- **Resend** — transactional email (login codes, approvals, introductions, screening outcomes)
- **Netlify Blobs** — pitch deck PDF uploads (max 20MB), uploaded directly from the browser
- **Netlify** — hosting, via `@netlify/plugin-nextjs`

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY
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

**Pitch deck upload needs `netlify dev`, not plain `next dev`.** Netlify
Blobs (see below) only has a working local backend under the Netlify CLI —
run `npx netlify dev` instead once you've linked the project with
`npx netlify link` (or `netlify init` for a fresh site). Every other feature
works fine under plain `next dev`.

## Project layout

```
prisma/schema.prisma       7 core entities (Member, Startup, ScreeningRecord,
                            Introduction, Investment, Partnership, Event) plus
                            NextAuth's User/Account/Session/VerificationToken
                            and supporting tables (ControlledList, AuditLog).
src/lib/auth/               OTP issuing/verification + NextAuth options
src/lib/email/              Resend client, HTML templates, typed senders
src/lib/signedTicket.ts     HMAC tickets bridging Node (Prisma) and Edge
                            (no size cap) routes — see pitch deck notes below
src/lib/actions/            Server Actions for mutations (screening,
                            introductions, outcomes, events)
src/lib/kpi.ts              FR-32 KPI dashboard query
src/middleware.ts           Role-based route protection
src/app/(auth|signup)/      Public auth & signup flows
src/app/api/upload/pitch-deck/   3-step pitch deck upload (sign → blob → persist)
src/app/api/pitch-deck/[id]/     2-step gated pitch deck viewing (authorize → stream)
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
- **Pitch decks are split across a Node route and an Edge route, both ways.**
  Netlify's Node Functions (AWS Lambda) cap request/response bodies well
  under 20MB; Prisma can't run on the Edge runtime that doesn't have that
  cap. So authorization (needs Prisma) and the file transfer (needs no size
  cap) are always different routes, bridged by a short-lived HMAC ticket
  (`src/lib/signedTicket.ts`) so the Edge route can trust the Node route's
  auth check without touching the database itself:
  - **Upload** (`src/app/api/upload/pitch-deck/`): `sign` (Node, issues a
    ticket) → `blob` (Edge, writes the PDF to Netlify Blobs) → the parent
    route (Node, small JSON body, records the blob key on `Startup`).
  - **View** (`src/app/api/pitch-deck/[startupId]/`): the parent route
    (Node, checks the viewer is the owning startup, an approved angel, or a
    reviewer) 307-redirects to `stream` (Edge, verifies the ticket and
    streams the PDF from Blobs) — this is also what makes the confidentiality
    NFR ("decks accessible only to approved angels") actually enforced,
    rather than just an unguarded public URL.
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
- **Pitch decks:** no extra setup — Netlify Blobs is available on any Netlify site with zero config once deployed.
