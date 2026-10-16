// Moving between the cards that sit side by side, from inside the card pop-up. Pure helpers: no DOM.

// Next index after moving `delta` steps in a ring of `total` cards.
export const stepIndex = (index, total, delta) => (((index + delta) % total) + total) % total;

// Card names in the order they first appear, without repeats or empty names.
export function uniqueNames(names) {
  const seen = new Set();
  const out = [];
  for (const name of names) {
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}
