import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { courses, sessions } from '../assets/js/sessions.js';

export function bookingAvailability(capacity, counts, reserved, released = 0) {
  if (![capacity, reserved, released, ...counts].every(n => Number.isInteger(n) && n >= 0)) throw new Error('Invalid booking count');
  const completed = counts.reduce((a, b) => a + b, 0);
  if (released > completed) throw new Error('Released bookings exceed completed bookings');
  const booked = completed - released + reserved;
  return { capacity, booked, remaining: Math.max(0, capacity - booked) };
}

async function sync() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  const config = JSON.parse(await readFile(new URL('./booking-capacity.json', import.meta.url), 'utf8'));
  const result = {};
  for (const session of sessions) {
    const entry = config[session.id];
    if (!entry) throw new Error(`Missing booking configuration for ${session.id}`);
    const counts = [];
    for (const id of entry.paymentLinks) {
      const response = await fetch(`https://api.stripe.com/v1/payment_links/${id}`, {
        headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Stripe returned ${response.status} for ${session.id}`);
      const link = await response.json();
      if (link.metadata?.session !== session.id || !link.livemode) throw new Error('Unexpected Stripe booking link');
      counts.push(link.restrictions?.completed_sessions?.count);
    }
    result[session.id] = bookingAvailability(courses[session.course].spots, counts, entry.invoiceReservations, entry.releasedStripeBookings);
    console.log(`${session.id}: ${result[session.id].booked}/${result[session.id].capacity} booked`);
  }
  // Only publish anonymous totals, and only after every Stripe read succeeds.
  await writeFile(new URL('../assets/availability.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await sync();
