// Pure logic for the hand picker. Card names are the exact names used in the guide.
const holds = (hand, name) => hand.includes(name);

function check(requires, hand) {
  const r = requires ?? {};
  const missing = [];
  for (const name of r.hand ?? []) if (!holds(hand, name)) missing.push(name);
  for (const group of r.anyOf ?? []) if (!group.cards.some((c) => holds(hand, c))) missing.push(group.label);
  const blockedBy = [];
  for (const group of r.without ?? []) if (group.cards.some((c) => holds(hand, c))) blockedBy.push(group.label);
  return { missing, blockedBy };
}

// Does this hand satisfy a play line's requirement? (A line with a `board` requirement has no hand condition.)
export function handFits(requires, hand) {
  const { missing, blockedBy } = check(requires, hand);
  return missing.length === 0 && blockedBy.length === 0;
}

// matches: lines that fit the hand, most specific first.
// near: lines that do not fit, closest first, with what is missing or in the way.
// boards: lines that start from a board state; they are never matched from a hand.
export function matchScenarios(guide, hand, turn = 'first') {
  const matches = [];
  const near = [];
  const boards = [];
  const otherTurn = [];
  (guide.scenarios ?? []).forEach((scenario, order) => {
    const requires = scenario.requires ?? {};
    if (requires.turn && requires.turn !== turn) {
      otherTurn.push({ scenario, turn: requires.turn });
      return;
    }
    if (requires.board) {
      boards.push({ scenario, board: requires.board });
      return;
    }
    const { missing, blockedBy } = check(requires, hand);
    const specificity = (requires.hand?.length ?? 0) + (requires.anyOf?.length ?? 0) + (requires.without?.length ?? 0);
    if (missing.length === 0 && blockedBy.length === 0) matches.push({ scenario, order, specificity });
    else near.push({ scenario, order, missing, blockedBy, specificity });
  });
  matches.sort((a, b) => b.specificity - a.specificity || a.order - b.order);
  near.sort((a, b) => a.missing.length + a.blockedBy.length - (b.missing.length + b.blockedBy.length) || a.order - b.order);
  return { matches, near, boards, otherTurn };
}

export function skillStatus(guide, hand) {
  const enablers = guide.skill?.enablerCards ?? [];
  const inHand = enablers.filter((card) => holds(hand, card));
  if (Array.isArray(guide.skill?.enablerCards) && enablers.length === 0) return { ready: true, inHand, enablers, anyHand: true };
  return { ready: inHand.length > 0, inHand, enablers };
}

export const MAX_HAND = 5;
const EXTRA_DECK_TYPES = ['Xyz', 'Synchro', 'Link', 'Fusion'];

// Cards that can be in an opening hand: everything in the guide except Extra Deck monsters.
export function handPool(guide, cards = {}) {
  const names = [...new Set((guide.cards ?? []).map((c) => c.name))];
  return names.filter((n) => !(cards[n]?.monsterType ?? []).some((t) => EXTRA_DECK_TYPES.includes(t)));
}

export function copyLimit(guide, name) {
  return (guide.cards ?? []).find((c) => c.name === name)?.copies ?? 3;
}

export function canAdd(guide, hand, name) {
  return hand.length < MAX_HAND && hand.filter((n) => n === name).length < copyLimit(guide, name);
}

export const START_HAND = 4;

// A random opening hand from a deck list ({ main: [{ name, count }] }); rng returns a number in [0, 1).
export function dealHand(list, rng = Math.random, size = START_HAND) {
  const pile = (list?.main ?? []).flatMap((c) => Array(c.count).fill(c.name));
  for (let i = pile.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pile[i], pile[j]] = [pile[j], pile[i]];
  }
  return pile.slice(0, size);
}
