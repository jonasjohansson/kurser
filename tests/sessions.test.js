import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courses, sessions } from '../assets/js/sessions.js';

test('two courses with six spots each', () => {
  assert.deepEqual(Object.keys(courses).sort(), ['tovning', 'tuftning']);
  for (const c of Object.values(courses)) {
    assert.equal(c.spots, 6);
    assert.ok(c.title && c.leader && c.hours > 0);
  }
  assert.equal(courses.tuftning.price, 2000);
  assert.equal(courses.tovning.price, 2500);
});

test('four sessions with unique ids and valid fields', () => {
  assert.equal(sessions.length, 4);
  assert.equal(new Set(sessions.map((s) => s.id)).size, 4);
  for (const s of sessions) {
    assert.ok(s.course in courses, `unknown course ${s.course}`);
    assert.match(s.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(typeof s.soldOut, 'boolean');
    assert.ok(s.stripeUrl === null || s.stripeUrl.startsWith('https://buy.stripe.com/'));
    assert.ok(typeof s.time === 'string' && s.time.length > 0);
  }
});

test('dates match the agreed weekends', () => {
  const byCourse = (c) => sessions.filter((s) => s.course === c).map((s) => s.date).sort();
  assert.deepEqual(byCourse('tuftning'), ['2026-11-14', '2026-11-15']);
  assert.deepEqual(byCourse('tovning'), ['2027-01-30', '2027-01-31']);
});

test('ex-moms prices are whole kronor', async () => {
  const { exVat, VAT } = await import('../assets/js/sessions.js');
  assert.equal(VAT, 0.25);
  assert.equal(exVat(2000), 1600);
  assert.equal(exVat(2500), 2000);
  for (const c of Object.values(courses)) assert.equal(exVat(c.price) * (1 + VAT), c.price);
});
