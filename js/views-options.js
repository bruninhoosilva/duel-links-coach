import { cardButton, esc } from './dom.js';

function optionCard(name, ctx) {
  const card = ctx.cards[name];
  const face = card?.image
    ? `<img src="${esc(card.image)}" alt="" loading="lazy">`
    : `<span class="bcard-name">${esc(name)}</span>`;
  return `<button type="button" class="syn-card" data-card="${esc(name)}" title="${esc(name)}">${face}<span class="syn-name">${esc(name)}</span></button>`;
}

const countsOf = (list) => {
  const counts = new Map();
  for (const e of [...(list.main ?? []), ...(list.extra ?? [])]) counts.set(e.name, (counts.get(e.name) ?? 0) + e.count);
  return counts;
};
const sizeOf = (entries = []) => entries.reduce((n, e) => n + e.count, 0);

// Two builds from two videos side by side: who plays what, what changes and exactly which cards differ.
export function renderBuilds(guide) {
  const [a, b] = guide.videoLists ?? [];
  const diffs = guide.buildDifferences ?? [];
  if (!a || !b) return '';
  const head = (l) => `<strong>${esc(l.label)}</strong>`;
  const panel = (l) => `<div class="build-card"><h3>${esc(l.label)}</h3><p class="muted small">${l.url ? `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">Watch the video</a> by ${esc(l.creator ?? 'the creator')}. ` : ''}${sizeOf(l.main)} main deck and ${sizeOf(l.extra)} Extra Deck cards.</p></div>`;
  const rows = diffs
    .map((d) => `<tr><th scope="row">${esc(d.topic)}</th><td>${esc(d.a)}</td><td>${esc(d.b)}</td><td>${esc(d.why)}</td></tr>`)
    .join('');
  const table = rows
    ? `<div class="table-wrap"><table class="builds-table"><thead><tr><th>What changes</th><th>${head(a)}</th><th>${head(b)}</th><th>Why it matters</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : '';

  const ca = countsOf(a);
  const cb = countsOf(b);
  const names = [...new Set([...ca.keys(), ...cb.keys()])].filter((n) => (ca.get(n) ?? 0) !== (cb.get(n) ?? 0));
  const cell = (n) => (n ? `×${n}` : '<span class="muted">not played</span>');
  const cardRows = names
    .sort((x, y) => (!ca.has(x) - !ca.has(y)) || (!cb.has(x) - !cb.has(y)) || x.localeCompare(y))
    .map((n) => `<tr><th scope="row">${cardButton(n)}</th><td>${cell(ca.get(n))}</td><td>${cell(cb.get(n))}</td></tr>`)
    .join('');
  const cardTable = cardRows
    ? `<h3>Cards that are different</h3><div class="table-wrap"><table class="builds-table"><thead><tr><th>Card</th><th>${head(a)}</th><th>${head(b)}</th></tr></thead><tbody>${cardRows}</tbody></table></div>`
    : '<p class="muted">Both builds play the same cards.</p>';
  return `<section class="panel builds">
      <h2>Two builds, two videos</h2>
      <p class="muted">This guide follows two creators who play different lists of the same deck. Here is what changes between them; the Deck lists tab shows both full lists, and the swaps below work for either build.</p>
      <div class="build-pair">${panel(a)}${panel(b)}</div>
      ${table}
      ${cardTable}
    </section>`;
}

// "No card X? Use Y because Z": one picture pair per substitute, grouped by the missing card.
export function renderOptions(guide, ctx) {
  const groups = (guide.cards ?? []).filter((c) => (c.substitutes ?? []).length > 0);
  const blocks = groups
    .map(
      (c) => `
    <section class="panel">
      <h2>No ${cardButton(c.name)}?</h2>
      ${c.substitutes
        .map(
          (s) => `<div class="syn">
        <div class="syn-flow">${optionCard(c.name, ctx)}<span class="syn-link"><span class="syn-label">use instead</span><span class="syn-arrow" aria-hidden="true">→</span></span>${optionCard(s.name, ctx)}</div>
        <p class="syn-reason">${esc(s.why)}</p>
      </div>`,
        )
        .join('')}
    </section>`,
    )
    .join('');
  const skills = (guide.sideSkills ?? [])
    .map((s) => {
      const text = ctx.skills?.[s.name]?.text;
      return `
    <section class="panel">
      <h2>Other skill: ${esc(s.name)}</h2>
      ${text ? `<blockquote class="skill-text">${esc(text)}</blockquote>` : ''}
      <p>${esc(s.reason)}</p>
    </section>`;
    })
    .join('');
  const all = renderBuilds(guide) + blocks + skills;
  return `<p class="muted">You do not need every card in the list. If you are missing one, these are the swaps the creators recommend, and why they work. Tap a card to read its text.</p>${all || '<p>No alternatives listed yet for this deck.</p>'}`;
}
