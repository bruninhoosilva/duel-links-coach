import { esc } from './dom.js';
import { MAX_COPIES } from './collection.js';
import { searchCards } from './card-search.js';
import { cardDeltas, compareVersion } from './compare.js';
import { renderComparison } from './views-compare.js';
import { renderPacks } from './views-decklists.js';
import { sectionTotal } from './versions.js';

const EXTRA_TYPES = ['Fusion', 'Synchro', 'Xyz', 'Link'];

// True for cards that go in the Extra Deck: from the search data when we have it, else from the card's own types.
function makeIsExtra(ctx) {
  const byName = new Map((ctx.searchIndex ?? []).filter((c) => c.extra).map((c) => [c.name, true]));
  return (name) => byName.has(name) || (ctx.cards?.[name]?.monsterType ?? []).some((t) => EXTRA_TYPES.includes(t));
}

function baseListFor(version, data) {
  const found = data?.lists.find((l) => l.id === version.baseId);
  return { list: found ?? data?.lists.find((l) => l.id === data.defaultId) ?? data?.lists[0] ?? null, missing: !found };
}

// The badge and outline class of a tile, from the card's total copies in the guide's list and in the version.
// Your side marks what you play more of (new / +N) or less of (−N); the guide's side marks what you play less of (out / −N).
function diffMark(d, side) {
  if (!d || d.base === d.mine) return { cls: '', badge: '' };
  if (side === 'mine') {
    if (d.mine > d.base) return { cls: ' mv-added', badge: d.base === 0 ? 'new' : `+${d.mine - d.base}` };
    return { cls: ' mv-less', badge: `−${d.base - d.mine}` };
  }
  if (d.mine >= d.base) return { cls: '', badge: '' };
  return d.mine === 0 ? { cls: ' mv-removed', badge: 'out' } : { cls: ' mv-fewer', badge: `−${d.base - d.mine}` };
}

// side 'mine': editable tile with − / + buttons; side 'guide': the same look, read-only.
function tile(entry, section, ctx, deltas, side) {
  const owned = ctx.owned ?? {};
  const known = Object.hasOwn(owned, entry.name);
  const have = Math.min(owned[entry.name] ?? 0, MAX_COPIES);
  const short = known && have < entry.count;
  const card = ctx.cards?.[entry.name];
  const face = card?.image ? `<img src="${esc(card.image)}" alt="${esc(entry.name)}" loading="lazy">` : `<span class="bcard-name">${esc(entry.name)}</span>`;
  const name = esc(entry.name);
  const mark = diffMark(deltas.get(entry.name), side);
  const badge = mark.badge ? `<span class="mv-diff">${esc(mark.badge)}</span>` : '';
  const label = `<span class="own-n${short ? ' short' : ''}${known ? '' : ' unknown'}" title="Copies you own / copies ${side === 'mine' ? 'this version' : "the guide's list"} plays">own ${known ? have : '?'}/${entry.count}</span>`;
  const own = side === 'mine'
    ? `<div class="own"><button type="button" class="own-btn" data-ver-count="${name}" data-section="${section}" data-delta="-1" aria-label="Play one less ${name}">−</button>${label}<button type="button" class="own-btn" data-ver-count="${name}" data-section="${section}" data-delta="1" aria-label="Play one more ${name}"${entry.count >= MAX_COPIES ? ' disabled' : ''}>+</button></div>`
    : `<div class="own">${label}</div>`;
  return `<div class="dwrap${short ? ' short' : ''}${mark.cls}"><button type="button" class="dtile" data-card="${name}" title="${name}">${face}<span class="qty">×${entry.count}</span>${badge}</button>
    ${own}</div>`;
}

const grid = (entries, section, ctx, deltas, side) => `<div class="deck-tiles">${entries.map((e) => tile(e, section, ctx, deltas, side)).join('')}</div>`;

function column(list, ctx, deltas, side) {
  const extra = list.extra ?? [];
  return `<section><h3>Main deck (${sectionTotal(list.main ?? [])})</h3>${grid(list.main ?? [], 'main', ctx, deltas, side)}</section>
      <section><h3>Extra Deck (${sectionTotal(extra)})</h3>${extra.length ? grid(extra, 'extra', ctx, deltas, side) : '<p class="muted small">Empty.</p>'}</section>`;
}

function splitView(base, active, ctx) {
  const deltas = cardDeltas(base, active);
  return `<div class="mv-split">
    <div class="mv-col mv-mine"><h2>Your version</h2>
      <p class="muted small mv-legend">Green = you play more of it than the guide. Amber = you play less or none.</p>
      ${column(active, ctx, deltas, 'mine')}</div>
    <div class="mv-col mv-guide"><h2>The guide's list</h2>
      <p class="muted small">by ${esc(base.author ?? 'unknown')}</p>
      ${column(base, ctx, deltas, 'guide')}</div>
  </div>`;
}

