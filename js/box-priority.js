import { MAX_COPIES } from './collection.js';

// Which boxes are worth opening: the cards you are short of, counted for every guided deck that needs them,
// grouped by the packs that contain them. Only the creators' video lists count (the Meta lists are not
// the lists the guides teach). Cards you have not marked yet are left out, and reported per deck.
//
// ctx: { index, decklists, cards, owned }
export function boxPriority(ctx) {
  const owned = ctx.owned ?? {};
  const wanted = new Map(); // card name -> Map(deck name -> copies the deck plays, the most across its video lists)
  const unmarked = [];
  for (const d of ctx.index?.decks ?? []) {
    const data = ctx.decklists?.[d.slug];
    const lists = (data?.lists ?? []).filter((l) => l.video);
    const use = lists.length ? lists : (data?.lists ?? []).slice(0, 1);
    const plays = new Map();
    for (const l of use) for (const e of [...l.main, ...l.extra]) plays.set(e.name, Math.max(plays.get(e.name) ?? 0, e.count));
    const missingNames = [];
    for (const [name, count] of plays) {
      if (!Object.hasOwn(owned, name)) {
        missingNames.push(name);
        continue;
      }
      const short = count - Math.min(owned[name], MAX_COPIES, count);
      if (short <= 0) continue;
      if (!wanted.has(name)) wanted.set(name, new Map());
      wanted.get(name).set(d.name, { short, slug: d.slug });
    }
    if (missingNames.length) unmarked.push({ deck: d.name, slug: d.slug, names: missingNames.sort((a, b) => a.localeCompare(b)) });
  }

  const cardsShort = [...wanted].map(([name, decks]) => {
    const obtain = ctx.cards?.[name]?.obtain ?? [];
    return {
      name,
      decks: [...decks].map(([deck, v]) => ({ deck, slug: v.slug, short: v.short })),
      nDecks: decks.size,
      copies: [...decks.values()].reduce((n, v) => n + v.short, 0),
      obtain,
      boxes: [...new Set(obtain.filter((o) => o.kind === 'set').map((o) => o.name))],
    };
  });
  const byWants = (a, b) => b.nDecks - a.nDecks || b.copies - a.copies || a.name.localeCompare(b.name);
  cardsShort.sort(byWants);

  const boxes = new Map();
  for (const c of cardsShort) {
    for (const o of c.obtain) {
      if (o.kind !== 'set') continue;
      if (!boxes.has(o.name)) boxes.set(o.name, { name: o.name, type: o.boxType ?? '', url: o.url ?? null, cards: [], score: 0, copies: 0, decks: new Set() });
      const b = boxes.get(o.name);
      if (b.cards.includes(c)) continue;
      b.cards.push(c);
      b.score += c.nDecks;
      b.copies += c.copies;
      for (const d of c.decks) b.decks.add(d.deck);
    }
  }
  const ranked = [...boxes.values()]
    .map((b) => ({ ...b, decks: [...b.decks].sort(), cards: b.cards.sort(byWants) }))
    .sort((a, b) => b.score - a.score || b.copies - a.copies || a.name.localeCompare(b.name));

  return { boxes: ranked, noBox: cardsShort.filter((c) => c.boxes.length === 0), cardsShort, unmarked };
}
