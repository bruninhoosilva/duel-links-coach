export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// "Build 2 (Name of the video)": how a guide built from several videos names each build (index counts from 0).
export const buildName = (index, video) => `Build ${index + 1} (${video.title ?? video.creator ?? 'video'})`;

export function parseTimestamp(text) {
  const parts = String(text).trim().split(':').map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !Number.isFinite(p) || p < 0)) return null;
  return parts.reduce((total, p) => total * 60 + p, 0);
}

export function timeLink(url, timestamp) {
  const seconds = parseTimestamp(timestamp);
  if (seconds === null) return url;
  const link = new URL(url);
  link.searchParams.set('t', `${seconds}s`);
  return link.toString();
}

export const ROLE_ORDER = ['starter', 'extender', 'payoff', 'removal', 'hand-trap'];
export const ROLE_LABELS = {
  starter: 'Starters',
  extender: 'Extenders',
  payoff: 'Payoffs',
  removal: 'Removal and interaction',
  'hand-trap': 'Hand traps',
};
export const ROLE_HELP = {
  starter: 'Cards that get your combo going, such as the Tuners that switch the skill on.',
  extender: 'Cards that give you extra summons once you have started.',
  payoff: 'Cards that make the board that wins or protects you.',
  removal: 'Cards that remove, negate or slow down what the opponent has.',
  'hand-trap': "Cards you play from your hand on the opponent's turn to interrupt them.",
};
export const ACTION_LABELS = {
  'normal-summon': 'Normal Summon',
  'special-summon': 'Special Summon',
  set: 'Set',
  activate: 'Activate',
  chain: 'Chain',
  attack: 'Attack',
};

export const cardButton = (name, label = name) =>
  `<button type="button" class="card-link" data-card="${esc(name)}">${esc(label)}</button>`;

// One line per way to get a card, from the card's `obtain` list.
export function describeObtain(o) {
  const link = (text) => (o.url ? `<a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>` : esc(text));
  if (o.kind === 'set') return `${link(o.name)}${o.boxType ? ` (${esc(o.boxType)})` : ''}${o.amount ? `, ${esc(o.amount)} cop${o.amount === 1 ? "y" : "ies"} in the set` : ''}`;
  if (o.kind === 'character') return `Reward for beating ${link(o.name)}${o.level ? ` (${esc(o.level)})` : ''}`;
  return esc(o.name);
}

// How to get a skill: where it is traded for, and which characters give it.
export function describeSkillSource(skill) {
  if (!skill) return '';
  const parts = [];
  if (skill.source) parts.push(esc(skill.source));
  const how = [...new Set((skill.characters ?? []).map((c) => c.name).filter(Boolean))];
  if (how.length) parts.push(`from ${how.slice(0, 6).map(esc).join(', ')}${how.length > 6 ? ` and ${how.length - 6} more` : ''}`);
  return parts.join(', ');
}
