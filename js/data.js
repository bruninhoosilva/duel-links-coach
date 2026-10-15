// Loads the four JSON files the build script wrote into site/data/.
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
