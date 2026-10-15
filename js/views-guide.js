import { renderMoveStrip, renderScenarioBoard } from './views-board.js';
import { ACTION_LABELS, ROLE_HELP, ROLE_LABELS, ROLE_ORDER, cardButton, describeSkillSource, esc, timeLink } from './dom.js';

const list = (items) => `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;

export function renderOverview(guide, ctx) {
  const skillText = ctx.skills[guide.skill.name]?.text ?? '';
  const sources = (guide.sources ?? [])
    .map(
      (s) =>
        `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>${s.creator ? ` by ${esc(s.creator)}` : ''}${s.language ? ` (${esc(s.language)})` : ''}</li>`,
    )
    .join('');
  return `
    <section class="panel">
      <details open>
        <summary><strong>Skill: ${esc(guide.skill.name)}</strong></summary>
        <blockquote class="skill-text">${esc(skillText)}</blockquote>
        <p><strong>When it works:</strong> ${esc(guide.skill.trigger)}</p>
        <p><strong>What you need:</strong> ${esc(guide.skill.enabler)}</p>
        ${describeSkillSource(ctx.skills[guide.skill.name]) ? `<p><strong>How to get this skill:</strong> ${describeSkillSource(ctx.skills[guide.skill.name])}</p>` : ''}
      </details>
    </section>
    <section><h2>Game plan</h2><p>${esc(guide.gamePlan)}</p></section>
    <div class="two-col">
      <section><h2>Strengths</h2>${list(guide.strengths ?? [])}</section>
      <section><h2>Weaknesses</h2>${list(guide.weaknesses ?? [])}</section>
    </div>
    <section>
      <h2>Where this guide comes from</h2>
      <p class="muted">Written in our own words from these videos, then checked against the real card text.</p>
      <ul>${sources}</ul>
    </section>`;
}

export function renderCards(guide, ctx) {
  const groups = ROLE_ORDER.map((role) => {
    const rows = (guide.cards ?? [])
      .filter((c) => c.role === role)
      .map((c) => {
        const pt = ctx.cards[c.name]?.pt;
        const image = ctx.cards[c.name]?.image;
        return `<tr>
          <td class="thumb-cell">${image ? `<img class="thumb" src="${esc(image)}" alt="" width="44" height="64" loading="lazy">` : ''}</td>
          <td>${cardButton(c.name)}${pt ? `<div class="muted small">${esc(pt)}</div>` : ''}</td>
          <td>${c.copies ? `x${c.copies}` : '-'}</td>
          <td>${esc(c.note ?? '')}</td>
        </tr>`;
      })
      .join('');
    if (!rows) return '';
    return `<section>
      <h2>${esc(ROLE_LABELS[role])}</h2>
      <p class="muted">${esc(ROLE_HELP[role])}</p>
      <div class="table-wrap"><table><thead><tr><th><span class="sr-only">Picture</span></th><th>Card</th><th>Typical copies</th><th>What it does here</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;
  }).join('');
  return `<p class="muted">Copies are what most recent ${esc(guide.deck)} decks run. Tap a card to read its full text.</p>${groups}`;
}

function synergyCard(name, ctx) {
  const card = ctx.cards[name];
  const face = card?.image
    ? `<img src="${esc(card.image)}" alt="" loading="lazy">`
    : `<span class="bcard-name">${esc(name)}</span>`;
  return `<button type="button" class="syn-card" data-card="${esc(name)}" title="${esc(name)}">${face}<span class="syn-name">${esc(name)}</span></button>`;
}

export function renderSynergies(guide, ctx = { cards: {} }) {
  const blocks = (guide.synergies ?? [])
    .map(
      (s) => `
    <section class="panel">
      <h2>${cardButton(s.card)}</h2>
      ${(s.partners ?? [])
        .map(
          (p) => `<div class="syn">
        <div class="syn-flow">${synergyCard(s.card, ctx)}<span class="syn-link"><span class="syn-label">${esc(p.link ?? 'works with')}</span><span class="syn-arrow" aria-hidden="true">→</span></span>${synergyCard(p.name, ctx)}</div>
        <p class="syn-reason">${esc(p.reason)}</p>
      </div>`,
        )
        .join('')}
    </section>`,
    )
    .join('');
  return `<p class="muted">Which cards help each other, and why. The arrow shows what the first card does for the second. Tap a card to read its text.</p>${blocks || '<p>No synergies listed yet.</p>'}`;
}

