export const TABS = ['overview', 'lists', 'cards', 'synergies', 'options', 'play', 'picker'];

export function parseRoute(hash) {
  const path = String(hash ?? '').replace(/^#\/?/, '').split('?')[0];
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { name: 'decks' };
  if (parts[0] === 'glossary') return { name: 'glossary' };
  if (parts[0] === 'collection') return { name: 'collection' };
  if (parts[0] === 'build') return { name: 'build' };
  if (parts[0] === 'list' && parts[1]) return { name: 'other', slug: parts[1] };
  if (parts[0] === 'deck' && parts[1]) {
    return { name: 'deck', slug: parts[1], tab: TABS.includes(parts[2]) ? parts[2] : 'overview', anchor: TABS.includes(parts[2]) ? parts[3] ?? null : null };
  }
  return { name: 'notfound' };
}

export const deckHref = (slug, tab = 'overview', anchor = null) =>
  `#/deck/${encodeURIComponent(slug)}/${tab}${anchor ? `/${encodeURIComponent(anchor)}` : ''}`;
