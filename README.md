# kurser.jonasjohansson.se

Single-screen booking site for hands-on courses at Klättermusens Verkstad,
Nytorgsgatan 36, Stockholm. Two tabs (Tuftning, Bastuhatt), no page scroll,
black on white, Helvetica Neue, Swedish only. Static HTML with generated course paths. Booking and payment
happen on Stripe through one Payment Link per session; the site only links out.

Course URLs are `/tuftning/` and `/bastuhatt/`. Old `/#tuftning`, `/#bastumossa` and `/#bastuhatt` links still work and are updated to the corresponding path.
Run `npm run build` to generate `_site/`, including both course directories. Deployment publishes that folder.
Without JavaScript both panels show stacked, in Swedish.


Design: `docs/plans/2026-09-15-kurser-booking-site-design.md`.

## Published dates

Only Saturday 14 November 2026 (tufting) and Saturday 30 January 2027
(Bastuhatt) are advertised and linked from the site. The second dates,
15 November and 31 January, are reserved for later if there is interest.
To add them, restore their session entries from Git history, update the tab
labels, metadata, no-JavaScript fallback and date tests, and bump the script
version. Existing Stripe products and Payment Links have not been deactivated
by this site-only change.

## Files

- `index.html` – the page (Swedish).
- `assets/js/sessions.js` – **the only file you edit day to day**: dates, times, prices, Stripe URLs, sold-out flags.
- `assets/js/render.js` – renders prices and session rows from `sessions.js`, and switches tabs.
- Asset links carry `?v=N` in `index.html`. Bump N whenever you change `sessions.js`, `render.js` or the CSS (the data file inherits the script's version), otherwise browsers keep the old file for up to ten minutes.
- `assets/images/` – tufting photo (from Tufting Ex Machina, 800 and 1400 px) and the OG image. The Bastuhatt tab has no photo yet; add one and copy the `<figure>` from the tufting panel.
- `assets/css/main.css` – styles.
- `tests/sessions.test.js` – checks `sessions.js` is consistent.

## Local

```sh
npm test            # validate sessions.js
npm run validate    # html-validate index.html
npm run serve       # http://localhost:8080
```

## Deploy

1. Create the GitHub repo `jonasjohansson/kurser` and push `main`.
2. Repo → Settings → Pages → Source: **GitHub Actions**. The workflow in
   `.github/workflows/deploy.yml` publishes on every push to `main`.
3. DNS: add a CNAME record `kurser` → `jonasjohansson.github.io`. The `CNAME`
   file in the repo tells Pages which host to serve. Turn on "Enforce HTTPS"
   once the certificate is issued.

## Stripe setup (one time, about 30 minutes)

Stripe has no monthly fee. Swedish cards cost about 1.5 % + 1.8 kr per payment.
Skip Klarna: it costs more and is not needed for 1 600 kr.

1. **Account.** Sign up at stripe.com as the AB. You need the org number, a
   company bank account (IBAN), and ID for the signatory. Activation usually
   takes a day or two. Set the account language and statement descriptor
   (what appears on the card statement, e.g. `KURSER JONAS JOHANSSON`).
2. **Branding.** Settings → Branding: upload a logo or leave blank, set accent
   colour `#2c5a4b`, background `#f6f5f0` so checkout matches the site.
3. **Products.** Product catalogue → Add product, four times:
   - `Tuftning, lördag 14 november 2026` – 1 600 kr, one-time, **tax inclusive**, 25 % moms.
   - `Tuftning, söndag 15 november 2026` – 1 600 kr.
   - `Tovning, lördag 30 januari 2027` – 1 600 kr.
   - `Tovning, söndag 31 januari 2027` – 1 600 kr.
   Put the start time and the address in each product description; it shows on
   the checkout page and receipt. The site shows the price both incl. and excl.
   moms; Stripe charges the incl. price. Companies that want an invoice email
   Jonas and are invoiced from Bokio instead.
4. **Payment Links.** Payment Links → New, one per product:
   - Quantity: do not let customers adjust quantity (one spot per payment keeps
     the cap honest). If friends book together they pay twice.
   - **Advanced → Limit the number of payments: 6.** This is what closes the
     session. Stripe deactivates the link automatically after six paid checkouts.
   - Collect: name, email, **phone number** (on).
   - Custom field (optional text): `Något vi bör veta?`
   - After payment: show a confirmation page with the address, start time, what
     to bring (nothing), and for tufting the pickup time the following day.
   - Turn on the receipt email in Settings → Emails → Successful payments.
5. **Copy each link URL** (`https://buy.stripe.com/...`) into the matching
   `stripeUrl` in `assets/js/sessions.js`. Fill in `time` too. Commit and push.
   The "Öppnar snart" buttons become "Boka".
6. **Notifications.** Settings → Notifications: email on every successful
   payment, so you know when a session fills.

## Day to day

- **A session sells out.** Stripe closes the link after six payments. Set
  `soldOut: true` for that session in `sessions.js`, commit, push. The button
  turns into "Fullbokat" so nobody lands on a dead Stripe page.
- **Refund.** Stripe Dashboard → Payments → refund. For new bookings made after
  the 2026-09-24 cancellation-policy deployment, cancellations at least seven
  days before the course receive the course fee less the actual payment fee
  Stripe retains. Use the fee from that payment, not an estimated percentage.
  Later cancellations can transfer the place. The policy is also displayed
  beside the payment button in both active Stripe checkouts.
  Existing bookings retain the previous full-refund promise; use the successful
  deployment time of the policy-change commit as the cutoff. If a customer saw
  the previous terms (including an already-open checkout), honour those terms.
  Mandatory consumer rights take precedence; do not deduct this fee when a full
  refund is legally required or when we cancel the course.
  We may cancel a course if too few people sign up. Notify every participant
  and refund the full course fee without deducting payment fees.
  A refund does not reopen the spot on the link by itself; if you want to resell
  it, raise the link's limit by one.
- **Participant list.** Payment Links → the link → Payments. Export to CSV for
  names, emails, phone numbers and the custom field.

## Bookkeeping in Bokio

Stripe pays out to the bank account a few days after each payment (batched).
A few payouts is not worth the 89 kr/month Bokio–Stripe integration. Book each
payout by hand from the Stripe payout report:

| Account | Debit | Credit |
|---|---|---|
| 1930 Bank | payout amount | |
| 6570 Bankkostnader (Stripe fees, no moms) | fee total | |
| 3001 Försäljning 25 % moms | | net sales ex moms |
| 2611 Utgående moms 25 % | | moms |

Rose invoices the AB for her two days after the felting weekend.

## Automatic availability

The Pages workflow reads Stripe on each deployment: every push to `main`, or a
manual run after a booking (`gh workflow run deploy.yml --repo jonasjohansson/kurser`).
There is no timer, so the count on the site is only as fresh as the last deployment;
Stripe's own cap still stops a full course from selling. It publishes only anonymous totals in
`assets/availability.json`; no customer information or API keys reach the site.
The Stripe key is a GitHub Actions secret and is used only by the refresh step.
If Stripe fails, deployment stops and the previous site stays available.

`scripts/booking-capacity.json` tracks invoice reservations separately from Stripe.
Tufting currently has one invoice reservation, so its active Stripe link is capped
at five completed checkouts, leaving four after the first Stripe booking.
When adding or cancelling an invoice reservation, update this file AND the Stripe
link limit to keep the combined capacity at six. Do not remove a reservation when
its invoice is paid; it still occupies a seat. No invoice identities belong here.

Counts include completed checkouts on current and previous links. A refund does
not itself cancel a seat or decrement Stripe's completed-session count: after a
confirmed cancellation, increment `releasedStripeBookings` and adjust/reopen the
Stripe link as appropriate. Never release a place merely for a partial refund.
Local builds use the last saved availability snapshot; production refreshes it.
