// Single source of truth for what can be booked.
// To mark a session full: set soldOut: true, commit, push.
// To open booking: paste the Stripe Payment Link into stripeUrl.
// price is in SEK including 25 % moms; the ex-moms price is derived.

export const VAT = 0.25;

export const courses = {
  tuftning: {
    title: 'Tuftning',
    leader: 'Jonas Johansson',
    hours: 4,
    spots: 6,
    price: 2000,
  },
  tovning: {
    title: 'Tovning',
    leader: 'Rose Hallgren',
    hours: 6,
    spots: 6,
    price: 2500,
  },
};

export const sessions = [
  { id: 'tuft-2026-11-14', course: 'tuftning', date: '2026-11-14', time: '12–16', stripeUrl: 'https://buy.stripe.com/6oU7sE2rl10iaKPclC7Re00', soldOut: false },
  { id: 'tov-2027-01-30', course: 'tovning', date: '2027-01-30', time: '12–18', stripeUrl: 'https://buy.stripe.com/cNicMY1nheR806b1GY7Re04', soldOut: false },
];

export function exVat(price) {
  return Math.round(price / (1 + VAT));
}
