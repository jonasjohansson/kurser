// sessions.js is loaded with the same ?v= as this file, so bumping the version
// in index.html refreshes both.
const version = new URL(import.meta.url).searchParams.get('v') ?? '0';
const { courses, sessions, exVat } = await import(`./sessions.js?v=${version}`);

const dateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const kr = (n) => `${new Intl.NumberFormat('sv-SE').format(n)} kr`;
const capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const CONTACT = 'j@jonasjohansson.se';

// Without a Stripe link the button opens a prefilled email instead.
function mailto(session, course, dateText) {
  const subject = `Bokning: ${course.title} ${dateText.toLowerCase()}`;
  const body = `Hej!\n\nJag vill boka en plats på ${course.title}, ${dateText.toLowerCase()} ${session.time}.\n\nNamn:\nTelefon:\n`;
  return `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function action(session, course, dateText) {
  if (session.soldOut) return el('span', 'btn btn--off', 'Fullbokat');
  const link = el('a', 'btn', 'Boka');
  link.href = session.stripeUrl ?? mailto(session, course, dateText);
  link.rel = 'noopener';
  return link;
}

for (const node of document.querySelectorAll('[data-price]')) {
  const course = courses[node.dataset.price];
  node.replaceChildren(kr(course.price), el('span', 'price__vat', ` inkl. moms. Företag: ${kr(exVat(course.price))} exkl. moms mot faktura.`));
}

for (const list of document.querySelectorAll('[data-sessions]')) {
  list.replaceChildren();
  for (const session of sessions.filter((s) => s.course === list.dataset.sessions)) {
    const date = new Date(`${session.date}T12:00:00`);
    const dateText = capitalize(dateFormat.format(date));
    const item = el('li', 'session' + (session.soldOut ? ' session--full' : ''));
    const when = el('div', 'session__when');
    when.append(el('span', 'session__date', dateText));
    when.append(el('span', 'session__time', session.time));
    item.append(when, action(session, courses[list.dataset.sessions], dateText));
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
