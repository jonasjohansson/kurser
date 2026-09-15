import { courses, sessions } from './sessions.js';

const dateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
const priceFormat = new Intl.NumberFormat('sv-SE');

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function action(session) {
  if (session.soldOut) return el('span', 'btn btn--off', 'Fullbokat');
  if (!session.stripeUrl) return el('span', 'btn btn--off', 'Öppnar snart');
  const link = el('a', 'btn', 'Boka');
  link.href = session.stripeUrl;
  link.rel = 'noopener';
  return link;
}

function render(list) {
  list.replaceChildren();
  for (const session of sessions) {
    const course = courses[session.course];
    const date = new Date(`${session.date}T12:00:00`);
    const item = el('li', 'session' + (session.soldOut ? ' session--full' : ''));

    const when = el('div', 'session__when');
    when.append(el('span', 'session__date', capitalize(dateFormat.format(date))));
    when.append(el('span', 'session__year', String(date.getFullYear())));

    const what = el('div', 'session__what');
    const title = el('a', 'session__course', course.title);
    title.href = `#${session.course}`;
    what.append(title);
    what.append(el('span', 'session__meta', `${course.hours} timmar, ${session.time.toLowerCase()}`));

    item.append(when, what, el('div', 'session__price', `${priceFormat.format(course.price)}\u00a0kr`), action(session));
    list.append(item);
  }
}

const list = document.querySelector('[data-sessions]');
if (list) render(list);
