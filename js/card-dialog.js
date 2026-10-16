import { ROLE_LABELS, cardButton, describeObtain, esc } from './dom.js';
import { deckHref } from './router.js';

const closeForm = '<form method="dialog" class="dialog-close"><button class="button">Close</button></form>';

// A bar that stays at the top while the pop-up scrolls: previous / counter / next, and a close X.
// nav: { index, total } when there are other cards to move to, otherwise null.
function topBar(nav) {
  const steps = nav
    ? `<button type="button" class="dialog-step" data-card-step="-1" aria-label="Previous card">‹</button><span class="dialog-count" aria-live="polite">${nav.index + 1} / ${nav.total}</span><button type="button" class="dialog-step" data-card-step="1" aria-label="Next card">›</button>`
    : '<span></span>';
  return `<div class="dialog-bar">${steps}<form method="dialog" class="dialog-x-form"><button class="dialog-x" aria-label="Close">×</button></form></div>`;
}

export function renderCardDialog(name, guide, ctx, slug, nav = null) {
  const hasGuide = Boolean(guide);
  guide = guide ?? {};
  const card = ctx.cards[name];
  if (!card) return `${topBar(nav)}<h2 id="card-dialog-title">${esc(name)}</h2><p>No card data.</p>${closeForm}`;

  const kind = [card.type, ...(card.monsterType ?? []), card.rarity].filter(Boolean).join(' · ');
  const stats = [
    card.level != null ? `Level ${card.level}` : null,
    card.attribute,
    card.race,
    card.atk != null ? `ATK ${card.atk}` : null,
    card.def != null ? `DEF ${card.def}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const entry = (guide.cards ?? []).find((c) => c.name === name);
  const role = entry ? `<p><strong>Role in this deck:</strong> ${esc(ROLE_LABELS[entry.role] ?? entry.role)}${entry.copies ? `, typically x${entry.copies}` : ''}</p>` : '';

  const uncovered = entry || !hasGuide ? '' : '<p class="muted small">This card is in recent lists, but this guide does not cover it yet.</p>';

  const partners = [];
  for (const s of guide.synergies ?? []) {
    if (s.card === name) for (const p of s.partners ?? []) partners.push({ other: p.name, reason: p.reason });
    else for (const p of s.partners ?? []) if (p.name === name) partners.push({ other: s.card, reason: p.reason });
  }
  const works = partners.length
    ? `<h3>Works with</h3><ul>${partners.map((p) => `<li>${cardButton(p.other)}: ${esc(p.reason)}</li>`).join('')}</ul>`
    : '';

  const subs = (entry?.substitutes ?? []).length
    ? `<h3>No ${esc(name)}?</h3><ul>${entry.substitutes.map((s) => `<li>Use ${cardButton(s.name)}: ${esc(s.why)}</li>`).join('')}</ul>`
    : '';
  const standsIn = [];
  for (const c of guide.cards ?? []) for (const s of c.substitutes ?? []) if (s.name === name) standsIn.push({ other: c.name, why: s.why });
  const standsInHtml = standsIn.length
    ? `<h3>Can stand in for</h3><ul>${standsIn.map((s) => `<li>${cardButton(s.other)}: ${esc(s.why)}</li>`).join('')}</ul>`
    : '';

  const getIt = (card.obtain ?? []).length
    ? `<h3>Where to get it</h3><ul>${card.obtain.map((o) => `<li>${describeObtain(o)}</li>`).join('')}</ul>`
    : '<h3>Where to get it</h3><p class="muted small">Duel Links Meta lists no pack or reward for this card (a skill may add it, or it is not out yet).</p>';

  const used = [];
  for (const sc of guide.scenarios ?? []) (sc.steps ?? []).forEach((st, i) => st.card === name && used.push({ sc, n: i + 1 }));
  const usedHtml = used.length
    ? `<h3>Used in</h3><ul>${used.map((u) => `<li><a href="${deckHref(slug, 'play', u.sc.id)}">${esc(u.sc.title)}</a>, step ${u.n}</li>`).join('')}</ul>`
    : '';

  return `
    ${topBar(nav)}
    ${card.image ? `<img class="card-art" src="${esc(card.image)}" alt="Artwork of ${esc(card.name)}" width="177" height="254">` : ''}
    <h2 id="card-dialog-title">${esc(card.name)}</h2>
    ${card.pt ? `<p class="muted">${esc(card.pt)}</p>` : ''}
    <p class="muted">${esc(kind)}${kind && stats ? '<br>' : ''}${esc(stats)}</p>
    ${card.text ? `<blockquote class="skill-text">${esc(card.text)}</blockquote>` : '<p class="muted small">Card text is not loaded for this card.</p>'}
    ${role}${uncovered}${getIt}${subs}${standsInHtml}${works}${usedHtml}${closeForm}`;
}
