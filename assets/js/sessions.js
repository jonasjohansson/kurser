// Single source of truth for what can be booked.
// To mark a session full: set soldOut: true, commit, push.
// To open booking: paste the Stripe Payment Link into stripeUrl.
// price is in SEK including 25 % moms; the ex-moms price is derived.

export const VAT = 0.25;

export const courses = {
  tuftning: {
    title: 'Tuftning',
    leader: 'Jonas Johansson och Rose Hallgren',
    hours: 4,
    spots: 6,
    price: 1600,
  },
  tovning: {
    title: 'Tovning',
    leader: 'Rose Hallgren och Jonas Johansson',
    hours: 6,
    spots: 6,
    price: 1600,
  },
};

export const sessions = [
  { id: 'tov-2027-01-30', course: 'tovning', date: '2027-01-30', time: '12–18', stripeUrl: 'https://buy.stripe.com/4gM4gs2rlaAS6uz99q7Re09', soldOut: false },
  { id: 'tuft-2026-11-14', course: 'tuftning', date: '2026-11-14', time: '12–16', stripeUrl: 'https://buy.stripe.com/7sYdR28PJgZgaKPfxO7Re07', soldOut: false },
];

export function exVat(price) {
  return Math.round(price / (1 + VAT));
}

// One wording for the seat count, used by the build and in the browser.
export function availabilityText({ booked, capacity, remaining }) {
  const tail = remaining === 0 ? 'Fullbokat' : `${remaining} kvar`;
  return `${booked} av ${capacity} platser bokade · ${tail}`;
}

// A session is full when marked soldOut by hand or when Stripe reports no places left.
export function isFull(session, availability) {
  return session.soldOut || availability[session.id]?.remaining === 0;
}

// A course is full when every one of its sessions is; shown as "(fullbokat)" in its tab.
export function courseFullText(courseId, availability) {
  const own = sessions.filter(s => s.course === courseId);
  return own.length > 0 && own.every(s => isFull(s, availability)) ? '(fullbokat)' : '';
}
