// Which deck lists the "Which box should I open?" page counts. Kept only in this browser (localStorage).
// A list is one version of a deck: a creator's video list ("Mathmech from YRalps") or a Meta tournament list.
//
// Without a choice, the creators' video lists count (a deck with no video list counts its first list), which is
// how the page worked before. What is stored is only what the reader changed from that default: { "slug|listId": true|false }.
// So a list added to the site later follows the default until the reader chooses.
const KEY = 'duel-links-coach-box-lists-v1';

const clean = (raw) => {
  const out = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw)) if (typeof v === 'boolean' && k.includes('|')) out[k] = v;
  }
  return out;
};

// `storage` is injectable for tests; in the browser it is window.localStorage, which can be missing or throw.
const store = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

export function loadListChoices(storage = store()) {
  if (!storage) return {};
  try {
    return clean(JSON.parse(storage.getItem(KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function saveListChoices(choices, storage = store()) {
  if (!storage) return false;
  try {
    storage.setItem(KEY, JSON.stringify(clean(choices)));
    return true;
  } catch {
    return false;
  }
}

export const listKey = (slug, id) => `${slug}|${id}`;

// Does this list count when the reader has not chosen? Video lists do; a deck that has none counts its first list.
export const countsByDefault = (data, list) => (list.video ? true : !(data?.lists ?? []).some((l) => l.video) && data?.lists?.[0] === list);

export function isListOn(choices, slug, data, list) {
  const key = listKey(slug, list.id);
  return Object.hasOwn(choices ?? {}, key) ? choices[key] : countsByDefault(data, list);
}

// The lists of one deck that count.
export const listsOn = (choices, slug, data) => (data?.lists ?? []).filter((l) => isListOn(choices, slug, data, l));

// Switch one list on or off. Returns a new object that only keeps what differs from the default.
export function toggleList(choices, slug, data, list) {
  const next = { ...choices };
  const key = listKey(slug, list.id);
  const want = !isListOn(choices, slug, data, list);
  if (want === countsByDefault(data, list)) delete next[key];
  else next[key] = want;
  return next;
}

// Presets: back to the default, every list on, or every list off.
export const defaultChoices = () => ({});
export function setAllLists(index, decklists, on) {
  const out = {};
  for (const d of index?.decks ?? []) {
    const data = decklists?.[d.slug];
    for (const l of data?.lists ?? []) if (on !== countsByDefault(data, l)) out[listKey(d.slug, l.id)] = on;
  }
  return out;
}

// The short name of a list ("YRalps", "Kumquat") and the longer one used on the filter chips.
export const listAuthor = (l) => l.author || 'Unknown';
export const listChipLabel = (l) => (l.video ? `From video · ${listAuthor(l)}` : [listAuthor(l), l.event, l.created].filter(Boolean).join(' · '));
