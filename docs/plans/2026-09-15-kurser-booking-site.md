# kurser.jonasjohansson.se Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a one-page Swedish booking site for four course sessions, each booked via a capped Stripe Payment Link, hosted on GitHub Pages.

**Architecture:** Static HTML + CSS, session data in one JS module rendered client-side with a noscript fallback. No build step. Stripe hosts checkout; the site only links out. A Node test validates the data file.

**Tech Stack:** HTML, CSS, vanilla ES modules, Node 22 `node --test`, GitHub Pages deploy action.

Design: `docs/plans/2026-09-15-kurser-booking-site-design.md`.

---

### Task 1: Scaffold repo and deploy

**Files:** Create `CNAME`, `.github/workflows/deploy.yml`, `.gitignore`, `package.json`, `README.md`.

1. `CNAME` = `kurser.jonasjohansson.se`.
2. Copy `deploy.yml` from `../detmorkaljuset.se/.github/workflows/deploy.yml` verbatim.
3. `package.json`: `"type": "module"`, scripts `test: node --test tests/`, `validate: npx --yes html-validate index.html`, `serve: python3 -m http.server 8080`. No dependencies.
4. `.gitignore`: `node_modules`, `.DS_Store`.
5. Commit: `chore: scaffold static site and Pages deploy`.

### Task 2: Session data with test (TDD)

**Files:** Create `tests/sessions.test.js`, `assets/js/sessions.js`.

1. Write test: imports `sessions` and `courses` from `../assets/js/sessions.js`. Asserts: 4 sessions; unique ids; each has `course` in courses keys; `date` matches `^\d{4}-\d{2}-\d{2}$`; tufting sessions `price === 2000`, felting `price === 3000`; `soldOut` is boolean; when `!soldOut && stripeUrl` then url starts with `https://buy.stripe.com/`; `stripeUrl` may be `null` (not yet created). Also `courses.tuftning.spots === 6`, `courses.tovning.spots === 6`.
2. Run `npm test`, expect FAIL (module missing).
3. Write `sessions.js` exporting `courses` (tuftning, tovning: title, leader, hours, spots, price) and `sessions` (4 objects: id `tuft-2026-11-14`, `tuft-2026-11-15`, `tov-2027-01-30`, `tov-2027-01-31`, `time: null` placeholder text "Tid meddelas", `stripeUrl: null`, `soldOut: false`).
4. Run `npm test`, expect PASS.
5. Commit: `feat: session data and validation test`.

### Task 3: HTML content

**Files:** Create `index.html`.

Structure (Swedish, `lang="sv"`): head with title "Kurser · Jonas Johansson", description, canonical, OG tags, theme-color, stylesheet, `<script type="module" src="/assets/js/render.js">`. Body: skip link; header with wordmark "Kurser" and nav (Tuftning, Tovning, Praktiskt); `<main>`: hero (h1 + one sentence + date list), `section#tuftning` (course text, `<div class="sessions" data-course="tuftning">` with noscript fallback list), `section#tovning` (same), `section#praktiskt` (Plats, Ingår, Hämtning, Avbokning), `section#om` (Jonas, Rose), footer with contact `j@jonasjohansson.se` and Klättermusens Verkstad Instagram.

Copy the course descriptions from the design doc, rewritten as short Swedish paragraphs. Commit: `feat: page content`.

### Task 4: Render sessions

**Files:** Create `assets/js/render.js`.

For each `.sessions[data-course]`, render one `<article class="session">` per matching session: weekday + date in Swedish (`Intl.DateTimeFormat('sv-SE', {weekday:'long', day:'numeric', month:'long'})`), time, `6 platser`, price `2 000 kr`. Button: if `soldOut` → `<span class="btn btn--disabled">Fullbokat</span>`; else if `stripeUrl` → `<a class="btn" href=... rel="noopener">Boka</a>`; else `<span class="btn btn--disabled">Bokning öppnar snart</span>`. Remove the noscript sibling handling (noscript is ignored when JS runs). Commit: `feat: render session cards from data`.

### Task 5: Styles

**Files:** Create `assets/css/main.css`.

Minimal: system font stack with a serif display for h1/h2, max-width 40rem column, one accent color, warm off-white background, large line-height, session cards as a bordered list with date left and button right, stacking on mobile. Focus-visible styles, reduced-motion safe (no motion anyway). Commit: `feat: minimal styles`.

### Task 6: Verify

1. `npm test` → pass.
2. `npm run validate` → no errors (fix any).
3. `npm run serve`, open http://localhost:8080 in Chrome via claude-in-chrome at desktop and ~400px, screenshot, check headings, cards, buttons.
4. Commit fixes.

### Task 7: README with Stripe runbook

**Files:** Modify `README.md`.

Sections: What this is; Local dev; Deploy (GitHub repo settings → Pages → GitHub Actions; DNS CNAME `kurser` → `jonasjohansson.github.io`); Stripe setup step-by-step: create account for the AB, enable card + Apple/Google Pay (skip Klarna), create 2 products with 4 prices or 4 products, create 4 Payment Links each with "Limit the number of payments" = 6, collect phone, add custom field, set confirmation page/email text incl. address, copy URL into `sessions.js`; When a session sells out: set `soldOut: true`, commit, push; Bookkeeping: book payouts in Bokio (3001 sales 25 % moms, 6570 fees); Rose invoices the AB. Commit: `docs: README with Stripe runbook`.

### Task 8: Wiki

In `~/GitHub/org/jonasjohansson/skynet/wiki`: create `projects/kurser.md` (type project, status active, repo, url, sessions table, open items) and append a row to `logs/2026-09-15.md` (create with frontmatter if missing, following existing daily format). Do not touch `tasks.yml` without confirmation; list proposed tasks in the final message instead.
