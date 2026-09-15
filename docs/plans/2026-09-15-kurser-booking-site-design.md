# kurser.jonasjohansson.se — booking site design

Date: 2026-09-15. Status: approved by Jonas.

## Goal

A minimal, self-running booking site for two hands-on courses at Klättermusens
Verkstad, Nytorgsgatan 36, Stockholm. Participants read about a course, pick a
session, pay, and are done. Jonas does nothing per booking.

## Courses and sessions

| Course | Leader | Dates | Length | Spots | Price (incl. 25 % moms) |
|---|---|---|---|---|---|
| Tuftning — patches | Jonas Johansson | Sat 14 Nov 2026, Sun 15 Nov 2026 | 4 h | 6 per day | 2 000 kr |
| Tovning — bastumössa | Rose Hallgren | Sat 30 Jan 2027, Sun 31 Jan 2027 | 6 h | 6 per day | 3 000 kr |

Tufting: hand/analog tufting, no electric machines. Frame and tufting cloth
prepared by Jonas; participants make as many patches as they manage; patches are
glued at the end and dry overnight; pickup next day. Patches can be sewn onto
clothes or used as chair seats.

Felting: wet-felted wool sauna hat, all materials provided by Rose (Fluffy
Encounters). No experience needed. Suitable for all ages.

Start times and pickup time are open items — placeholders until Jonas fills them in.

## Payment: Stripe Payment Links

- One Stripe Payment Link per session (4 total), all on Jonas's AB's Stripe account.
- Each link has `restrictions.completed_sessions.limit = 6`, so it deactivates
  itself after six payments.
- Link collects name, email, phone; one optional custom text field ("Något vi
  bör veta?"). Confirmation email from Stripe carries address and arrival info.
- Rose invoices the AB for her two days. Stripe payouts booked manually in Bokio
  (a handful of entries; the 89 kr/month Bokio–Stripe integration is not worth it).
- Rejected: Zettle betallänk (one-off links, manual per customer), Swish + form
  (manual, monthly fee, no capacity cap), Billetto (fallback if Stripe is unwanted),
  custom backend (unnecessary).

## Site

- Static, one page, Swedish. Hosted on GitHub Pages at `kurser.jonasjohansson.se`
  with the same `deploy.yml` as detmorkaljuset.se. No build step, no dependencies.
- Files: `index.html`, `assets/css/main.css`, `assets/js/sessions.js`,
  `assets/images/`, `CNAME`, `.github/workflows/deploy.yml`, `README.md`.
- Sections in order: hero (title, one-line promise, the four dates), Tuftning,
  Tovning, Praktiskt (venue, what is included, pickup, refund policy), Om oss,
  Kontakt.
- Session data lives in one place, `assets/js/sessions.js`: id, course, date,
  time, price, Stripe URL, `soldOut` boolean. A few lines of vanilla JS render
  the session cards from it. The HTML also carries a `<noscript>` fallback with
  the same information.
- A "Boka" button opens the Stripe link. When `soldOut` is true the card shows
  "Fullbokat" and no link. Jonas flips the flag by hand when Stripe reports the
  sixth payment. Optional later: a scheduled GitHub Action that reads payment
  counts from Stripe and flips the flags.
- Design: very minimal and direct. Generous type, one accent color, no imagery
  required to work; hero image optional from the tufting Instagram post.
- Accessibility: semantic headings, skip link, focus styles, `lang="sv"`,
  buttons with clear labels, colour contrast AA.

## Refund policy (proposed text)

Full refund until 7 days before the session. After that the spot is transferable
to someone else but not refunded. If we cancel, full refund.

## Testing

- `node --test` unit test that validates `sessions.js`: four sessions, unique ids,
  prices as expected, dates in ISO, every non-sold-out session has an https Stripe URL.
- HTML validation via `npx html-validate` (dev-only, not a runtime dependency).
- Manual: open the page at phone width and desktop, check every Boka link.

## Open items for Jonas

1. Start times per session, and tufting pickup window on the following day.
2. Stripe account activation (org number, bank account, ID).
3. Paste the four Payment Link URLs into `sessions.js`.
4. Photos for the hero (optional).
5. Confirm refund policy text.
