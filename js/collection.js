// The cards you own and how many copies. Kept only in this browser (localStorage); nothing is sent anywhere.
export const MAX_COPIES = 3;
const KEY = 'duel-links-coach-collection-v1';

const clean = (raw) => {
  const out = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [name, n] of Object.entries(raw)) {
      if (Number.isInteger(n) && n > 0) out[name] = Math.min(n, MAX_COPIES);
    }
  }
  return out;
};

// `storage` is injectable for tests; in the browser it is window.localStorage, which can be missing or throw.
export function loadCollection(storage = globalThis.localStorage) {
  try {
    return clean(JSON.parse(storage.getItem(KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function saveCollection(owned, storage = globalThis.localStorage) {
  try {
    storage.setItem(KEY, JSON.stringify(clean(owned)));
    return true;
  } catch {
    return false;
  }
}

// Change a card's count by delta (+1 or -1), clamped to 0..MAX_COPIES. Returns the new owned object.
export function changeOwned(owned, name, delta) {
  const next = { ...owned };
  const n = Math.max(0, Math.min(MAX_COPIES, (next[name] ?? 0) + delta));
  if (n === 0) delete next[name];
  else next[name] = n;
  return next;
}

// How much of a list you own: copies counted up to what the list needs.
export function listProgress(list, owned = {}) {
  const need = new Map();
  for (const e of [...(list?.main ?? []), ...(list?.extra ?? [])]) need.set(e.name, (need.get(e.name) ?? 0) + e.count);
  let cardsDone = 0;
  let copiesHave = 0;
  let copiesNeed = 0;
  for (const [name, n] of need) {
    const have = Math.min(owned[name] ?? 0, n);
    if (have >= n) cardsDone++;
    copiesHave += have;
    copiesNeed += n;
  }
  return { cards: need.size, cardsDone, copiesHave, copiesNeed };
}
