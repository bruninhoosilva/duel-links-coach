// Compares a user's version of a deck with the list the guide suggests. Pure functions, no DOM.
// Everything it says comes from the guide (roles, notes, swaps, play-guide steps, skill enabler cards) or is
// computed (opening odds). For a card the guide never mentions it says so, and does not guess.
import { MAX_ODDS_DECK, deckNames, handSizeFor, isHandRequirement, openingOdds } from './odds.js';
import { validateVersion } from './versions.js';

const ROLES = ['starter', 'extender', 'payoff', 'removal', 'hand-trap'];
export const ROLE_NAMES = { starter: 'starters', extender: 'extenders', payoff: 'payoffs', removal: 'removal', 'hand-trap': 'hand traps', other: 'other cards' };
const ROLE_ONE = { starter: 'starter', extender: 'extender', payoff: 'payoff', removal: 'removal card', 'hand-trap': 'hand trap' };
const ODDS_CHANGE = 0.03; // a change of 3 points or more is worth a statement

const pct = (x) => `${Math.round(x * 100)}%`;
const copies = (n) => `${n} ${n === 1 ? 'copy' : 'copies'}`;
const allEntries = (x) => [...(x.main ?? []), ...(x.extra ?? [])];

function totals(list) {
  const m = new Map();
  for (const e of allEntries(list)) m.set(e.name, (m.get(e.name) ?? 0) + e.count);
  return m;
}

// Cards played in fewer copies (removed) and in more copies (added), by name, main and Extra Deck together.
export function diffLists(base, version) {
  const a = totals(base);
  const b = totals(version);
  const removed = [];
  const added = [];
  for (const name of new Set([...a.keys(), ...b.keys()])) {
    const from = a.get(name) ?? 0;
    const to = b.get(name) ?? 0;
    if (to < from) removed.push({ name, count: from - to, from, to });
    else if (to > from) added.push({ name, count: to - from, from, to });
  }
  const byName = (x, y) => x.name.localeCompare(y.name);
  return { removed: removed.sort(byName), added: added.sort(byName) };
}

// Every card of either list -> { base, mine }: its total copies (main + Extra Deck) in the base list and in the version.
export function cardDeltas(base, version) {
  const a = totals(base ?? {});
  const b = totals(version ?? {});
  const out = new Map();
  for (const name of new Set([...a.keys(), ...b.keys()])) out.set(name, { base: a.get(name) ?? 0, mine: b.get(name) ?? 0 });
  return out;
}

// entries: [{ name, count }]; roleOf: Map name -> role. Cards the guide does not cover count as "other".
export function roleCounts(entries, roleOf) {
  const out = Object.fromEntries([...ROLES, 'other'].map((r) => [r, 0]));
  for (const e of entries) out[ROLES.includes(roleOf.get(e.name)) ? roleOf.get(e.name) : 'other'] += e.count;
  return out;
}

// The play-guide steps (1-based) that use or move a card.
export function usedIn(guide, name) {
  const out = [];
  for (const sc of guide.scenarios ?? []) {
    const steps = [];
    (sc.steps ?? []).forEach((st, i) => {
      if (st.card === name || (st.moves ?? []).some((m) => m.card === name)) steps.push(i + 1);
    });
    if (steps.length) out.push({ scenarioId: sc.id, title: sc.title, steps });
  }
  return out;
}

