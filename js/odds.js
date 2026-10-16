// Chance of an opening hand that can start a play line. Exact: every possible hand is counted. Pure functions.
import { handFits } from './match-hand.js';

// Yields every way to choose k indices from 0..n-1 in order. The SAME array is yielded each time (it is
// changed in place): read it before asking for the next one.
export function* combinations(n, k) {
  if (k < 1 || k > n) return;
  const idx = Array.from({ length: k }, (_, i) => i);
  while (true) {
    yield idx;
    let i = k - 1;
    while (i >= 0 && idx[i] === n - k + i) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

// Exact counting is meant for real decks: at most 30 main deck cards plus the few the skill adds (33 is the
// biggest we have seen). Past this size the number of hands grows so fast that a hostile or broken list
// could hang the page, so we do not count at all.
export const MAX_ODDS_DECK = 45;

// deck: one name per copy. Returns a number from 0 to 1, or null when no hand of that size can be drawn or
// the deck has more than MAX_ODDS_DECK cards.
export function openingOdds(deck, requires, handSize) {
  if (!Array.isArray(deck) || handSize < 1 || deck.length < handSize || deck.length > MAX_ODDS_DECK) return null;
  let hits = 0;
  let total = 0;
  for (const idx of combinations(deck.length, handSize)) {
    total++;
    if (handFits(requires, idx.map((i) => deck[i]))) hits++;
  }
  return hits / total;
}

// 4 cards to start; the player going second also draws on turn 1.
export const handSizeFor = (requires) => (requires?.turn === 'second' ? 5 : 4);

// Only lines that start from a hand have odds; a line that starts from a board does not.
export const isHandRequirement = (requires) => Boolean(requires) && !requires.board;

// The cards that can be drawn: the main deck, plus cards the skill adds to the deck (not Extra Deck cards).
export function deckNames(list, guide, isExtra = () => false) {
  const names = [];
  for (const e of list.main ?? []) for (let i = 0; i < e.count; i++) names.push(e.name);
  for (const a of guide?.skill?.adds ?? []) {
    if (isExtra(a.card)) continue;
    for (let i = 0; i < (a.copies ?? 0); i++) names.push(a.card);
  }
  return names;
}
