// sessions.js is loaded with the same ?v= as this file, so bumping the version
// in index.html refreshes both.
const version = new URL(import.meta.url).searchParams.get('v') ?? '0';
const { courses, sessions, exVat } = await import(`./sessions.js?v=${version}`);

const CONTACT = 'j@jonasjohansson.se';

const strings = {
  sv: {
    locale: 'sv-SE',
    book: 'Boka',
    full: 'Fullbokat',
    price: (incl, ex) => [`${incl} inkl. moms`, `, ${ex} exkl. moms för företag mot faktura`],
    subject: (course, date) => `Bokning: ${course} ${date}`,
    body: (course, date, time) => `Hej!\n\nJag vill boka en plats på ${course}, ${date} ${time}.\n\nNamn:\nTelefon:\n`,
    siteTitle: 'Kurser',
    title: { tuftning: 'Tuftning', tovning: 'Bastuhatt' },
  },
};

const kr = (n) => `${new Intl.NumberFormat('sv-SE').format(n)} kr`;
const capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const lang = 'sv';

function action(session, courseTitle, dateText, t) {
  if (session.soldOut) return el('span', 'btn btn--off', t.full);
  const link = el('a', 'btn', t.book);
  if (session.stripeUrl) {
    link.href = session.stripeUrl;
    link.target = '_blank';
  } else {
    const subject = t.subject(courseTitle, dateText.toLowerCase());
    const body = t.body(courseTitle, dateText.toLowerCase(), session.time);
    link.href = `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  link.rel = 'noopener';
  return link;
}

function render() {
  const t = strings[lang];
  const dateFormat = new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  for (const node of document.querySelectorAll('[data-price]')) {
    const course = courses[node.dataset.price];
    const [main, note] = t.price(kr(course.price), kr(exVat(course.price)));
    node.replaceChildren(el('strong', null, main), note);
  }

  for (const list of document.querySelectorAll('[data-sessions]')) {
    const courseTitle = t.title[list.dataset.sessions];
    list.replaceChildren();
    for (const session of sessions.filter((s) => s.course === list.dataset.sessions)) {
      const date = new Date(`${session.date}T12:00:00`);
      const dateText = capitalize(dateFormat.format(date));
      const item = el('li', 'session' + (session.soldOut ? ' session--full' : ''));
      const when = el('div', 'session__when');
      when.append(el('span', 'session__date', dateText));
      when.append(el('span', 'session__time', session.time));
      item.append(when, action(session, courseTitle, dateText, t));
      list.append(item);
    }
  }
  updateTitle();
}

// Tabs: the URL hash decides which panel is shown.
const panels = [...document.querySelectorAll('.panel')];
const tabs = [...document.querySelectorAll('.tab')];

function activeId() {
  const id = location.hash.slice(1);
  return panels.some((p) => p.id === id) ? id : panels[0].id;
}

function updateTitle() {
  const key = activeId() === 'tuftning' ? 'tuftning' : 'tovning';
  document.title = `${strings[lang].title[key]} · ${strings[lang].siteTitle}`;
}

function show() {
  const target = activeId();
  for (const p of panels) p.classList.toggle('is-active', p.id === target);
  for (const tab of tabs) tab.setAttribute('aria-selected', String(tab.getAttribute('href') === `#${target}`));
  updateTitle();
}

render();
show();
window.addEventListener('hashchange', show);
for (const tab of tabs) {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    history.replaceState(null, '', tab.getAttribute('href'));
    show();
  });
}

// Keep the booking panel below the sticky tabs, including when their text wraps.
const tabsHeader = document.querySelector('.tabs');
if (tabsHeader) {
  const updateTabsHeight = () => {
    document.documentElement.style.setProperty('--tabs-height', `${tabsHeader.getBoundingClientRect().height}px`);
  };
  updateTabsHeight();
  new ResizeObserver(updateTabsHeight).observe(tabsHeader);
}