export function renderVersionResults(ctx) {
  const query = String(ctx.verState?.query ?? '');
  if (query.trim().length < 2) return '<p class="muted small">Type at least 2 letters of a card name, in English or Portuguese, to add it to your version.</p>';
  const found = searchCards(ctx.searchIndex ?? [], query, 12);
  if (!found.length) return `<p class="muted small">No card matches "${esc(query)}".</p>`;
  return `<ul class="coll-list">${found
    .map((c) => {
      const section = c.extra ? 'extra' : 'main';
      const meta = [c.type, c.rarity].filter(Boolean).join(' · ');
      return `<li class="coll-row"><span class="coll-name"><strong>${esc(c.name)}</strong>${c.pt ? `<span class="muted small coll-pt">${esc(c.pt)}</span>` : ''} <span class="tag">${esc(meta)}</span></span><button type="button" class="button" data-ver-add="${esc(c.name)}" data-section="${section}">Add to ${section === 'extra' ? 'Extra Deck' : 'main deck'}</button></li>`;
    })
    .join('')}</ul>`;
}

// Explains "own ?" and offers to mark the version's unmarked cards (unique names, main + Extra) as owned 0.
function unmarkedNote(active, ctx) {
  const owned = ctx.owned ?? {};
  const names = [...new Set([...active.main, ...active.extra].map((e) => e.name))].filter((n) => !Object.hasOwn(owned, n));
  if (!names.length) return '';
  const n = names.length;
  const one = n === 1;
  return `<p class="own-status warn">own ? means you have not marked that card in your collection yet. ${n} ${one ? 'card' : 'cards'} in this version ${one ? 'is' : 'are'} not marked yet.
    <button type="button" class="linklike" data-own-checkrest="${esc(JSON.stringify(names))}">Mark the ${n} unmarked ${one ? 'card' : 'cards'} as not owned</button> <a href="#/collection">Open My collection</a></p>`;
}

function controls(versions, active) {
  const chips = versions.map((v) => `<button type="button" class="chip" data-ver-pick="${esc(v.id)}" aria-pressed="${v.id === active.id}">${esc(v.name)}</button>`).join('');
  return `<div class="chips" role="group" aria-label="Your versions">${chips}</div>
    <p class="ver-tools"><button type="button" class="button" data-ver-new>New version from the guide's list</button> <button type="button" class="linklike" data-ver-dup>Duplicate</button> <button type="button" class="linklike" data-ver-rename>Rename</button> <button type="button" class="linklike" data-ver-del>Delete</button></p>`;
}

export function renderMyVersion(guide, ctx, slug) {
  const data = ctx.decklists?.[slug];
  const versions = ctx.versions?.[slug] ?? [];
  const intro = `<p class="muted">Build your own version of this deck, starting from a real list. Change cards, and the site tells you what you gain and what you lose compared with the guide's list. Saved in this browser.</p>`;
  if (!data || data.lists.length === 0) return `${intro}<p class="muted">No deck lists are available to start from.</p>`;
  if (versions.length === 0) {
    return `${intro}<section class="panel"><p>You have no version of this deck yet.</p><p><button type="button" class="button" data-ver-new>Start from the guide's list</button></p></section>`;
  }
  const active = versions.find((v) => v.id === ctx.verState?.id) ?? versions[0];
  const { list: base, missing } = baseListFor(active, data);
  const result = compareVersion({ guide, baseList: base, version: active, owned: ctx.owned ?? {}, isExtra: makeIsExtra(ctx) });
  const baseNote = missing && active.baseId === null
    ? `<p class="muted small">This version is compared with the deck's usual list (by ${esc(base.author ?? 'unknown')}).</p>`
    : missing
    ? `<p class="muted small">The list this version started from is no longer in the data, so it is compared with the deck's usual list (${esc(base.author ?? 'unknown')}).</p>`
    : `<p class="muted small">Compared with the list by ${esc(base.author ?? 'unknown')}${base.event ? ` at ${esc(base.event)}` : ''}.</p>`;
  return `
    ${intro}
    ${unmarkedNote(active, ctx)}
    ${controls(versions, active)}
    ${baseNote}
    <section class="panel">
      <h2>Add a card</h2>
      <label class="coll-search"><span class="sr-only">Search cards to add</span><input id="ver-search" type="search" value="${esc(ctx.verState?.query ?? '')}" placeholder="Search a card, in English or Portuguese" autocomplete="off"></label>
      <div id="ver-results" aria-live="polite">${renderVersionResults(ctx)}</div>
    </section>
    ${splitView(base, active, ctx)}
    ${renderComparison(result)}
    ${renderPacks({ main: active.main, extra: active.extra }, ctx)}`;
}
