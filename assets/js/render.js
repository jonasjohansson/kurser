import { courses, sessions, exVat } from './sessions.js?v=3';

const dateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const kr = (n) => `${new Intl.NumberFormat('sv-SE').format(n)} kr`;
const capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);

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

for (const node of document.querySelectorAll('[data-price]')) {
  const course = courses[node.dataset.price];
  node.textContent = `${kr(course.price)} inkl. moms, ${kr(exVat(course.price))} exkl. moms.`;
}

for (const list of document.querySelectorAll('[data-sessions]')) {
  list.replaceChildren();
  for (const session of sessions.filter((s) => s.course === list.dataset.sessions)) {
    const date = new Date(`${session.date}T12:00:00`);
    const item = el('li', 'session' + (session.soldOut ? ' session--full' : ''));
    const when = el('div', 'session__when');
    when.append(el('span', 'session__date', capitalize(dateFormat.format(date))));
    when.append(el('span', 'session__time', session.time));
    item.append(when, action(session));
    list.append(item);
  }
}

// Tabs: the URL hash decides which panel is shown.
const panels = [...document.querySelectorAll('.panel')];
const tabs = [...document.querySelectorAll('.tab')];

function show(id) {
  const target = panels.some((p) => p.id === id) ? id : panels[0].id;
  for (const p of panels) p.classList.toggle('is-active', p.id === target);
  for (const t of tabs) t.setAttribute('aria-selected', String(t.getAttribute('href') === `#${target}`));
  document.title = `${document.getElementById(target).querySelector('h1').textContent} · Kurser`;
}

show(location.hash.slice(1));
window.addEventListener('hashchange', () => show(location.hash.slice(1)));
for (const t of tabs) {
  t.addEventListener('click', (e) => {
    e.preventDefault();
    history.replaceState(null, '', t.getAttribute('href'));
    show(t.getAttribute('href').slice(1));
  });
}
