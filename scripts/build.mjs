import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const out = new URL('_site/', root);
await mkdir(out, { recursive: true });
await cp(new URL('assets/', root), new URL('assets/', out), { recursive: true });
await cp(new URL('CNAME', root), new URL('CNAME', out));
const html = await readFile(new URL('index.html', root), 'utf8');
await writeFile(new URL('index.html', out), html);
for (const [slug, title] of [['tuftning', 'Tuftning'], ['bastuhatt', 'Bastuhatt']]) {
  let page = html.replace(/<title>.*?<\/title>/, `<title>${title} · Kurser</title>`)
    .replaceAll('https://kurser.jonasjohansson.se/"', `https://kurser.jonasjohansson.se/${slug}/"`);
  page = page.replace(/class="panel(?: is-active)?"\s+id="([^"]+)"/g,
    (_, id) => `class="panel${id === slug ? ' is-active' : ''}" id="${id}"`);
  page = page.replace(/(<a\s+class="tab"[\s\S]*?href="\/([^/]+)\/"[\s\S]*?aria-selected=")[^"]+/g,
    (_, prefix, id) => `${prefix}${id === slug}`);
  await mkdir(new URL(`${slug}/`, out), { recursive: true });
  await writeFile(new URL(`${slug}/index.html`, out), page);
}
console.log(`Built course pages in ${fileURLToPath(out)}`);
