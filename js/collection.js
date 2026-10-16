// The cards you own and how many copies. Kept only in this browser (localStorage); nothing is sent anywhere.
// A card that is ABSENT has not been marked yet. A card with 0 was marked as "I own none". That difference lets
// the rest of the site say "not marked yet" instead of wrongly assuming you do not own it.
export const MAX_COPIES = 3;
const KEY = 'duel-links-coach-collection-v1';

const clean = (raw) => {
  const out = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [name, n] of Object.entries(raw)) {
      if (Number.isInteger(n) && n >= 0) out[name] = Math.min(n, MAX_COPIES);
    }
  }
  return out;
};

// `storage` is injectable for tests; in the browser it is window.localStorage, which can be missing, and just
// reading it throws when site data is blocked. store() guards that read, so a default parameter never throws.
const store = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

export function loadCollection(storage = store()) {
  if (!storage) return {};
  try {
    return clean(JSON.parse(storage.getItem(KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function saveCollection(owned, storage = store()) {
  if (!storage) return false;
  try {
    storage.setItem(KEY, JSON.stringify(clean(owned)));
    return true;
  } catch {
    return false;
  }
}

// The status line to show after a save: nothing when it worked, a warning when the browser refused to store it.
export const saveWarning = (ok) =>
  ok ? '' : 'Could not save in this browser, so your cards will be lost when you close this page. Use Export my collection to keep them.';

export const isChecked =(owned, name) => Object.hasOwn(owned ?? {}, name);

// Change a card's count by delta (+1 or -1), clamped to 0..MAX_COPIES. A card that reaches 0 stays marked.
export function changeOwned(owned, name, delta) {
  const next = { ...owned };
  next[name] = Math.max(0, Math.min(MAX_COPIES, (next[name] ?? 0) + delta));
  return next;
}

// Mark every card in `names` that is not marked yet as "I own none".
export function checkRest(owned, names) {
  const next = { ...owned };
  for (const name of names) if (!isChecked(next, name)) next[name] = 0;
  return next;
}

// Take a card back to "not marked yet".
export function forgetCard(owned, name) {
  const next = { ...owned };
  delete next[name];
  return next;
}

// How much of a list you own: copies counted up to what the list needs; `unknown` = cards not marked yet.
export function listProgress(list, owned = {}) {
  const need = new Map();
  for (const e of [...(list?.main ?? []), ...(list?.extra ?? [])]) need.set(e.name, (need.get(e.name) ?? 0) + e.count);
  let cardsDone = 0;
  let copiesHave = 0;
  let copiesNeed = 0;
  let unknown = 0;
  for (const [name, n] of need) {
    const have = Math.min(owned[name] ?? 0, n);
    if (have >= n) cardsDone++;
    if (!isChecked(owned, name)) unknown++;
    copiesHave += have;
    copiesNeed += n;
  }
  return { cards: need.size, cardsDone, copiesHave, copiesNeed, unknown };
}

// A small file you can save and load on another device. `versions` (your deck versions) is optional.
export function exportCollection(owned, versions = {}) {
  const file = { app: 'duel-links-coach', version: 1, owned: clean(owned) };
  if (versions && Object.keys(versions).length > 0) file.versions = versions;
  return JSON.stringify(file, null, 2);
}

// Read an exported file. Returns { ok: true, owned, versions } (versions is the raw object or null; the caller
// cleans it) or { ok: false, error }.
export function parseCollection(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not a collection file (it is not valid JSON).' };
  }
  if (!data || typeof data !== 'object' || data.app !== 'duel-links-coach' || typeof data.owned !== 'object' || data.owned === null) {
    return { ok: false, error: 'That file was not exported from Duel Links Coach.' };
  }
  const versions = data.versions && typeof data.versions === 'object' && !Array.isArray(data.versions) ? data.versions : null;
  return { ok: true, owned: clean(data.owned), versions };
}

// ---- Backup bookkeeping and persistence ----
const META_KEY = 'duel-links-coach-backup-v1';
const NUDGE_AFTER = 15;

export function loadBackupMeta(storage = store()) {
  if (!storage) return { lastExport: null, changes: 0 };
  try {
    const raw = JSON.parse(storage.getItem(META_KEY) ?? '{}');
    return { lastExport: typeof raw.lastExport === 'string' ? raw.lastExport : null, changes: Number.isInteger(raw.changes) && raw.changes > 0 ? raw.changes : 0 };
  } catch {
    return { lastExport: null, changes: 0 };
  }
}

const saveMeta = (meta, storage) => {
  try {
    storage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // storage unavailable: the nudge simply never shows
  }
};

export function noteChange(storage = store()) {
  if (!storage) return;
  const meta = loadBackupMeta(storage);
  saveMeta({ ...meta, changes: meta.changes + 1 }, storage);
}

export function noteExport(storage = store(), now = new Date()) {
  if (!storage) return;
  saveMeta({ lastExport: now.toISOString(), changes: 0 }, storage);
}

// A one-line reminder, or null when there is nothing to say yet.
export function backupNudge(meta) {
  if (!meta || meta.changes < NUDGE_AFTER) return null;
  if (!meta.lastExport) {
    return `You have marked cards but have not backed up yet. Use "Export my collection" so you can restore it if this browser ever clears its data.`;
  }
  return `You made ${meta.changes} changes since your last backup on ${meta.lastExport.slice(0, 10)}. Use "Export my collection" to save a new copy.`;
}

// Ask the browser not to clear this site's storage. Returns true if it agreed; never throws.
export async function requestPersistence(nav = globalThis.navigator) {
  try {
    if (nav?.storage?.persist) return Boolean(await nav.storage.persist());
  } catch {
    // fall through
  }
  return false;
}

// ---- Plain-words messages for export and import ----
// Cards you own (1 or more copies), their copies, and cards you marked as "I own none".
export function collectionCounts(owned) {
  let owns = 0;
  let copies = 0;
  let none = 0;
  for (const n of Object.values(owned ?? {})) {
    if (n > 0) {
      owns++;
      copies += n;
    } else none++;
  }
  return { owns, copies, none };
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function describeCounts({ owns, copies, none }) {
  const parts = [`${plural(owns, 'card', 'cards')} you own (${plural(copies, 'copy', 'copies')})`];
  if (none) parts.push(`${plural(none, 'card', 'cards')} marked as not owned`);
  return parts.join(' and ');
}

const countVersions = (versions) => Object.values(versions ?? {}).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0);
const versionsPart = (versions) => {
  const n = countVersions(versions);
  return n ? ` and ${plural(n, 'version', 'versions')} of your decks` : '';
};

export const exportMessage = (owned, versions) =>
  `Saved duel-links-collection.json with ${describeCounts(collectionCounts(owned))}${versionsPart(versions)}. Keep the file somewhere safe: "Import a collection" loads it again, on this device or another.`;

export const importMessage = (owned, versions) =>
  `Imported ${describeCounts(collectionCounts(owned))}${versionsPart(versions)}. This replaced what you had before.`;
