// Which packs to open for a deck list. Pure functions: no DOM.
// Cards with no pack at all, or only a character reward or event, are reported apart.

const setsOf = (card) => (card?.obtain ?? []).filter((o) => o.kind === 'set');

export function packPlan(list, cards, owned = {}) {
  const entries = new Map();
  for (const e of [...(list?.main ?? []), ...(list?.extra ?? [])]) {
    entries.set(e.name, (entries.get(e.name) ?? 0) + e.count);
  }
  const allNames = [...entries.keys()];
  // Cards you already own in full need no pack.
  const names = allNames.filter((n) => (owned[n] ?? 0) < entries.get(n));
  const complete = allNames.length - names.length;
  const bySet = new Map(); // pack name -> { name, boxType, url, cards: Set }
  const noPack = [];
  const freeOnly = [];
  for (const name of names) {
    const sets = setsOf(cards[name]);
    if (sets.length === 0) {
      const other = (cards[name]?.obtain ?? []).filter((o) => o.kind !== 'set');
      (other.length ? freeOnly : noPack).push({ name, how: other.map((o) => o.name) });
      continue;
    }
    for (const s of sets) {
      if (!bySet.has(s.name)) bySet.set(s.name, { name: s.name, boxType: s.boxType, url: s.url, cards: new Set() });
      bySet.get(s.name).cards.add(name);
    }
  }

  // Greedy: always take the pack that adds the most cards not covered yet.
  const covered = new Set();
  const steps = [];
  const pool = [...bySet.values()];
  while (pool.length) {
    let best = null;
    let bestNew = [];
    for (const p of pool) {
      const fresh = [...p.cards].filter((n) => !covered.has(n));
      if (fresh.length > bestNew.length || (fresh.length === bestNew.length && best && fresh.length > 0 && p.name < best.name)) {
        best = p;
        bestNew = fresh;
      }
    }
    if (!best || bestNew.length === 0) break;
    bestNew.sort();
    bestNew.forEach((n) => covered.add(n));
    steps.push({ name: best.name, boxType: best.boxType, url: best.url, cards: bestNew, total: best.cards.size });
    pool.splice(pool.indexOf(best), 1);
  }
  const needPacks = names.length - noPack.length - freeOnly.length;
  return { steps, noPack, freeOnly, needPacks, totalCards: allNames.length, complete };
}
