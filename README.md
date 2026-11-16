# Wybr

Dating web app for India, Bangalore first. Say it "WY-ber".

Stack: React (Vite) + Supabase (database, login, realtime) + Cloudflare Pages (hosting, later).

## Phase 1 status
- Demo mode (no setup): the full clickable prototype with fake data.
- Live mode (after Supabase setup): real phone OTP login, saved profile, sign out, delete account.
- Not built yet: real matching, chat, date planning. They still show fake data.

## Run it
1. Open a terminal in this folder (in your IDE: Terminal, then New Terminal).
2. `npm install`
3. `npm run dev`
4. Open http://localhost:5173

## Turn on real login (free)
1. supabase.com: create a free project. Pick the Mumbai region.
2. SQL Editor, New query: paste all of `supabase/schema.sql`, press Run.
3. Authentication, Sign In / Providers, Phone: enable it.
   - For testing, add test phone numbers with fixed codes in the same Phone settings. That avoids SMS cost.
   - For real SMS later, connect an Indian SMS provider such as MSG91 (needs DLT registration).
4. Authentication, Rate limits: keep OTP limits low. This slows scammers and protects your SMS bill.
5. Project Settings, API: copy the Project URL and the anon public key.
6. Copy `.env.example` to `.env`. Paste the two values. Restart `npm run dev`.
   The demo controls strip disappears when live mode is on.

## Security rules for this project
- Only the anon key goes in `.env`. Never the service_role key, anywhere in this app.
- `.env` is in `.gitignore`. Never commit it. Keep the GitHub repo private.
- All access rules live in the database (`supabase/schema.sql`), not in the browser.
- Users cannot set their own trust level, verification or status.

## Save to GitHub
```
git init
git add .
git commit -m "Wybr phase 1"
```
Create a PRIVATE empty repo on github.com, then run the two lines GitHub shows (`git remote add origin ...` and `git push -u origin main`).

## Files
- `src/App.jsx` all screens
- `src/lib/supabase.js` Supabase connection
- `supabase/schema.sql` database and security rules
- `src/styles.css` design
