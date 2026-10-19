import { esc } from './dom.js';
import { deckHref } from './router.js';

const percent = (share) => `${(share * 100).toFixed(1)}%`;
const badge = (status) => `<span class="badge badge-${esc(status)}">${status === 'verified' ? 'Verified' : 'Draft'}</span>`;

export function renderDeckList(index) {
  const cards = index.decks
    .map((d) => {
      const tier = d.stats.commonTier ? `Most common tier on Duel Links Meta: ${d.stats.commonTier}` : 'No tier listed on Duel Links Meta';
      const art = d.featured?.image
        ? `<a class="deck-art" href="${deckHref(d.slug)}" tabindex="-1" aria-hidden="true"><img src="${esc(d.featured.image)}" alt="" width="118" height="170" loading="lazy"><span class="deck-art-name">${esc(d.featured.name)}</span></a>`
        : '';
      return `
    <article class="deck-card${art ? ' has-art' : ''}">
      ${art}
      <h2><a href="${deckHref(d.slug)}">${esc(d.name)}</a> ${badge(d.status)}</h2>
      <p class="muted">Skill: ${esc(d.skill)}</p>
      <ul class="facts">
        <li>${d.stats.decks} of ${d.stats.totalDecks} recent top decks (${percent(d.stats.share)})</li>
        <li>${esc(tier)}</li>
        <li>${d.scenarios} play ${d.scenarios === 1 ? 'line' : 'lines'}, updated ${esc(d.updated)}</li>
      </ul>
      <p><a class="button" href="${deckHref(d.slug)}">Open the guide</a></p>
    </article>`;
    })
    .join('');
  const fetched = index.dataFetchedAt ? index.dataFetchedAt.slice(0, 10) : 'an unknown date';
  return `
    <section>
      <h1>Duel Links decks, explained step by step</h1>
      <p class="lead">Pick a deck to see its skill, its cards, which cards work together, and the order to play them in. Every step is checked against the real card text.</p>
      <div class="deck-grid">${cards || '<p class="muted">No guides are published yet.</p>'}</div>
      <p class="muted small">Deck statistics are from Duel Links Meta, fetched ${esc(fetched)}. Guides are written by hand, so check the date on each one.</p>
    </section>`;
}
