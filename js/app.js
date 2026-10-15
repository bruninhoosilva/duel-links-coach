import { loadData } from './data.js';
import { esc } from './dom.js';
import { parseRoute } from './router.js';
import { handleBoardClick } from './board-ui.js';
import { canAdd, dealHand } from './match-hand.js';
import { changeOwned, loadCollection, saveCollection } from './collection.js';
import { renderDeckList } from './views-deck-list.js';
import { renderDeckPage } from './views-deck.js';
import { renderGlossary } from './views-glossary.js';
import { renderCardDialog } from './card-dialog.js';

const app = document.getElementById('app');
const dialog = document.getElementById('card-dialog');
const hands = new Map(); // deck slug -> card names the user picked in the hand picker
let owned = loadCollection();
const turns = new Map(); // deck slug -> 'first' or 'second', chosen in the hand picker
const chosenLists = new Map(); // deck slug -> the deck list id chosen in the Deck lists tab
let data = null;
let currentSlug = null;

const handFor = (slug) => {
  if (!hands.has(slug)) hands.set(slug, []);
  return hands.get(slug);
};

function notFound() {
  return '<section><h1>Page not found</h1><p><a href="#/">Back to the decks</a></p></section>';
}

function render({ keepScroll = false } = {}) {
  const route = parseRoute(location.hash);
  const scroll = window.scrollY;
  currentSlug = null;
  let title = 'Duel Links Coach';

  if (route.name === 'decks') {
    app.innerHTML = renderDeckList(data.index);
  } else if (route.name === 'glossary') {
    app.innerHTML = renderGlossary();
    title = 'Glossary · Duel Links Coach';
  } else if (route.name === 'deck' && data.guides[route.slug]) {
    const guide = data.guides[route.slug];
    currentSlug = route.slug;
    app.innerHTML = renderDeckPage(guide, { ...data, owned }, route, handFor(route.slug), chosenLists.get(route.slug), turns.get(route.slug) ?? 'first');
    title = `${guide.deck} · Duel Links Coach`;
  } else {
    app.innerHTML = notFound();
  }
  document.title = title;

  if (keepScroll) window.scrollTo(0, scroll);
  else if (route.anchor && document.getElementById(`sc-${route.anchor}`)) document.getElementById(`sc-${route.anchor}`).scrollIntoView();
  else window.scrollTo(0, 0);
}

// Slide the card that was just added from where it was tapped into its place in the hand.
function flyIntoHand(from, slot, delay = 0) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.querySelector(`[data-hand-slot="${slot}"]`);
  if (!el?.animate) return;
  const to = el.getBoundingClientRect();
  el.animate(
    [
      { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`, opacity: 0.85 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: 380, delay, fill: 'backwards', easing: 'cubic-bezier(.2,.8,.2,1)' },
  );
}

document.addEventListener('click', (event) => {
  if (handleBoardClick(event)) return;
  const cardButton = event.target.closest('[data-card]');
  if (cardButton && currentSlug) {
    dialog.innerHTML = renderCardDialog(cardButton.dataset.card, data.guides[currentSlug], data, currentSlug);
    if (!dialog.open) dialog.showModal();
    return;
  }
  const pick = event.target.closest('[data-pick]');
  if (pick && currentSlug) {
    const hand = handFor(currentSlug);
    const name = pick.dataset.pick;
    if (!canAdd(data.guides[currentSlug], hand, name)) return;
    const from = pick.getBoundingClientRect();
    hand.push(name);
    render({ keepScroll: true });
    flyIntoHand(from, hand.length - 1);
    document.querySelector(`[data-pick="${CSS.escape(name)}"]`)?.focus({ preventScroll: true });
    return;
  }
  const ownBtn = event.target.closest('[data-own]');
  if (ownBtn && currentSlug) {
    owned = changeOwned(owned, ownBtn.dataset.own, Number(ownBtn.dataset.delta));
    saveCollection(owned);
    render({ keepScroll: true });
    document.querySelector(`[data-own="${CSS.escape(ownBtn.dataset.own)}"][data-delta="${ownBtn.dataset.delta}"]:not([disabled])`)?.focus({ preventScroll: true });
    return;
  }
  if (event.target.closest('[data-own-clear]') && currentSlug) {
    owned = {};
    saveCollection(owned);
    render({ keepScroll: true });
    return;
  }
  const turnPick = event.target.closest('[data-turn]');
  if (turnPick && currentSlug) {
    turns.set(currentSlug, turnPick.dataset.turn);
    render({ keepScroll: true });
    document.querySelector(`[data-turn="${turnPick.dataset.turn}"]`)?.focus({ preventScroll: true });
    return;
  }
  const deal = event.target.closest('[data-deal]');
  if (deal && currentSlug) {
    const lists = data.decklists?.[currentSlug];
    const id = chosenLists.get(currentSlug) ?? lists?.defaultId;
    const list = lists?.lists.find((l) => l.id === id) ?? lists?.lists[0];
    const from = deal.getBoundingClientRect();
    const hand = handFor(currentSlug);
    hand.length = 0;
    hand.push(...dealHand(list));
    render({ keepScroll: true });
    hand.forEach((_, i) => flyIntoHand(from, i, i * 110));
    document.querySelector('[data-deal]')?.focus({ preventScroll: true });
    return;
  }
  const unpick = event.target.closest('[data-unpick]');
  if (unpick && currentSlug) {
    const hand = handFor(currentSlug);
    const at = hand.indexOf(unpick.dataset.unpick);
    if (at >= 0) hand.splice(at, 1);
    render({ keepScroll: true });
    return;
  }
  if (event.target.closest('[data-unpick-all]') && currentSlug) {
    handFor(currentSlug).length = 0;
    render({ keepScroll: true });
    return;
  }
  const listPick = event.target.closest('[data-list-pick]');
  if (listPick && currentSlug) {
    chosenLists.set(currentSlug, listPick.dataset.listPick);
    render({ keepScroll: true });
    document.querySelector(`[data-list-pick="${CSS.escape(listPick.dataset.listPick)}"]`)?.focus();
  }
});

// Following a link from inside the pop-up (a "Used in" step) should close it first.
dialog.addEventListener('click', (event) => {
  if (event.target.closest('a[href^="#/"]')) dialog.close();
});

window.addEventListener('hashchange', () => {
  render();
  app.focus({ preventScroll: true });
});

try {
  data = await loadData();
  render();
} catch (err) {
  app.innerHTML = `<p class="error">Could not load the guide data. Is the site being served over http? (${esc(err.message)})</p>`;
}
