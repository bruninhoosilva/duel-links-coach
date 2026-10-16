import { esc } from './dom.js';
import { renderPacks, renderProgress, tile } from './views-decklists.js';

export function renderOtherDeck(pageCtx, slug) {
  // The pack data for these lists lives in extracards; guide card data (with pictures) wins when both have a card.
  const ctx = { ...pageCtx, cards: { ...(pageCtx.extracards ?? {}), ...(pageCtx.cards ?? {}) } };
  // Object.hasOwn: a slug like "__proto__" or "constructor" must not find a built-in property.
  const deck = Object.hasOwn(ctx.otherdecks ?? {}, slug) ? ctx.otherdecks[slug] : null;
  if (!deck) return '<section><h1>Deck not found</h1><p><a href="#/build">Back to "What can I build?"</a></p></section>';
  const list = deck.list;
  const grid = (entries) => `<div class="deck-tiles">${[...entries].sort((a, b) => a.name.localeCompare(b.name)).map((e) => tile(e, ctx, true)).join('')}</div>`;
  const source = list.url ? ` <a href="${esc(list.url)}" target="_blank" rel="noopener noreferrer">See this list on Duel Links Meta</a>` : '';
  const tier = deck.stats?.commonTier ? `Most common tier on Duel Links Meta: ${esc(deck.stats.commonTier)}.` : 'No tier listed on Duel Links Meta.';
  return `
    <section>
      <p class="crumbs"><a href="#/build">What can I build?</a></p>
      <h1>${esc(deck.name)} <span class="badge">no guide yet</span></h1>
      <p class="muted">This deck has no play guide yet, only a typical list. ${tier}${source}</p>
      ${renderProgress(list, ctx)}
      <section><h2>Main deck (${list.mainSize})</h2>${grid(list.main)}</section>
      ${list.extra.length ? `<section><h2>Extra Deck (${list.extraSize})</h2>${grid(list.extra)}</section>` : ''}
      ${renderPacks(list, ctx)}
    </section>`;
}
