import { UNKNOWN_CARD, ZONE_LABELS, simulateScenario } from './board.js';
import { ACTION_LABELS, esc } from './dom.js';

function cardFace(name, ctx, extra = '') {
  if (name === UNKNOWN_CARD) {
    return `<span class="bcard bcard-back${extra}" title="A card you draw or add"><span class="sr-only">Unknown card</span></span>`;
  }
  const card = ctx.cards[name];
  const inner = card?.image
    ? `<img src="${esc(card.image)}" alt="${esc(name)}" loading="lazy">`
    : `<span class="bcard-name">${esc(name)}</span>`;
  return `<button type="button" class="bcard${extra}" data-card="${esc(name)}" title="${esc(name)}">${inner}</button>`;
}

export function renderBoardState(state, moved, ctx) {
  const hi = (name, zone) => (moved.has(`${name}|${zone}`) ? ' hi' : '');
  const row = (zone, size, label) => {
    const cells = state[zone].map((name) => {
      const face = cardFace(name, ctx, hi(name, zone));
      const materials = state.overlay[name]?.length;
      return materials ? `<span class="bwrap">${face}<span class="bmat" title="Xyz materials">${materials}</span></span>` : face;
    });
    while (cells.length < size) cells.push('<span class="bslot"></span>');
    return `<div class="brow"><span class="blabel">${esc(label)}</span><div class="bcells">${cells.join('')}</div></div>`;
  };
  const pile = (zone, label) => {
    const cards = state[zone].map((name) => cardFace(name, ctx, hi(name, zone))).join('');
    return `<div class="bpile"><span class="blabel">${esc(label)} (${state[zone].length})</span><div class="bcells bcells-wrap">${cards || '<span class="muted small">empty</span>'}</div></div>`;
  };
  return `<div class="board">
    ${row('spell-trap-zone', 5, 'Spell/Trap zone')}
    ${row('monster-zone', 5, 'Monster zone')}
    ${row('extra-monster-zone', 2, 'Extra Monster Zone')}
    ${pile('hand', 'Hand')}
    <div class="bpiles">${pile('graveyard', 'Graveyard')}${pile('banished', 'Banished')}</div>
  </div>`;
}

export function stepCaption(step) {
  if (!step) return 'These example cards are where you begin.';
  if (step.type === 'skill') return `Skill: ${step.skill}. ${step.reason}`;
  return `${ACTION_LABELS[step.action] ?? step.action} ${step.card}. ${step.reason}`;
}

// Every snapshot is rendered up front (start plus one per step); the browser only shows one at a time.
export function renderScenarioBoard(scenario, ctx) {
  const { states } = simulateScenario(scenario);
  const total = scenario.steps.length;
  const panels = states
    .map((state, i) => {
      const step = scenario.steps[i - 1];
      const moved = new Set(
        (step?.moves ?? []).filter((m) => m.to !== 'deck' && m.to !== 'extra-deck').map((m) => `${m.card}|${m.to}`),
      );
      return `<div class="board-step" data-board-step="${i}"${i === 0 ? '' : ' hidden'}>
      <p class="board-caption"><strong>${i === 0 ? 'Start.' : `Step ${i} of ${total}.`}</strong> ${esc(stepCaption(step))}</p>
      ${renderBoardState(state, moved, ctx)}
    </div>`;
    })
    .join('');
  return `<div class="board-wrap" data-board="${esc(scenario.id)}" data-steps="${total}">
    <p class="muted small">${esc(scenario.start?.note ?? 'Example cards: yours will differ, but the moves are the same.')}</p>
    <div class="board-controls">
      <button type="button" class="button" data-board-nav="prev">Back</button>
      <button type="button" class="button" data-board-nav="next">Next step</button>
      <span class="muted small" data-board-count>Start</span>
    </div>
    ${panels}
  </div>`;
}

const zoneLabel = (zone, under) => (zone === 'overlay' ? `Material of ${under}` : ZONE_LABELS[zone] ?? zone);

function miniCard(name, ctx) {
  if (name === UNKNOWN_CARD) return '<span class="mini-card mini-back"></span>';
  const card = ctx.cards[name];
  if (!card?.image) return `<span class="mini-card mini-text">${esc(name)}</span>`;
  return `<button type="button" class="mini-card-btn" data-card="${esc(name)}" title="${esc(name)}"><img class="mini-card" src="${esc(card.image)}" alt=""></button>`;
}

export function renderMoveStrip(moves, ctx) {
  if (!moves?.length) return '';
  const items = moves
    .map(
      (m) => `<li class="move">${miniCard(m.card, ctx)}<span class="move-text"><strong>${esc(m.card === UNKNOWN_CARD ? 'A card' : m.card)}</strong> <span class="arrow">${esc(zoneLabel(m.from, m.under))} → ${esc(zoneLabel(m.to, m.under))}</span></span></li>`,
    )
    .join('');
  return `<ul class="moves" aria-label="Where the cards go">${items}</ul>`;
}
