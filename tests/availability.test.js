import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingAvailability } from '../scripts/sync-availability.mjs';
test('includes invoice reservations and previous payment links', () => {
  assert.deepEqual(bookingAvailability(6, [1, 0], 1), { capacity: 6, booked: 2, remaining: 4 });
  assert.equal(bookingAvailability(6, [2, 1], 1).remaining, 2);
});
test('full courses and explicit cancellations', () => {
  assert.equal(bookingAvailability(6, [5], 1).remaining, 0);
  assert.equal(bookingAvailability(6, [5], 1, 1).remaining, 1);
  assert.equal(bookingAvailability(6, [7], 1).remaining, 0);
});
test('invalid or absent Stripe counts fail rather than publish false availability', () => {
  assert.throws(() => bookingAvailability(6, [undefined], 1));
  assert.throws(() => bookingAvailability(6, [1], 1, 2));
});
