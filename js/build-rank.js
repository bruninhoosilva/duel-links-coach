// Ranks decks by how much of their list you own. Pure functions.
// entries: { slug, name, tier, list: { main, extra }, guide? }. A guide's cards may carry `substitutes`.

function rowFor(entry, kind, owned) {
  const need = new Map();
  for (const e of [...entry.list.main, ...entry.list.extra]) need.set(e.name, (need.get(e.name) ?? 0) + e.count);
  const subs = new Map();
  for (const c of entry.guide?.cards ?? []) if (c.substitutes?.length) subs.set(c.name, c.substitutes.map((s) => s.name));

  // Copies of a swap card you own beyond what the list itself plays, shared between the cards it can replace.
  const spare = new Map();
  const spareOf = (name) => {
    if (!spare.has(name)) spare.set(name, Math.max(0, (owned[name] ?? 0) - (need.get(name) ?? 0)));
    return spare.get(name);
  };

  let copiesHave = 0;
  let copiesNeed = 0;
  let swapCopies = 0;
  let cardsDone = 0;
  let unknown = 0;
  const missing = [];
  for (const [name, n] of need) {
    const have = Math.min(owned[name] ?? 0, n);
    copiesHave += have;
    copiesNeed += n;
    if (!Object.hasOwn(owned, name)) unknown++;
    if (have >= n) {
      cardsDone++;
      continue;
    }
    let short = n - have;
    const swappedWith = [];
    for (const y of subs.get(name) ?? []) {
      const take = Math.min(short, spareOf(y));
      if (take > 0) {
        spare.set(y, spareOf(y) - take);
        short -= take;
        swapCopies += take;
        swappedWith.push(y);
      }
      if (short === 0) break;
    }
    missing.push({ name, short, swappedWith });
  }
  missing.sort((a, b) => b.short - a.short || a.name.localeCompare(b.name));
  return {
    slug: entry.slug, name: entry.name, kind, tier: entry.tier ?? null,
    score: copiesNeed ? (copiesHave + swapCopies) / copiesNeed : 0,
    copiesHave, copiesNeed, swapCopies, cardsDone, cards: need.size, unknown, missing,
  };
}

const order = (a, b) => b.score - a.score || (a.tier ?? 99) - (b.tier ?? 99) || a.name.localeCompare(b.name);

export function rankDecks({ guided = [], others = [], owned = {} }) {
  return {
    guided: guided.map((e) => rowFor(e, 'guide', owned)).sort(order),
    others: others.map((e) => rowFor(e, 'other', owned)).sort(order),
  };
}
