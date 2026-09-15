// Single source of truth for what can be booked.
// To mark a session full: set soldOut: true, commit, push.
// To open booking: paste the Stripe Payment Link into stripeUrl.

export const courses = {
  tuftning: {
    title: 'Tuftning',
    subtitle: 'Gör egna patches med handtuftning',
    leader: 'Jonas Johansson',
    hours: 4,
    spots: 6,
    price: 2000,
  },
  tovning: {
    title: 'Tovning',
    subtitle: 'Tova din egen bastumössa',
    leader: 'Rose Hallgren',
    hours: 6,
    spots: 6,
    price: 3000,
  },
};

export const sessions = [
  { id: 'tuft-2026-11-14', course: 'tuftning', date: '2026-11-14', time: 'Tid meddelas', stripeUrl: null, soldOut: false },
  { id: 'tuft-2026-11-15', course: 'tuftning', date: '2026-11-15', time: 'Tid meddelas', stripeUrl: null, soldOut: false },
  { id: 'tov-2027-01-30', course: 'tovning', date: '2027-01-30', time: 'Tid meddelas', stripeUrl: null, soldOut: false },
  { id: 'tov-2027-01-31', course: 'tovning', date: '2027-01-31', time: 'Tid meddelas', stripeUrl: null, soldOut: false },
];
