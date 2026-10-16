import { esc } from './dom.js';
import { deckHref } from './router.js';
import { rankDecks } from './build-rank.js';

export function guidedEntries(ctx) {
  return (ctx.index?.decks ?? [])
    .map((d) => {
      const data = ctx.decklists?.[d.slug];
      const list = data?.lists.find((l) => l.id === data.defaultId) ?? data?.lists[0];
      return list ? { slug: d.slug, name: d.name, tier: d.stats?.commonTier ?? null, list, guide: ctx.guides?.[d.slug] } : null;
    })
    .filter(Boolean);
}

export const otherEntries = (ctx) =>
  Object.values(ctx.otherdecks ?? {}).map((o) => ({ slug: o.slug, name: o.name, tier: o.stats?.commonTier ?? null, list: o.list }));

function row(r) {
  const pct = Math.round(r.score * 100);
  const href = r.kind === 'guide' ? deckHref(r.slug, 'lists') : `#/list/${encodeURIComponent(r.slug)}`;
  const tag = r.kind === 'guide' ? '<span class="badge badge-verified">with play guide</span>' : '<span class="badge">no guide yet</span>';
  const swap = r.swapCopies ? ` ${r.swapCopies} ${r.swapCopies === 1 ? 'copy is' : 'copies are'} covered by swaps you own.` : '';
  const unk = r.unknown ? ` ${r.unknown} of ${r.cards} cards not marked yet, so this may be higher.` : '';
  const most = r.missing.filter((m) => m.short > 0).slice(0, 3).map((m) => `${esc(m.name)} ×${m.short}`).join(', ');
  return `<li class="build-row">
    <div><a href="${href}"><strong>${esc(r.name)}</strong></a> ${tag}${r.tier ? ` <span class="muted small">tier ${esc(r.tier)}</span>` : ''}</div>
    <div class="bar" role="img" aria-label="${pct} percent owned"><span style="width:${pct}%"></span></div>
    <p class="small">You own ${r.copiesHave} of ${r.copiesNeed} copies (${pct}%).${swap}${unk}${most ? ` Missing most: ${most}.` : ''}</p>
  </li>`;
}

const SHOWN_OTHERS = 20;

export function renderBuildPage(ctx) {
  const { guided, others } = rankDecks({ guided: guidedEntries(ctx), others: otherEntries(ctx), owned: ctx.owned ?? {} });
  const empty = Object.keys(ctx.owned ?? {}).length === 0
    ? '<p class="skill-status warn">You have not marked any cards yet, so every deck shows 0%. Open <a href="#/collection">My collection</a> and add a few cards, or mark cards on a deck\'s list.</p>'
    : '';
  const first = others.slice(0, SHOWN_OTHERS);
  const rest = others.slice(SHOWN_OTHERS);
  return `
    <section>
      <h1>What can I build?</h1>
      <p class="lead">Every deck, ranked by how many copies of its list you already own. Cards you have not marked yet count as not owned, so a deck can only look better than shown.</p>
      ${empty}
      <h2>Decks with a play guide</h2>
      <ol class="build-list">${guided.map(row).join('') || '<li class="muted">No guides are published yet.</li>'}</ol>
      <h2>Other top decks <span class="muted small">(no play guide yet)</span></h2>
      <ol class="build-list">${first.map(row).join('')}</ol>
      ${rest.length ? `<details><summary>Show the other ${rest.length} decks</summary><ol class="build-list">${rest.map(row).join('')}</ol></details>` : ''}
      <p class="muted small">Lists are a typical recent build from Duel Links Meta. Swaps come from each guide's Alternatives tab.</p>
    </section>`;
}
