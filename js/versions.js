// The user's own versions of a suggested deck: data model, storage and deck-rule warnings. Pure apart from storage.
import { MAX_COPIES } from './collection.js';

// Limits seen in every one of the 830 recent top decks. The banlist is NOT checked: our data has no Speed banlist.
export const RULES = { mainMin: 20, mainMax: 30, extraMax: 9, maxCopies: MAX_COPIES };
const KEY = 'duel-links-coach-versions-v1';
const MAX_NAME = 60;
const DEFAULT_NAME = 'My version';

const store = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

// A stored or imported version could hold thousands of cards; keep it to what any section could sensibly hold
// (real decks: 30 main, 9 Extra), dropping the rest in order, so a broken list cannot slow every page down.
const MAX_NAMES = 60;
const MAX_SECTION_COPIES = 90;

const cleanEntries = (list) => {
  const merged = new Map();
  let total = 0;
  for (const e of Array.isArray(list) ? list : []) {
    if (!e || typeof e.name !== 'string' || !e.name || !Number.isInteger(e.count) || e.count <= 0) continue;
    if (!merged.has(e.name) && merged.size >= MAX_NAMES) continue;
    const had = merged.get(e.name) ?? 0;
    const add = Math.min(had + e.count, MAX_COPIES) - had;
    const take = Math.min(add, MAX_SECTION_COPIES - total);
    if (take <= 0) continue;
    merged.set(e.name, had + take);
    total += take;
  }
  return [...merged].map(([name, count]) => ({ name, count }));
};

const cleanName = (name) => String(name ?? '').trim().slice(0, MAX_NAME) || DEFAULT_NAME;

const cleanVersion = (v) =>
  v && typeof v === 'object' && typeof v.id === 'string' && v.id && typeof v.name === 'string'
    ? { id: v.id, name: cleanName(v.name), baseId: typeof v.baseId === 'string' ? v.baseId : null, main: cleanEntries(v.main), extra: cleanEntries(v.extra), updated: typeof v.updated === 'string' ? v.updated : '' }
    : null;

// Deck keys that would reach Object.prototype (or look like it) instead of being plain data.
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Untrusted data in (storage or an imported file), clean data out: { deckSlug: [version, ...] }.
// Within a deck, a version whose id was already seen is dropped (the first one wins).
export function cleanVersions(raw) {
  const out = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [slug, list] of Object.entries(raw)) {
      if (UNSAFE_KEYS.has(slug) || !Array.isArray(list)) continue;
      const seen = new Set();
      const versions = list.map(cleanVersion).filter((v) => v && !seen.has(v.id) && seen.add(v.id));
      if (versions.length) out[slug] = versions;
    }
  }
  return out;
}

export function loadVersions(storage = store()) {
  try {
    return cleanVersions(JSON.parse(storage.getItem(KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function saveVersions(all, storage = store()) {
  try {
    storage.setItem(KEY, JSON.stringify(cleanVersions(all)));
    return true;
  } catch {
    return false;
  }
}

export const newId = (now = new Date(), rnd = Math.random) => `v${now.getTime().toString(36)}${Math.floor(rnd() * 1e6).toString(36)}`;

const copyEntries = (entries) => entries.map(({ name, count }) => ({ name, count }));

export function createVersion(list, name, { now = new Date(), id = newId(now) } = {}) {
  return { id, name: cleanName(name), baseId: list.id ?? null, main: copyEntries(list.main ?? []), extra: copyEntries(list.extra ?? []), updated: now.toISOString() };
}

export const duplicateVersion = (v, { name, id, now = new Date() } = {}) => ({
  ...v, id: id ?? newId(now), name: cleanName(name ?? `${v.name} copy`), main: copyEntries(v.main), extra: copyEntries(v.extra), updated: now.toISOString(),
});

export const renameVersion = (v, name, now = new Date()) => ({ ...v, name: cleanName(name), updated: now.toISOString() });

// Set how many copies of a card a version plays in a section ('main' or 'extra'): 0 removes it, 1 to 3 sets it.
export function setCardCount(v, section, name, count, now = new Date()) {
  const n = Math.max(0, Math.min(MAX_COPIES, count));
  const entries = copyEntries(v[section]);
  const at = entries.findIndex((e) => e.name === name);
  if (at >= 0) {
    if (n === 0) entries.splice(at, 1);
    else entries[at].count = n;
  } else if (n > 0) entries.push({ name, count: n });
  return { ...v, [section]: entries, updated: now.toISOString() };
}

export const addCard = (v, section, name, now = new Date()) =>
  setCardCount(v, section, name, (v[section].find((e) => e.name === name)?.count ?? 0) + 1, now);

export function upsertVersion(all, slug, version) {
  const list = [...(all[slug] ?? [])];
  const at = list.findIndex((v) => v.id === version.id);
  if (at >= 0) list[at] = version;
  else list.push(version);
  return { ...all, [slug]: list };
}

export function deleteVersion(all, slug, id) {
  const list = (all[slug] ?? []).filter((v) => v.id !== id);
  const next = { ...all };
  if (list.length) next[slug] = list;
  else delete next[slug];
  return next;
}

export const sectionTotal = (entries) => (entries ?? []).reduce((n, e) => n + e.count, 0);

// Rules shown as warnings. Nothing here blocks the user from building or comparing.
export function validateVersion(v) {
  const warnings = [];
  const main = sectionTotal(v.main);
  const extra = sectionTotal(v.extra);
  if (main < RULES.mainMin) warnings.push({ code: 'main-small', text: `The main deck has ${main} cards. Duel Links Speed decks play ${RULES.mainMin} to ${RULES.mainMax}.` });
  if (main > RULES.mainMax) warnings.push({ code: 'main-large', text: `The main deck has ${main} cards. Duel Links Speed decks play ${RULES.mainMin} to ${RULES.mainMax}.` });
  if (extra > RULES.extraMax) warnings.push({ code: 'extra-large', text: `The Extra Deck has ${extra} cards. The most Speed decks play is ${RULES.extraMax}.` });
  const per = new Map();
  for (const e of [...(v.main ?? []), ...(v.extra ?? [])]) per.set(e.name, (per.get(e.name) ?? 0) + e.count);
  for (const [name, n] of per) {
    if (n > RULES.maxCopies) warnings.push({ code: 'copies', text: `${name}: ${n} copies, the limit is ${RULES.maxCopies}.` });
  }
  return warnings;
}
