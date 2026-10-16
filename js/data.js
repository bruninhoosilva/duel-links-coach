import { buildSearchIndex } from './card-search.js';

// Loads the JSON files the build script wrote into site/data/.
export async function loadData(base = 'data/') {
  const names = ['index', 'guides', 'cards', 'skills', 'decklists'];
  const parts = await Promise.all(
    names.map(async (name) => {
      const res = await fetch(`${base}${name}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`${name}.json: HTTP ${res.status}`);
      return res.json();
    }),
  );
  return Object.fromEntries(names.map((name, i) => [name, parts[i]]));
}

// Loaded only when "My collection", "What can I build?" or a deck without a guide is opened.
export async function loadExtra(base = 'data/') {
  const names = ['allcards', 'otherdecks', 'extracards'];
  const parts = await Promise.all(
    names.map(async (name) => {
      const res = await fetch(`${base}${name}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`${name}.json: HTTP ${res.status}`);
      return res.json();
    }),
  );
  const [allcards, otherdecks, extracards] = parts;
  return { searchIndex: buildSearchIndex(allcards), otherdecks, extracards };
}
