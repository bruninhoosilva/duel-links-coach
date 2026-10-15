import { ROLE_ORDER, esc } from './dom.js';
import { packPlan } from './packs.js';
import { MAX_COPIES, listProgress } from './collection.js';

const listLabel = (l) => [l.author, l.event, l.created].filter(Boolean).join(' · ') + ` · ${l.mainSize} cards`;

function tile(entry, ctx, covered) {
  const have = Math.min(ctx.owned?.[entry.name] ?? 0, MAX_COPIES);
  const card = ctx.cards[entry.name];
  const face = card?.image
    ? `<img src="${esc(card.image)}" alt="${esc(entry.name)}" loading="lazy">`
    : `<span class="bcard-name">${esc(entry.name)}</span>`;
  const title = `${entry.name}${covered ? '' : ' (not covered by this guide)'}`;
  const short = have < entry.count;
  const own = `<div class="own"><button type="button" class="own-btn" data-own="${esc(entry.name)}" data-delta="-1" aria-label="I own one less ${esc(entry.name)}"${have === 0 ? ' disabled' : ''}>−</button><span class="own-n${short ? ' short' : ''}" title="Copies you own / copies this list plays">${have}/${entry.count}</span><button type="button" class="own-btn" data-own="${esc(entry.name)}" data-delta="1" aria-label="I own one more ${esc(entry.name)}"${have >= MAX_COPIES ? ' disabled' : ''}>+</button></div>`;
  return `<div class="dwrap${short ? ' short' : ''}"><button type="button" class="dtile${covered ? '' : ' nocover'}" data-card="${esc(entry.name)}" title="${esc(title)}">${face}<span class="qty">×${entry.count}</span></button>${own}</div>`;
}

function miniFace(name, ctx) {
  const card = ctx.cards[name];
  return card?.image
    ? `<img class="mini-card" src="${esc(card.image)}" alt="" loading="lazy">`
    : `<span class="mini-card mini-text">${esc(name)}</span>`;
}

function renderPacks(list, ctx) {
  const plan = packPlan(list, ctx.cards, ctx.owned ?? {});
  if (plan.steps.length === 0) {
    return plan.complete === plan.totalCards
      ? '<section><h2>Which packs to open</h2><p>You own every card in this list, so there is nothing to open.</p></section>'
      : '';
  }
  let running = 0;
  const rows = plan.steps
    .map((s, i) => {
      running += s.cards.length;
      const title = s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a>` : esc(s.name);
      const faces = s.cards.map((n) => `<button type="button" class="mini-card-btn" data-card="${esc(n)}" title="${esc(n)}">${miniFace(n, ctx)}</button>`).join('');
      return `<li class="pack"><div><strong>${i + 1}. ${title}</strong>${s.boxType ? ` <span class="tag">${esc(s.boxType)}</span>` : ''}<div class="muted small">Adds ${s.cards.length} card${s.cards.length === 1 ? '' : 's'} you still need (${s.total} in the pack are in this list). Running total: ${running} of ${plan.needPacks}.</div></div><div class="pack-cards">${faces}</div></li>`;
    })
    .join('');
  const extra = (items, text) => (items.length ? `<p class="muted small"><strong>${text}</strong> ${items.map((c) => `${esc(c.name)}${c.how.length ? ` (${esc([...new Set(c.how)].slice(0, 2).join(', '))})` : ''}`).join(', ')}.</p>` : '');
  return `<section><h2>Which packs to open</h2>
    <p class="muted">This is the shortest order of packs that gets every card in this list that comes from a pack: each pack below is the one that adds the most cards you are still missing. Cards you mark as owned (above) are left out. Packs show what is in them, not what they cost or how likely you are to pull the card.</p>
    <ol class="packs">${rows}</ol>
    ${extra(plan.freeOnly, 'Not in any pack, but a character reward or event gives them:')}
    ${extra(plan.noPack, 'No source listed (a skill may add them, or they are not out yet):')}
  </section>`;
}

function renderProgress(list, ctx) {
  const p = listProgress(list, ctx.owned ?? {});
  const any = Object.keys(ctx.owned ?? {}).length > 0;
  return `<div class="own-summary"><strong>${p.cardsDone} of ${p.cards} cards complete</strong> <span class="muted">(${p.copiesHave} of ${p.copiesNeed} copies).</span> <span class="muted small">Use − and + under each card to set how many you own. Saved only in this browser.</span>${any ? ' <button type="button" class="linklike" data-own-clear>Clear my collection</button>' : ''}</div>`;
}

export function renderDeckLists(guide, ctx, slug, listId) {
  const data = ctx.decklists?.[slug];
  if (!data || data.lists.length === 0) return '<p class="muted">No recent deck lists are available for this deck.</p>';
  const list = data.lists.find((l) => l.id === listId) ?? data.lists.find((l) => l.id === data.defaultId) ?? data.lists[0];

  const roleOf = new Map((guide.cards ?? []).map((c) => [c.name, c.role]));
  const rank = (name) => {
    const r = ROLE_ORDER.indexOf(roleOf.get(name));
    return r < 0 ? ROLE_ORDER.length : r;
  };
  const grid = (entries) =>
    `<div class="deck-tiles">${[...entries]
      .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
      .map((e) => tile(e, ctx, roleOf.has(e.name)))
      .join('')}</div>`;

  const picker = data.lists
    .map((l) => `<button type="button" class="chip" data-list-pick="${esc(l.id)}" aria-pressed="${l.id === list.id}">${esc(listLabel(l))}</button>`)
    .join('');
  const adds = guide.skill?.adds ?? [];
  const addsTotal = adds.reduce((n, a) => n + a.copies, 0);
  const source = list.url
    ? ` <a href="${esc(list.url)}" target="_blank" rel="noopener noreferrer">See this list on Duel Links Meta</a>`
    : '';

  return `
    <p class="muted">Real lists from recent top decks, with the cards in the quantities they play. Tap a card to read it. Dashed cards are not covered by this guide yet.</p>
    <div class="chips" role="group" aria-label="Choose a deck list">${picker}</div>
    ${renderProgress(list, ctx)}
    <p class="muted small">List by ${esc(list.author ?? 'unknown')}${list.event ? ` at ${esc(list.event)}` : ''}${list.created ? `, ${esc(list.created)}` : ''}.${source}</p>
    <section><h2>Main deck (${list.mainSize})</h2>${grid(list.main)}</section>
    ${list.extra.length ? `<section><h2>Extra Deck (${list.extraSize})</h2>${grid(list.extra)}</section>` : ''}
    ${renderPacks(list, ctx)}
    ${adds.length ? `<section><h2>Added by the skill (${addsTotal})</h2><p class="muted small">${esc(guide.skill.name)} puts these in your deck at the start of the duel, so they are not in the list above.</p>${grid(adds.map((a) => ({ name: a.card, count: a.copies })))}</section>` : ''}`;
}
