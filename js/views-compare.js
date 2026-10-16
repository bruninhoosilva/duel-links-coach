import { esc } from './dom.js';
import { ROLE_NAMES } from './compare.js';

const pct = (x) => `${Math.round(x * 100)}%`;
// Points between the two rounded percentages, so the column always matches the numbers shown next to it.
const points = (o) => Math.round(o.mine * 100) - Math.round(o.base * 100);
const change = (pts) => (pts === 0 ? 'no change' : `${pts > 0 ? '+' : '−'}${Math.abs(pts)} ${Math.abs(pts) === 1 ? 'pt' : 'pts'}`);
const list = (items) => `<ul class="cmp-list">${items.map((s) => `<li>${esc(s.text)}</li>`).join('')}</ul>`;

function oddsTable(odds) {
  if (!odds.length) return '';
  const rows = odds
    .map((o) => {
      const pts = points(o);
      const without = o.without?.length ? `<div class="muted small">only when you do not hold: ${esc(o.without.join(', '))}</div>` : '';
      return `<tr><td>${esc(o.title)}<div class="muted small">${o.handSize} cards</div>${without}</td><td>${pct(o.base)}</td><td>${pct(o.mine)}</td><td class="${pts < 0 ? 'neg' : pts > 0 ? 'pos' : ''}">${change(pts)}</td></tr>`;
    })
    .join('');
  return `<h3>Chance to open each play line</h3>
    <div class="table-wrap"><table><thead><tr><th>Line</th><th>Guide's list</th><th>Your version</th><th>Change</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="muted small">Counted over every possible hand: 4 cards, or 5 going second, from your main deck plus the cards the skill adds. It does not count what the skill itself finds later in the turn, and lines that start from a board have no opening chance.</p>`;
}

function roleTable(roles) {
  const rows = Object.keys(ROLE_NAMES)
    .filter((r) => roles.base[r] || roles.mine[r])
    .map((r) => `<tr><td>${esc(ROLE_NAMES[r])}</td><td>${roles.base[r]}</td><td>${roles.mine[r]}</td></tr>`)
    .join('');
  return `<h3>Cards by role</h3><div class="table-wrap"><table><thead><tr><th>Role</th><th>Guide's list</th><th>Your version</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

export function renderComparison(result) {
  const of = (kind) => result.statements.filter((s) => s.kind === kind);
  const [pros, cons, notes] = [of('pro'), of('con'), of('note')];
  const same = result.diff.removed.length === 0 && result.diff.added.length === 0;
  const warnings = result.warnings.length
    ? `<div class="skill-status warn"><strong>Check these:</strong><ul>${result.warnings.map((w) => `<li>${esc(w.text)}</li>`).join('')}</ul></div>`
    : '';
  const body = same
    ? '<p class="muted">Your version is identical to the guide\'s list, so there is nothing to compare yet. Change a card above and the differences appear here.</p>'
    : `<div class="two-col">
        <section class="cmp-pro"><h3>What you gain</h3>${pros.length ? list(pros) : '<p class="muted small">Nothing the guide can point to.</p>'}</section>
        <section class="cmp-con"><h3>What you lose</h3>${cons.length ? list(cons) : '<p class="muted small">Nothing the guide can point to.</p>'}</section>
      </div>
      ${notes.length ? `<section><h3>Worth knowing</h3>${list(notes)}</section>` : ''}`;
  return `<section class="panel"><h2>Your version against the guide's list</h2>
    ${warnings}
    ${body}
    ${oddsTable(result.odds)}
    ${roleTable(result.roles)}
    <p class="muted small">Limited and Forbidden cards are not checked: our data has no Speed banlist. Everything above comes from the guide and from counting the cards, so a card the guide does not cover is flagged, not judged.</p>
  </section>`;
}
