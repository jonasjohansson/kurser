# kurser.jonasjohansson.se

Single-screen booking site for hands-on courses at Klättermusens Verkstad,
Nytorgsgatan 36, Stockholm. Two tabs (Tuftning, Bastumössa), no page scroll,
black on white, Helvetica Neue. Static HTML, no build step. Booking and payment
happen on Stripe through one Payment Link per session; the site only links out.

The tab is chosen by the URL hash: `/#tuftning` and `/#bastumossa` deep-link.
Without JavaScript both panels show stacked.

Design: `docs/plans/2026-09-15-kurser-booking-site-design.md`.

## Files

- `index.html` – the page (Swedish).
- `assets/js/sessions.js` – **the only file you edit day to day**: dates, times, prices, Stripe URLs, sold-out flags.
- `assets/js/render.js` – renders prices and session rows from `sessions.js`, and switches tabs.
- Asset links carry `?v=N`; bump N in `index.html` (and the import in `render.js`) when CSS or JS change, or browsers keep the old file for a while.
- `assets/images/` – tufting photo (from Tufting Ex Machina, 800 and 1400 px) and the OG image. The Bastumössa tab has no photo yet; add one and copy the `<figure>` from the tufting panel.
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
Skip Klarna: it costs more and is not needed for 2 000–3 000 kr.

1. **Account.** Sign up at stripe.com as the AB. You need the org number, a
   company bank account (IBAN), and ID for the signatory. Activation usually
   takes a day or two. Set the account language and statement descriptor
   (what appears on the card statement, e.g. `KURSER JONAS JOHANSSON`).
2. **Branding.** Settings → Branding: upload a logo or leave blank, set accent
   colour `#2c5a4b`, background `#f6f5f0` so checkout matches the site.
3. **Products.** Product catalogue → Add product, four times:
   - `Tuftning, lördag 14 november 2026` – 2 000 kr, one-time, **tax inclusive**, 25 % moms.
   - `Tuftning, söndag 15 november 2026` – 2 000 kr.
   - `Tovning, lördag 30 januari 2027` – 3 000 kr.
   - `Tovning, söndag 31 januari 2027` – 3 000 kr.
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
- **Refund.** Stripe Dashboard → Payments → refund. Full refund until seven days
  before, per the policy on the site. A refund does not reopen the spot on the
  link by itself; if you want to resell it, raise the link's limit by one.
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

## Optional later

A scheduled GitHub Action could ask Stripe how many payments each link has and
flip `soldOut` automatically. Not built; four sessions do not need it.
