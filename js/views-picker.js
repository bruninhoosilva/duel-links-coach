import { esc } from './dom.js';
import { deckHref } from './router.js';
import { matchScenarios, skillStatus, handPool, canAdd, MAX_HAND } from './match-hand.js';

const lineItem = (scenario, slug, extra = '') =>
  `<li><a href="${deckHref(slug, 'play', scenario.id)}">${esc(scenario.title)}</a>${extra}</li>`;

function face(name, ctx) {
  const card = ctx.cards?.[name];
  return card?.image
    ? `<img src="${esc(card.image)}" alt="${esc(name)}" loading="lazy">`
    : `<span class="bcard-name">${esc(name)}</span>`;
}

function renderHand(hand, ctx, canDeal) {
  const slots = hand.map(
    (name, i) =>
      `<button type="button" class="hand-card" data-unpick="${esc(name)}" data-hand-slot="${i}" title="Tap to put ${esc(name)} back">${face(name, ctx)}</button>`,
  );
  while (slots.length < MAX_HAND) slots.push('<span class="hand-slot"></span>');
  const clear = hand.length ? ' <button type="button" class="linklike" data-unpick-all>Clear hand</button>' : '';
  const deal = canDeal ? `<button type="button" class="button" data-deal>Deal a random hand</button> <span class="muted small">Draws 4 cards from the deck list chosen in the Deck lists tab.</span>` : '';
  return `<div class="hand-area"><div class="blabel">Your hand (${hand.length}/${MAX_HAND})${clear}</div><div class="hand-row" role="group" aria-label="Your hand">${slots.join('')}</div>${deal ? `<p class="deal-row">${deal}</p>` : ''}</div>`;
}

function renderPool(guide, hand, ctx) {
  const tiles = handPool(guide, ctx.cards)
    .map((name) => {
      const inHand = hand.filter((n) => n === name).length;
      const full = !canAdd(guide, hand, name);
      return `<div class="pool-item"><button type="button" class="pool-card${full ? ' full' : ''}" data-pick="${esc(name)}" aria-disabled="${full}" title="${esc(name)}">${face(name, ctx)}${inHand ? `<span class="qty">×${inHand}</span>` : ''}</button><button type="button" class="pool-info" data-card="${esc(name)}" aria-label="Read ${esc(name)}">i</button></div>`;
    })
    .join('');
  return `<h3>Pick your cards</h3><div class="pool" role="group" aria-label="Cards you can pick">${tiles}</div>`;
}

function renderTurnToggle(turn) {
  const btn = (value, label) =>
    `<button type="button" class="chip" data-turn="${value}" aria-pressed="${turn === value}">${label}</button>`;
  return `<div class="chips turn-toggle" role="group" aria-label="Turn order"><span class="blabel">Turn order:</span> ${btn('first', 'Going first')}${btn('second', 'Going second')}</div>`;
}

export function renderPicker(guide, hand, slug, ctx = { cards: {} }, turn = 'first') {
  const { matches, near, boards, otherTurn } = matchScenarios(guide, hand, turn);
  const skill = skillStatus(guide, hand);

  let results;
  if (hand.length === 0) {
    results = '<p class="muted">Tap the cards in your starting hand to see which line to play.</p>';
  } else {
    const status = skill.anyHand
      ? '<div class="skill-status ok">Skill ready: this skill does not need a specific card in your hand.</div>'
      : skill.ready
      ? `<div class="skill-status ok">Skill ready: you hold ${esc(skill.inHand.join(', '))}.</div>`
      : `<div class="skill-status warn">Skill not ready yet: it needs one of ${esc(skill.enablers.join(', '))}.</div>`;
    const noMatch = skill.ready && !skill.anyHand
      ? `<p><strong>${esc(skill.inHand.join(' and '))} can switch the skill on, but we have no recorded line for this exact hand yet.</strong> These are the closest ones, with what each still needs.</p>`
      : '<p><strong>No line matches this exact hand.</strong> The closest ones are below.</p>';
    const best = matches.length
      ? `<h3>Play this</h3><ol class="results">${matches
          .map((m, i) => lineItem(m.scenario, slug, i === 0 ? ' <span class="badge badge-verified">best match</span>' : ''))
          .join('')}</ol>`
      : `${noMatch}
         <ul class="results">${near
           .slice(0, 3)
           .map((n) =>
             lineItem(
               n.scenario,
               slug,
               ` <span class="muted">${n.missing.length ? `Missing: ${esc(n.missing.join(', '))}. ` : ''}${n.blockedBy.length ? `Does not fit because you have ${esc(n.blockedBy.join(', '))}.` : ''}</span>`,
             ),
           )
           .join('')}</ul>`;
    results = `${status}${best}`;
  }

  const boardHtml = boards.length
    ? `<h3>Finishing lines that start from a board</h3><ul class="results">${boards
        .map((b) => lineItem(b.scenario, slug, ` <span class="muted">You need: ${esc(b.board)}.</span>`))
        .join('')}</ul>`
    : '';

  const otherHtml = otherTurn.length
    ? `<p class="muted small">Lines for going ${esc(otherTurn[0].turn)}: ${otherTurn
        .map((o) => `<a href="${deckHref(slug, 'play', o.scenario.id)}">${esc(o.scenario.title)}</a>`)
        .join('; ')}.</p>`
    : '';

  return `
    <p class="muted">Tap a card below to draw it into your hand, and tap a card in your hand to put it back. The picker shows which line fits and whether the skill is ready.</p>
    ${renderTurnToggle(turn)}
    ${renderHand(hand, ctx, Boolean(ctx.decklists?.[slug]?.lists?.length))}
    ${results}
    ${boardHtml}
    ${otherHtml}
    ${renderPool(guide, hand, ctx)}`;
}
