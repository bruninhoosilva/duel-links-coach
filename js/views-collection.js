import { esc } from './dom.js';
import { MAX_COPIES } from './collection.js';
import { searchCards } from './card-search.js';
import { renderOwnTools } from './views-own.js';

function row(c, ctx) {
  const owned = ctx.owned ?? {};
  const known = Object.hasOwn(owned, c.name);
  const have = Math.min(owned[c.name] ?? 0, MAX_COPIES);
  const image = ctx.cards?.[c.name]?.image ?? c.image;
  const thumb = image ? `<img class="thumb" src="${esc(image)}" alt="" width="44" height="64" loading="lazy">` : '<span class="thumb"></span>';
  const meta = [c.type, c.rarity].filter(Boolean).join(' · ');
  const label = esc(c.name);
  return `<li class="coll-row">${thumb}<span class="coll-name"><strong>${label}</strong>${c.pt ? `<span class="muted small coll-pt">${esc(c.pt)}</span>` : ''}${meta ? `<span class="tag">${esc(meta)}</span>` : ''}</span>
    <span class="own"><button type="button" class="own-btn" data-own="${label}" data-delta="-1" aria-label="I own one less ${label}"${known && have === 0 ? ' disabled' : ''}>−</button><span class="own-n${known ? '' : ' unknown'}">${known ? have : '?'}</span><button type="button" class="own-btn" data-own="${label}" data-delta="1" aria-label="I own one more ${label}"${have >= MAX_COPIES ? ' disabled' : ''}>+</button></span></li>`;
}

export function renderResults(ctx, query) {
  if (String(query ?? '').trim().length < 2) return '<p class="muted">Type at least 2 letters of a card name, in English or Portuguese.</p>';
  const found = searchCards(ctx.searchIndex ?? [], query);
  if (found.length === 0) return `<p class="muted">No card matches "${esc(query)}".</p>`;
  return `<ul class="coll-list">${found.map((c) => row(c, ctx)).join('')}</ul>`;
}

function renderOwnedList(ctx) {
  const byName = new Map((ctx.searchIndex ?? []).map((c) => [c.name, c]));
  const names = Object.entries(ctx.owned ?? {}).filter(([, n]) => n > 0).map(([name]) => name).sort((a, b) => a.localeCompare(b));
  if (names.length === 0) return '<p class="muted">Nothing here yet. Search for a card above, or mark cards while you look at a deck list.</p>';
  const copies = names.reduce((n, name) => n + ctx.owned[name], 0);
  return `<p class="muted small">${names.length} ${names.length === 1 ? 'card' : 'cards'}, ${copies} ${copies === 1 ? 'copy' : 'copies'}.</p>
    <ul class="coll-list">${names.map((name) => row(byName.get(name) ?? { name }, ctx)).join('')}</ul>`;
}

export function renderCollectionPage(ctx, query = '') {
  return `
    <section>
      <h1>My collection</h1>
      <p class="lead">Add the cards you own, a few at a time. You do not need to enter everything: mark cards while you look at a deck, and the "What can I build?" page will say which decks are close. Saved in this browser.</p>
      <label class="coll-search"><span class="sr-only">Search cards</span><input id="collection-search" type="search" value="${esc(query)}" placeholder="Search a card, in English or Portuguese" autocomplete="off"></label>
      <div id="collection-results" aria-live="polite">${renderResults(ctx, query)}</div>
    </section>
    <section>
      <h2>Cards I own</h2>
      ${renderOwnedList(ctx)}
      ${renderOwnTools(ctx)}
    </section>`;
}