export function describeRequires(requires) {
  const r = requires ?? {};
  const parts = [];
  if (r.turn) parts.push(`Turn order: you are going ${r.turn}.`);
  if (r.board) parts.push(`Your board: ${r.board}.`);
  if (r.hand?.length) parts.push(`In your hand: ${r.hand.join(', ')}.`);
  for (const g of r.anyOf ?? []) parts.push(`In your hand: ${g.label}.`);
  for (const g of r.without ?? []) parts.push(`You do not have: ${g.label}.`);
  return parts.join(' ');
}

function renderStep(step, number, hasBoard, ctx) {
  const link = step.source?.url
    ? ` <a class="source" href="${esc(timeLink(step.source.url, step.source.timestamp))}" target="_blank" rel="noopener noreferrer" title="Open the video at this moment">video ${esc(step.source.timestamp ?? '')}</a>`
    : '';
  const check =
    step.confidence === 'medium'
      ? ' <span class="badge badge-check" title="Based on what the creator says; the card text does not settle it.">check in game</span>'
      : '';
  const strip = renderMoveStrip(step.moves, ctx);
  const show = hasBoard ? ` <button type="button" class="linklike" data-board-goto="${number}">Show on the board</button>` : '';
  if (step.type === 'skill') {
    return `<li class="step step-skill">
      <p><span class="tag tag-skill">Skill</span> <strong>${esc(step.skill)}</strong> <span class="muted">${esc(step.when)}</span></p>
      <p>${esc(step.reason)}</p>${strip}
      <dl class="mini"><dt>Needs</dt><dd>${esc(step.needs)}</dd><dt>Gives</dt><dd>${esc(step.gives)}</dd><dt>Uses the skill</dt><dd>${step.used ? 'Yes' : 'No'}</dd></dl>${check}${link}${show}
    </li>`;
  }
  return `<li class="step">
      <p><span class="tag">${esc(ACTION_LABELS[step.action] ?? step.action)}</span> ${cardButton(step.card)}</p>
      <p>${esc(step.reason)}</p>${strip}${check}${link}${show}
    </li>`;
}

export function renderPlay(guide, ctx = { cards: {} }) {
  const blocks = (guide.scenarios ?? [])
    .map((sc) => {
      const hasBoard = Boolean(sc.start);
      return `
    <section class="scenario" id="sc-${esc(sc.id)}">
      <h2>${esc(sc.title)}</h2>
      <p class="muted">${esc(describeRequires(sc.requires))}</p>
      <p><span class="tag${sc.skillPlan?.uses ? ' tag-skill' : ''}">${sc.skillPlan?.uses ? 'Uses the skill' : 'Skill not used'}</span> ${esc(sc.skillPlan?.note ?? '')}</p>
      ${hasBoard ? renderScenarioBoard(sc, ctx) : ''}
      <ol class="steps">${(sc.steps ?? []).map((st, i) => renderStep(st, i + 1, hasBoard, ctx)).join('')}</ol>
      ${sc.chainNotes ? `<p><strong>Chain notes:</strong> ${esc(sc.chainNotes)}</p>` : ''}
      <p><strong>End board:</strong> ${esc(sc.endBoard)}</p>
      ${sc.weakSpots ? `<p><strong>Weak spots:</strong> ${esc(sc.weakSpots)}</p>` : ''}
    </section>`;
    })
    .join('');
  return `<p class="muted">Follow the steps in order. A "check in game" tag means the step relies on what the creator says, so try it once before you depend on it.</p>${blocks}`;
}
