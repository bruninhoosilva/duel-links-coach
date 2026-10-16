// Search over every card name, in English or Portuguese. Pure functions.

// Lowercase, drop accents (combining marks) and punctuation, squeeze spaces.
export const fold = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

// rows: the site's allcards.json, [name, pt, rarity, type, image, extra] per card (image is '' when we have no picture; extra is 1 for Extra Deck cards).
export const buildSearchIndex = (rows) =>
  rows.map(([name, pt, rarity, type, image, extra]) => ({ name, pt: pt || null, rarity: rarity || null, type: type || null, image: image || null, extra: Boolean(extra), key: fold(name), ptKey: pt ? fold(pt) : '' }));

const rank = (c, q, words) => {
  const keys = [c.key, c.ptKey].filter(Boolean);
  if (keys.some((k) => k === q)) return 0;
  if (keys.some((k) => k.startsWith(q))) return 1;
  if (keys.some((k) => words.every((w) => k.includes(w)))) return keys.some((k) => k.includes(q)) ? 2 : 3;
  return null;
};

export function searchCards(index, query, limit = 30) {
  const q = fold(query);
  if (q.length < 2) return [];
  const words = q.split(' ');
  const hits = [];
  for (const c of index) {
    const r = rank(c, q, words);
    if (r !== null) hits.push({ c, r });
  }
  hits.sort((a, b) => a.r - b.r || a.c.name.length - b.c.name.length || a.c.name.localeCompare(b.c.name));
  return hits.slice(0, limit).map((h) => h.c);
}
