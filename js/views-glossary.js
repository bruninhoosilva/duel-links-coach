import { esc, slugify } from './dom.js';

// Plain-language definitions for a beginner. Keep each one short and true to how Duel Links plays.
export const TERMS = [
  { term: 'Skill', def: 'A special ability tied to your character. You activate it with the skill button, and each skill has its own conditions, for example once per turn. A deck guide only works with the skill it names.' },
  { term: 'Tuner', def: 'A monster that can be combined with one or more non-Tuner monsters for a Synchro Summon. In the Mathmech deck a Level 4 Tuner in your hand also switches the skill on.' },
  { term: 'Synchro Summon', def: 'Summon a Synchro monster from your Extra Deck by sending one Tuner and one or more other monsters you control to the Graveyard. Their Levels add up to the Synchro monster\'s Level.' },
  { term: 'Xyz Summon', def: 'Summon an Xyz monster from your Extra Deck by stacking monsters of the same Level underneath it. Those stacked monsters are its materials.' },
  { term: 'Link Summon', def: 'Summon a Link monster from your Extra Deck by using the monsters its text asks for. Link monsters have no Level; they have a Link number and arrows instead.' },
  { term: 'Detach', def: 'Take a material from underneath an Xyz monster and send it to the Graveyard, usually to pay for one of its effects.' },
  { term: 'Extra Deck', def: 'A separate pile of special monsters (Synchro, Xyz and Link) that you summon by using other monsters, not by drawing them.' },
  { term: 'Extra Monster Zone', def: 'The special monster zone where Extra Deck monsters usually appear when they are summoned. Some cards check whether it is empty or what is in it.' },
  { term: 'Graveyard', def: 'The pile where used or destroyed cards go. Many cards can bring monsters back from it. It is often shortened to GY.' },
  { term: 'Banish', def: 'Remove a card from the game. Banished cards cannot normally come back, so being banished is worse than being sent to the Graveyard.' },
  { term: 'Chain', def: 'When a card effect is activated, the opponent can respond with another one. The effects then resolve from the last one back to the first.' },
  { term: 'Quick Effect', def: 'An effect you are allowed to activate in response to the opponent, not only on your own turn.' },
  { term: 'Negate', def: 'Stop a card or effect from working. A negated effect does nothing.' },
  { term: 'Cyberse', def: 'A monster type. Every Mathmech monster is Cyberse, and some effects only work with Cyberse monsters.' },
  { term: 'Hand trap', def: 'A card you play from your hand during the opponent\'s turn to interrupt what they are doing, for example Effect Veiler.' },
  { term: 'Board breaker', def: 'A card that clears or weakens the opponent\'s monsters, spells and traps so you can attack.' },
  { term: 'Starter', def: 'A card that gets your combo going, such as a Tuner that switches the skill on.' },
  { term: 'Extender', def: 'A card that lets you make more summons once you have started, so your board grows.' },
  { term: 'Payoff', def: 'A card that makes the board that wins the duel or protects you.' },
  { term: 'Removal', def: 'A card that gets rid of, negates or slows down what the opponent has. Guides group this with other interaction.' },
  { term: 'Tier', def: 'Duel Links Meta ranks decks into tiers (tier 1 is the strongest). It is a rough guide to how common and strong a deck is right now.' },
];

export function renderGlossary() {
  const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));
  const items = sorted.map((t) => `<dt id="term-${esc(slugify(t.term))}">${esc(t.term)}</dt><dd>${esc(t.def)}</dd>`).join('');
  return `
    <section>
      <h1>Glossary</h1>
      <p class="lead">Short explanations of the words the guides use.</p>
      <dl class="glossary">${items}</dl>
    </section>`;
}