export function compareVersion({ guide, baseList, version, owned = {}, isExtra = () => false }) {
  const roleOf = new Map((guide.cards ?? []).map((c) => [c.name, c.role]));
  const noteOf = new Map((guide.cards ?? []).map((c) => [c.name, c.note ?? '']));
  const subsOf = new Map((guide.cards ?? []).map((c) => [c.name, c.substitutes ?? []]));
  const diff = diffLists(baseList, version);
  const statements = [];
  const say = (kind, topic, text) => statements.push({ kind, topic, text });

  // 1. Swaps the guide itself suggests. A swap uses up as many copies as both sides have; what is left over of
  // the removed or the added card is reported below like any other change.
  const leftRemoved = new Map(diff.removed.map((r) => [r.name, r.count]));
  const leftAdded = new Map(diff.added.map((a) => [a.name, a.count]));
  const roleMoves = []; // swapped-in copies of a card without a role count in the role of the card they replace
  for (const r of diff.removed) {
    for (const a of diff.added) {
      const sub = (subsOf.get(r.name) ?? []).find((s) => s.name === a.name);
      const n = Math.min(leftRemoved.get(r.name), leftAdded.get(a.name));
      if (!sub || n === 0) continue;
      say('pro', 'swap', `You replace ${r.name} with ${a.name}${n > 1 ? ` (${copies(n)})` : ''}, a swap the guide suggests: ${sub.why}`);
      leftRemoved.set(r.name, leftRemoved.get(r.name) - n);
      leftAdded.set(a.name, leftAdded.get(a.name) - n);
      if (!roleOf.get(a.name) && ROLES.includes(roleOf.get(r.name))) roleMoves.push({ role: roleOf.get(r.name), count: n });
      if (leftRemoved.get(r.name) === 0) break;
    }
  }

  // 2. Cards you play fewer copies of (beyond the copies a swap replaces).
  for (const r0 of diff.removed) {
    if (leftRemoved.get(r0.name) === 0) continue;
    const r = { ...r0, count: leftRemoved.get(r0.name) };
    const role = roleOf.get(r.name);
    const used = usedIn(guide, r.name);
    const where = used.map((u) => `"${u.title}" (step${u.steps.length === 1 ? '' : 's'} ${u.steps.join(', ')})`).join('; ');
    const steps = used.reduce((n, u) => n + u.steps.length, 0) === 1 ? 'that step' : 'those steps';
    // A card the skill adds to the deck is still there without the copies you removed.
    const skillAdds = !role && used.length > 0 && (guide.skill?.adds ?? []).some((x) => x.card === r.name);
    const gone = r.to === 0 && !skillAdds;
    let label = '';
    if (role) label = ` (${ROLE_ONE[role] ?? role})`;
    else if (skillAdds) label = ' (the skill adds it to your deck anyway)';
    else if (!used.length) label = ' (not covered by the guide)';
    let text = `You play ${copies(r.count)} fewer of ${r.name}${label}.`;
    if (used.length === 1) text += gone ? ` The guide's ${where} uses it, and without it you must change ${steps}.` : ` The guide's ${where} uses it.`;
    else if (used.length > 1) text += ` It is used in: ${where}.${gone ? ` Without it you must change ${steps}.` : ''}`;
    say(role || (used.length && !skillAdds) ? 'con' : 'note', 'removed', text);
  }

  // 3. Cards you play more copies of.
  for (const a0 of diff.added) {
    if (leftAdded.get(a0.name) === 0) continue;
    const a = { ...a0, count: leftAdded.get(a0.name) };
    const role = roleOf.get(a.name);
    if (role) {
      const note = noteOf.get(a.name);
      say('pro', 'added', `You add ${a.name} (${ROLE_ONE[role] ?? role}), ${copies(a.count)}.${note ? ` ${note}` : ''}`);
    } else {
      const swapFor = (guide.cards ?? []).find((c) => (c.substitutes ?? []).some((x) => x.name === a.name));
      if (swapFor) {
        const why = swapFor.substitutes.find((x) => x.name === a.name).why;
        say('note', 'added', `You add ${a.name}, which the guide lists as a swap for ${swapFor.name}: ${why}`);
      } else say('note', 'added', `You add ${a.name}, which this guide does not cover, so we cannot say what it does for the deck.`);
    }
  }

  // 4. Role totals. Only the swapped copies take over a role; other copies of the same card stay "other".
  const roles = { base: roleCounts(allEntries(baseList), roleOf), mine: roleCounts(allEntries(version), roleOf) };
  for (const { role, count } of roleMoves) {
    roles.mine[role] += count;
    roles.mine.other -= count;
  }
  for (const role of ROLES) {
    const b = roles.base[role];
    const m = roles.mine[role];
    if (m !== b) say(m < b ? 'con' : 'pro', 'roles', `${ROLE_NAMES[role]}: ${b} → ${m}`);
  }

  // 5. The skill's enabler cards.
  const enablers = guide.skill?.enablerCards ?? [];
  if (enablers.length) {
    const count = (x) => allEntries(x).filter((e) => enablers.includes(e.name)).reduce((n, e) => n + e.count, 0);
    const b = count(baseList);
    const m = count(version);
    // Name only the enabler cards one of the two lists plays; the guide may list cards neither list uses.
    const played = new Set([...totals(baseList).keys(), ...totals(version).keys()]);
    const shown = enablers.filter((n) => played.has(n)).join(', ');
    if (shown && m < b) say('con', 'skill', `${guide.skill.name} starts from ${shown}: you play ${m} (the guide's list plays ${b}), so it switches on less often.`);
    else if (shown && m > b) say('pro', 'skill', `${guide.skill.name} starts from ${shown}: you play ${m} (the guide's list plays ${b}), so it switches on more often.`);
  }

  // 6. Opening odds for every line that starts from a hand.
  const odds = [];
  const mainSize = (x) => (x.main ?? []).reduce((n, e) => n + e.count, 0);
  const smaller = mainSize(version) < mainSize(baseList);
  const larger = mainSize(version) > mainSize(baseList);
  const baseDeck = deckNames(baseList, guide, isExtra);
  const myDeck = deckNames(version, guide, isExtra);
  let tooBig = false;
  for (const sc of guide.scenarios ?? []) {
    if (!isHandRequirement(sc.requires)) continue;
    const size = handSizeFor(sc.requires);
    const b = openingOdds(baseDeck, sc.requires, size);
    const m = openingOdds(myDeck, sc.requires, size);
    if (b === null || m === null) {
      if (myDeck.length > MAX_ODDS_DECK) tooBig = true;
      continue;
    }
    const without = (sc.requires.without ?? []).map((w) => w.label);
    odds.push({ id: sc.id, title: sc.title, handSize: size, base: b, mine: m, delta: m - b, without });
    // A line that only applies when you do NOT hold some card is a fallback: when its chance goes up you just
    // lose the better line, and when it goes down you play the better line instead. Neither is worth a statement;
    // the row stays in the odds table with its "only when you do not hold" note.
    if (without.length) continue;
    if (Math.abs(m - b) >= ODDS_CHANGE) {
      let why = '';
      if (m > b && smaller) why = ' Part of this comes from playing fewer cards, so each card shows up more often.';
      else if (m < b && larger) why = ' Part of this comes from playing more cards, so each card shows up less often.';
      say(m < b ? 'con' : 'pro', 'odds', `"${sc.title}": you can start it in ${pct(m)} of opening hands, the guide's list in ${pct(b)}.${why}`);
    }
  }
  if (tooBig) say('note', 'odds', 'Your version has too many cards to count the opening chances exactly.');

  // 7. Ownership.
  const mineTotals = totals(version);
  let missingCopies = 0;
  let totalCopies = 0;
  let unknownCards = 0;
  for (const [name, n] of mineTotals) {
    totalCopies += n;
    missingCopies += n - Math.min(Object.hasOwn(owned, name) ? owned[name] : 0, n);
    if (!Object.hasOwn(owned, name)) unknownCards++;
  }
  const ownership = { missingCopies, totalCopies, unknownCards };
  if (Object.keys(owned).length > 0 && missingCopies > 0) {
    say('note', 'owned', `You are missing ${copies(missingCopies)} of ${totalCopies} in this version${unknownCards ? ` (${unknownCards} ${unknownCards === 1 ? 'card is' : 'cards are'} not marked yet in your collection)` : ''}.`);
  }

  return { diff, roles, odds, statements, ownership, warnings: validateVersion(version) };
}
