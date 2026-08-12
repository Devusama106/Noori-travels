# Noori Travels — Booking Portal

A two-panel flight/Umrah booking system built with **Next.js 16 (App Router) + Tailwind CSS v4**, backed by a real **SQLite database** (via `better-sqlite3`) and **NextAuth** authentication with two roles.

- **User panel** (travel agent): dashboard, flight/Umrah package search with city autocomplete, a shopping cart to save multiple flights before booking, booking review + traveller details, booking history, manual deposit slip submission with its own ledger (filter + CSV download), live "remaining booking limit" display.
- **Admin panel**: dashboard, add/manage flight & Umrah package listings, upload a logo per airline, create User/Admin accounts with per-user booking limits, approve or reject pending payments, approve or reject deposit slips (auto-credits the user's wallet), a separate filterable ledger per user, and view/update all bookings.

Data flows one way, live: whatever the admin adds in **Add Flight/Package** immediately appears in the user's search results, filters, and city autocomplete suggestions. Whatever a user books, or deposits, immediately appears in the admin's lists, and status/approval changes made by the admin immediately reflect on the user's side.

## Advanced: in-app notifications & printable tickets

- **Notification bell** (header, both roles) — a live, in-app feed of everything that needs attention, on top of the existing emails. Unread count badge, dropdown list, click-to-open-and-mark-read, "mark all read," and light 30-second polling so approvals show up without a manual refresh.
  - Agents get notified: booking received, payment approved/rejected, booking status changed, deposit approved/rejected, registration approved/rejected.
  - Admins get notified: new registration request, a booking needs payment approval, a new deposit slip was submitted.
- **Printable e-ticket / invoice** — every booking confirmation page has a **Print / Download Ticket** button that opens a clean, print-formatted itinerary (PNR, flight legs, passenger table, fare breakdown, Noori Travels branding). Uses the browser's native print dialog, so "Save as PDF" works with zero extra dependencies.

## Account & notifications

- **Forgot / reset password** — `/forgot-password` emails a secure, single-use link (valid 1 hour) via the same SMTP setup described below; `/reset-password?token=...` sets the new password. Works without SMTP too (logs to console).
- **My Profile** (`/profile`, both roles) — edit your name/phone/address and change your password (requires the current password).
- **Booking email notifications** — agents get emailed when a booking is placed (Hold or submitted for approval), admins get emailed when a payment needs approval, and agents get emailed again the moment an admin approves, rejects, or otherwise changes a booking's status.
- **Search on admin tables** — `/admin/users`, `/admin/flights`, and `/admin/bookings` all have an instant client-side search box (name/email/phone, airline/route/flight number, or ref/agent/route/status) so long lists stay easy to navigate.

## Self-registration & approval

- New agencies sign themselves up at `/register` (linked from the user login page) with name, email, phone, address, and a password — every field is required.
- New accounts start out **PENDING** and cannot sign in yet. All current admins are emailed automatically with the applicant's details.
- Admins review requests on `/admin/users` — pending rows are highlighted with **Approve** / **Reject** buttons right there (also surfaced as a banner on the admin dashboard). Approving sets the account to **ACTIVE** and emails the applicant so they know they can now log in; rejecting emails them the outcome too.
- Accounts an admin creates directly from `/admin/users/new` skip this queue and are ACTIVE immediately, since the admin is vouching for them.
- Email sending uses SMTP if configured (`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/... in `.env.local`) — without it, the app still works fully and simply logs what would have been sent to the server console, so you can test the whole flow with zero email setup.

## Deposits (manual bank slip submission)

- Users submit a deposit from `/deposits`: payment mode, the company's beneficiary bank account (managed by admin), their own paying bank + account number, amount, payment date, a reference, and an optional attachment (image/PDF slip, stored as the record's attachment).
- Every submission is `Pending` until an admin reviews it from `/admin/deposits`.
- **Approving** a deposit credits the amount to that user's `walletBalance`; reversing a decision (e.g. switching it back) automatically undoes the credit — the balance always matches the sum of currently-approved deposits.
- The admin ledger has a **"View Ledger For"** user filter — pick a user to see only their deposit history (their personal ledger of everything approved/rejected/pending), or leave it on "All Users" for the combined view.
- Both the user's own ledger and the admin's ledger support status filtering, free-text search, viewing/downloading an individual attachment, and a **"Download Ledger (CSV)"** button that exports exactly what's currently filtered/visible.
- Company beneficiary bank accounts are managed via the `beneficiary_accounts` table (seeded with two sample accounts) — extend `POST /api/beneficiary-accounts` or add an admin UI for it if you want to manage these without touching the database directly.

## Airline logos

- `/admin/airlines` lets an admin upload a logo per airline (e.g. PIA vs AirSial) — either by picking an image file (stored as a compact base64 image) or pasting an image URL.
- Logos are matched by airline name and automatically show up on search results, the booking review page, the booking confirmation page, and the admin flights list — no need to re-upload per flight. Airlines without a logo fall back to a colored initials badge.

## Cart (save multiple flights, book one at a time)

- A cart icon sits in the header (next to the messages icon) for **User** accounts, with a live badge showing how many items are saved.
- On any search result, **Add to Cart** saves that flight/package without leaving the results page — adding the same flight twice is a no-op, not a duplicate.
- `/cart` lists everything saved: each card shows the route, dates, and price, with **Book This Flight** (goes into the normal traveller-details/Hold/Submit-for-Approval flow for that one flight) or **Remove**.
- A flight is automatically dropped from the cart the moment it's actually booked, so the cart only ever shows things that still need action.
- Cart contents are stored server-side per user (`cart_items` table), so they persist across devices and sessions, not just in the browser.

## Live flight search (real airlines)

By default the app only searches your own listings (added via `/admin/flights/new`). You can also
show **real, real-time results from real airlines** (PIA, Emirates, etc.) alongside them:

1. Sign up free at [developers.amadeus.com](https://developers.amadeus.com) and create an app under
   "Self-Service APIs" — you'll get a **test** API Key and Secret at no cost.
2. Add them to `.env.local`:
   ```
   AMADEUS_CLIENT_ID=your_key
   AMADEUS_CLIENT_SECRET=your_secret
   ```
3. Restart the app (`npm run dev` / `npm run start`). `/admin/flights` shows a green "Live flight
   search is on" banner once it detects the keys.

How it works: when an agent searches with both a From/To city picked from the autocomplete (so we
have IATA codes) and a depart date, the search page calls Amadeus's Flight Offers Search API in
parallel with your own database and shows real results tagged **LIVE**, sorted in together with
your listings. When the agent clicks **Select** on a live result, it's snapshotted into your own
`flights` table (so the price/schedule doesn't change under them) and handed straight into the
normal Hold → Submit for Approval → admin-approves flow — it shows up for the admin exactly like
any other booking.

**Important limits to know:**
- Amadeus's free **test** environment returns real schedule/pricing shapes but a smaller, cached
  dataset — it's meant for development, not for selling live tickets.
- This integration covers **search** only. Actually *ticketing* a passenger on a real airline still
  requires Amadeus production access plus a signed agreement with an airline consolidator (see their
  Flight Create Orders API docs) — that part is a business process, not something any code can set up
  for you. In the meantime, your team tickets approved live bookings for real through your own
  GDS/consolidator, exactly like you already do for manually-entered flights.
- If the keys aren't set, live search is simply skipped — nothing else in the app is affected.

## Booking limits & payment approval

- Every **User** account has a `bookingLimit` (PKR) set by an admin — 0 means unlimited.
- The sum of a user's active bookings (anything except Cancelled) can never exceed their limit; the API rejects a booking with a clear error message if it would.
- **Hold** reserves a booking without payment. **Submit for Payment Approval** ("Pay Now") puts it in an `Awaiting Approval` state.
- Admins approve or reject pending payments from `/admin/bookings` — approving confirms the booking, rejecting cancels it and frees the user's limit back up.
- Admins can create new **User** or **Admin** accounts from `/admin/users/new`, and edit any user's role, limit, or lock status inline from `/admin/users`.

## Demo credentials

| Role  | Email                | Password  |
|-------|-----------------------|-----------|
| User  | user@noori.travel     | User@123  |
| Admin | admin@noori.travel    | Admin@123 |

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login` (user) or you can go straight to `/admin/login` for the admin panel.

The SQLite database (`data/noori.db`) and sample flights/Umrah packages are created and seeded automatically the first time the app runs — no manual DB setup needed.

## Production build

```bash
npm run build
npm run start
```

## Project structure

```
app/
  login/                  user login
  admin/login/            admin login
  dashboard/              user home (hero search + stats + recent bookings)
  flights/search/         search results + filters
  booking/review/         traveller details, fare summary, Hold/Submit for Approval
  booking/confirmation/[id]/  booking detail (shared by user & admin)
  bookings/               user's full booking history
  deposits/               user's deposit slip form + personal ledger
  admin/dashboard/        admin home (stats + pending-approval alerts)
  admin/flights/          manage listings (remove)
  admin/flights/new/      add flight / Umrah package form
  admin/airlines/         upload/manage a logo per airline
  admin/bookings/         all bookings, approve/reject payments, status control
  admin/deposits/         all deposit slips, per-user ledger filter, approve/reject
  admin/users/            manage all accounts (role, limit, lock, remove)
  admin/users/new/        create a new User or Admin account
  api/                    flights, bookings, users, cities, airlines, deposits, beneficiary-accounts, me, flights/import-live — REST endpoints + NextAuth route
lib/
  db.js                   SQLite connection, schema, migrations, seed data, limit helper
  auth.js                 NextAuth config (credentials, roles, JWT session)
  utils.js                booking/deposit ref generators, formatters, CSV export helper
  amadeus.js               live flight search (Amadeus Self-Service API) — see "Live flight search" above
components/               shared UI (Header, SearchForm, AutocompleteInput, AirlineLogo, DepositForm/Table, forms, cards, badges)
proxy.js                  route protection (redirects based on auth/role)
```

## Notes / what to change before going live

- **Secrets**: replace `NEXTAUTH_SECRET` in `.env.local` with a strong random value, and set `NEXTAUTH_URL` to your real domain.
- **Passwords**: change the seeded admin/demo passwords in `lib/db.js` (or add a proper signup/invite flow) before deploying.
- **Payments**: the "Pay Now" button currently just marks a booking `Confirmed` — wire it up to a real payment gateway when ready.
- **Branding**: colors and the logo mark live in `app/globals.css` and `components/Logo.js` — swap in your real Noori Travels logo file whenever you have it.
- **Hosting**: this needs a Node.js server (not static hosting) because of the API routes, SQLite file, and NextAuth — services like Railway, Render, a VPS, or a Node-capable host all work. On serverless platforms with ephemeral filesystems (e.g. plain Vercel), swap SQLite for a hosted database (Postgres/MySQL) since the local `.db` file won't persist between requests.
