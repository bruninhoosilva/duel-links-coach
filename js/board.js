// The table, as a beginner would draw it. Pure functions only: this file is imported by the guide
// validator (Node) and by the site (browser).

export const ZONES = [
  'hand', 'deck', 'extra-deck', 'graveyard', 'banished',
  'monster-zone', 'extra-monster-zone', 'spell-trap-zone', 'overlay',
];

export const ZONE_LABELS = {
  hand: 'Hand',
  deck: 'Deck',
  'extra-deck': 'Extra Deck',
  graveyard: 'Graveyard',
  banished: 'Banished',
  'monster-zone': 'Monster zone',
  'extra-monster-zone': 'Extra Monster Zone',
  'spell-trap-zone': 'Spell/Trap zone',
  overlay: 'Xyz material',
};

// A card the player draws or is given without us knowing which one.
export const UNKNOWN_CARD = 'Unknown card';

const CAPACITY = { 'monster-zone': 5, 'extra-monster-zone': 2, 'spell-trap-zone': 5 };
const FIELD = ['monster-zone', 'extra-monster-zone'];
// The contents of these piles are not listed: cards can leave them freely and disappear into them.
const UNTRACKED = new Set(['deck', 'extra-deck']);
const START_ZONES = ['hand', 'graveyard', 'banished', 'monster-zone', 'extra-monster-zone', 'spell-trap-zone'];

export function startState(start = {}) {
  const state = { overlay: {} };
  for (const zone of START_ZONES) state[zone] = [...(start[zone] ?? [])];
  return state;
}

function cloneState(state) {
  const copy = { overlay: {} };
  for (const zone of START_ZONES) copy[zone] = [...state[zone]];
  for (const [under, cards] of Object.entries(state.overlay)) copy.overlay[under] = [...cards];
  return copy;
}

const onField = (state, name) => FIELD.some((zone) => state[zone].includes(name));

// Applies one move in place. Every check happens before anything changes, so a rejected move leaves
// the state untouched. Returns an error message, or null.
function applyMove(state, move) {
  const { card, from, to, under } = move;
  if (!ZONES.includes(from)) return `unknown zone "${from}"`;
  if (!ZONES.includes(to)) return `unknown zone "${to}"`;
  if ((from === 'overlay' || to === 'overlay') && !under) return '"under" is required when a card moves to or from the materials';

  let source = null;
  let at = -1;
  if (!UNTRACKED.has(from)) {
    source = from === 'overlay' ? state.overlay[under] : state[from];
    at = source ? source.indexOf(card) : -1;
    if (at < 0) return `"${card}" is not in ${from === 'overlay' ? `the materials of ${under}` : ZONE_LABELS[from]}`;
  }
  if (to === 'overlay' && !onField(state, under)) return `${under} is not on the field, so it cannot hold materials`;
  if (CAPACITY[to] && !UNTRACKED.has(to) && state[to].length >= CAPACITY[to]) return `${ZONE_LABELS[to]} is full (${CAPACITY[to]})`;
  if (FIELD.includes(from) && state.overlay[card]?.length) return `"${card}" still has materials: detach them first`;

  if (source) {
    source.splice(at, 1);
    if (from === 'overlay' && source.length === 0) delete state.overlay[under];
  }
  if (to === 'overlay') (state.overlay[under] ??= []).push(card);
  else if (!UNTRACKED.has(to)) state[to].push(card);
  return null;
}

export function applyMoves(state, moves = []) {
  const next = cloneState(state);
  const errors = [];
  moves.forEach((move, i) => {
    const problem = applyMove(next, move);
    if (problem) errors.push(`moves[${i}]: ${problem}`);
  });
  return { state: next, errors };
}

// states[0] is the start; states[i] is the table after step i. Errors name the step.
export function simulateScenario(scenario) {
  const states = [startState(scenario.start)];
  const errors = [];
  (scenario.steps ?? []).forEach((step, i) => {
    const { state, errors: stepErrors } = applyMoves(states[i], step.moves ?? []);
    states.push(state);
    for (const e of stepErrors) errors.push(`steps[${i}].${e}`);
  });
  return { states, errors };
}
