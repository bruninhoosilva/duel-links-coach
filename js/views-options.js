import { cardButton, esc } from './dom.js';

function optionCard(name, ctx) {
  const card = ctx.cards[name];
  const face = card?.image
    ? `<img src="${esc(card.image)}" alt="" loading="lazy">`
    : `<span class="bcard-name">${esc(name)}</span>`;
  return `<button type="button" class="syn-card" data-card="${esc(name)}" title="${esc(name)}">${face}<span class="syn-name">${esc(name)}</span></button>`;
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
  return `<p class="muted">You do not need every card in the list. If you are missing one, these are the swaps the creators recommend, and why they work. Tap a card to read its text.</p>${blocks || '<p>No alternatives listed yet for this deck.</p>'}`;
}
