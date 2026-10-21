import { loadData, loadExtra } from './data.js';
import { esc } from './dom.js';
import { parseRoute } from './router.js';
import { handleBoardClick } from './board-ui.js';
import { canAdd, dealHand } from './match-hand.js';
import {
  backupNudge, changeOwned, checkRest, exportCollection, exportMessage, importMessage, loadBackupMeta, loadCollection, noteChange, noteExport, parseCollection, requestPersistence, saveCollection, saveWarning,
} from './collection.js';
import { renderDeckList } from './views-deck-list.js';
import { renderDeckPage } from './views-deck.js';
import { renderGlossary } from './views-glossary.js';
import { renderCardDialog } from './card-dialog.js';
import { stepIndex, uniqueNames } from './card-nav.js';
import { renderCollectionPage, renderResults } from './views-collection.js';
import { renderBuildPage } from './views-build.js';
import { renderOtherDeck } from './views-other-deck.js';
import { addCard, cleanVersions, createVersion, deleteVersion, duplicateVersion, loadVersions, renameVersion, saveVersions, setCardCount, upsertVersion } from './versions.js';
import { renderVersionResults } from './views-myversion.js';

const app = document.getElementById('app');
const dialog = document.getElementById('card-dialog');
const hands = new Map(); // deck slug -> card names the user picked in the hand picker
let owned = loadCollection();
let versions = loadVersions(); // { deckSlug: [version, ...] }, saved in this browser
const verState = new Map(); // deck slug -> { id: active version id, query: search text }
requestPersistence(); // ask the browser to keep this site's storage; harmless if it says no
let ownMsg = ''; // one-line result of the last save, import or export, shown once
let ownMsgKind = 'ok'; // 'ok' or 'warn': how the message is styled
const turns = new Map(); // deck slug -> 'first' or 'second', chosen in the hand picker
const chosenLists = new Map(); // deck slug -> the deck list id chosen in the Deck lists tab
let data = null;
let currentSlug = null;
let extra = null; // { searchIndex, otherdecks, extracards }, loaded the first time a page needs it
let extraPromise = null; // the load of `extra` while it is in flight
let collectionQuery = '';

const pageCtx = () => ({
  ...data,
  ...(extra ?? {}),
  cards: { ...(extra?.extracards ?? {}), ...data.cards },
  owned,
  ownMsg,
  ownMsgKind,
  backupNote: backupNudge(loadBackupMeta()),
  versions,
  verState: verState.get(currentSlug ?? ''),
});
// The pages that wait for the extra card data (search index, other decks, extra cards).
const needsExtra = (route) => ['collection', 'build', 'other'].includes(route.name) || (route.name === 'deck' && route.tab === 'myversion');
// A page that uses the extra data. The handlers that test it also accept `currentSlug`, which is set on every
// deck page, so adding the My version tab here changes nothing for them: off a deck page it still means
// "a page without a guide context" (collection, build, other deck).
const onCollectionPage = () => needsExtra(parseRoute(location.hash));
const activeVersionId = () => verState.get(currentSlug)?.id ?? versions[currentSlug]?.[0]?.id;

const handFor = (slug) => {
  if (!hands.has(slug)) hands.set(slug, []);
  return hands.get(slug);
};

function notFound() {
  return '<section><h1>Page not found</h1><p><a href="#/">Back to the decks</a></p></section>';
}

// Highlights the sidebar link of the section being shown.
const NAV_OF = { decks: 'decks', deck: 'decks', other: 'collection', collection: 'collection', build: 'build', glossary: 'glossary' };
function markNav(routeName) {
  for (const a of document.querySelectorAll('.side-nav a')) {
    if (a.dataset.nav === NAV_OF[routeName]) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

// The play guide of a deck built from several videos has one collapsed block per build. The ones the reader opened stay
// open when the page is drawn again, and a link to one play line opens the build that holds it.
const openBuilds = new Set(); // "slug|build id"
function restoreBuilds(route) {
  if (!currentSlug) return;
  for (const d of app.querySelectorAll('details.build-group')) {
    if (openBuilds.has(`${currentSlug}|${d.dataset.build}`)) d.open = true;
  }
  const target = route.anchor ? document.getElementById(`sc-${route.anchor}`) : null;
  const group = target?.closest('details.build-group');
  if (group) {
    group.open = true;
    openBuilds.add(`${currentSlug}|${group.dataset.build}`);
  }
}
app.addEventListener(
  'toggle',
  (event) => {
    const d = event.target;
    if (!currentSlug || !d.matches?.('details.build-group')) return;
    const key = `${currentSlug}|${d.dataset.build}`;
    if (d.open) openBuilds.add(key);
    else openBuilds.delete(key);
  },
  true,
);

function render({ keepScroll = false } = {}) {
  const route = parseRoute(location.hash);
  const scroll = window.scrollY;
  currentSlug = null;
  let title = 'Duel Links Coach';

  if (needsExtra(route) && !extra) {
    app.innerHTML = '<p class="muted">Loading the card data…</p>';
    // One load at a time; when it lands, only touch the page if the user is still on a page that needs it.
    extraPromise ??= loadExtra().then(
      (loaded) => {
        extra = loaded;
        if (onCollectionPage()) render();
      },
      (err) => {
        extraPromise = null; // let a later visit try again
        if (onCollectionPage()) app.innerHTML = `<p class="error">Could not load the card data (${esc(err.message)}).</p>`;
      },
    );
    return;
  }

  if (route.name === 'decks') {
    app.innerHTML = renderDeckList(data.index);
  } else if (route.name === 'glossary') {
    app.innerHTML = renderGlossary();
    title = 'Glossary · Duel Links Coach';
  } else if (route.name === 'collection') {
    app.innerHTML = renderCollectionPage(pageCtx(), collectionQuery);
    title = 'My collection · Duel Links Coach';
  } else if (route.name === 'build') {
    app.innerHTML = renderBuildPage(pageCtx());
    title = 'What can I build? · Duel Links Coach';
  } else if (route.name === 'other') {
    app.innerHTML = renderOtherDeck(pageCtx(), route.slug);
    title = `${(Object.hasOwn(extra.otherdecks ?? {}, route.slug) && extra.otherdecks[route.slug].name) || 'Deck'} · Duel Links Coach`;
  } else if (route.name === 'deck' && Object.hasOwn(data.guides, route.slug)) {
    const guide = data.guides[route.slug];
    currentSlug = route.slug;
    app.innerHTML = renderDeckPage(guide, pageCtx(), route, handFor(route.slug), chosenLists.get(route.slug), turns.get(route.slug) ?? 'first');
    title = `${guide.deck} · Duel Links Coach`;
  } else {
    app.innerHTML = notFound();
  }
  document.title = title;
  markNav(route.name);
  restoreBuilds(route);

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

// The card pop-up can move to the cards beside the one you opened: the other tiles of the same deck list,
// pack, table, hand pool, board row or synergy pair.
const CARD_GROUPS = ['.deck-tiles', '.pack-cards', '.pool', '.moves', '.bcells', 'table', '.syn-flow'].join(',');
let cardSeq = null; // { names, index } for the pop-up that is open

function cardSequence(button) {
  const box = button.closest(CARD_GROUPS);
  const names = uniqueNames(box ? [...box.querySelectorAll('[data-card]')].map((el) => el.dataset.card) : []);
  const at = names.indexOf(button.dataset.card);
  return at < 0 ? { names: [button.dataset.card], index: 0 } : { names, index: at };
}

function showCard({ keepScroll = false } = {}) {
  const name = cardSeq.names[cardSeq.index];
  const nav = cardSeq.names.length > 1 ? { index: cardSeq.index, total: cardSeq.names.length } : null;
  // On a deck page, a card added from the search may exist only in the extra card data: use it once loaded.
  dialog.innerHTML = currentSlug
    ? renderCardDialog(name, data.guides[currentSlug], extra ? pageCtx() : { ...data, owned }, currentSlug, nav)
    : renderCardDialog(name, null, pageCtx(), undefined, nav);
  if (!keepScroll) dialog.scrollTop = 0;
  if (!dialog.open) dialog.showModal();
}

function stepCard(delta) {
  cardSeq.index = stepIndex(cardSeq.index, cardSeq.names.length, delta);
  showCard();
  dialog.querySelector(`[data-card-step="${delta}"]`)?.focus();
}

document.addEventListener('keydown', (event) => {
  if (!dialog.open || !cardSeq || cardSeq.names.length < 2) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  stepCard(event.key === 'ArrowRight' ? 1 : -1);
});

document.addEventListener('click', (event) => {
  if (handleBoardClick(event)) return;
  const stepBtn = event.target.closest('[data-card-step]');
  if (stepBtn && cardSeq) {
    stepCard(Number(stepBtn.dataset.cardStep));
    return;
  }
  const cardButton = event.target.closest('[data-card]');
  if (cardButton && (currentSlug || onCollectionPage())) {
    cardSeq = cardSequence(cardButton);
    showCard();
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
  if (ownBtn && (currentSlug || onCollectionPage())) {
    owned = changeOwned(owned, ownBtn.dataset.own, Number(ownBtn.dataset.delta));
    ownMsg = saveWarning(saveCollection(owned));
    noteChange();
    render({ keepScroll: true });
    ownMsg = '';
    const inDialog = dialog.open && dialog.contains(ownBtn);
    if (inDialog && cardSeq) showCard({ keepScroll: true });
    (inDialog ? dialog : document).querySelector(`[data-own="${CSS.escape(ownBtn.dataset.own)}"][data-delta="${ownBtn.dataset.delta}"]:not([disabled])`)?.focus({ preventScroll: true });
    return;
  }
  if (event.target.closest('[data-own-export]') && (currentSlug || onCollectionPage())) {
    const url = URL.createObjectURL(new Blob([exportCollection(owned, versions)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'duel-links-collection.json' });
    a.click();
    noteExport();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    ownMsg = exportMessage(owned, versions);
    ownMsgKind = 'ok';
    render({ keepScroll: true });
    ownMsg = '';
    return;
  }
  const checkRestBtn = event.target.closest('[data-own-checkrest]');
  if (checkRestBtn && (currentSlug || onCollectionPage())) {
    owned = checkRest(owned, JSON.parse(checkRestBtn.dataset.ownCheckrest));
    ownMsg = saveWarning(saveCollection(owned));
    noteChange();
    render({ keepScroll: true });
    ownMsg = '';
    return;
  }
  if (event.target.closest('[data-own-clear]') && (currentSlug || onCollectionPage())) {
    if (!confirm('Clear your whole collection? Export it first if you want a copy.')) return;
    owned = {};
    ownMsg = saveWarning(saveCollection(owned));
    noteChange();
    render({ keepScroll: true });
    ownMsg = '';
    return;
  }
  // ---- My version ----
  const verSlug = currentSlug;
  const activeVersion = () => {
    const list = versions[verSlug] ?? [];
    return list.find((v) => v.id === verState.get(verSlug)?.id) ?? list[0] ?? null;
  };
  const saveVersionsAndRender = () => {
    ownMsg = saveWarning(saveVersions(versions));
    ownMsgKind = ownMsg ? 'warn' : 'ok';
    noteChange();
    render({ keepScroll: true });
    ownMsg = '';
    ownMsgKind = 'ok';
  };
  const chooseVersion = (id) => verState.set(verSlug, { id, query: verState.get(verSlug)?.query ?? '' });
  if (verSlug && event.target.closest('[data-ver-new]')) {
    const lists = data.decklists?.[verSlug];
    const base = lists?.lists.find((l) => l.id === (chosenLists.get(verSlug) ?? lists.defaultId)) ?? lists?.lists[0];
    if (!base) return;
    const name = prompt('Name for your new version:', `My version ${(versions[verSlug]?.length ?? 0) + 1}`);
    if (name === null) return;
    const v = createVersion(base, name);
    versions = upsertVersion(versions, verSlug, v);
    chooseVersion(v.id);
    saveVersionsAndRender();
    return;
  }
  const verPick = verSlug && event.target.closest('[data-ver-pick]');
  if (verPick) {
    chooseVersion(verPick.dataset.verPick);
    render({ keepScroll: true });
    return;
  }
  if (verSlug && event.target.closest('[data-ver-dup]')) {
    const v = activeVersion();
    if (!v) return;
    const copy = duplicateVersion(v);
    versions = upsertVersion(versions, verSlug, copy);
    chooseVersion(copy.id);
    saveVersionsAndRender();
    return;
  }
  if (verSlug && event.target.closest('[data-ver-rename]')) {
    const v = activeVersion();
    if (!v) return;
    const name = prompt('New name for this version:', v.name);
    if (name === null) return;
    versions = upsertVersion(versions, verSlug, renameVersion(v, name));
    saveVersionsAndRender();
    return;
  }
  if (verSlug && event.target.closest('[data-ver-del]')) {
    const v = activeVersion();
    if (!v || !confirm(`Delete "${v.name}"? Export your collection first if you want a copy.`)) return;
    versions = deleteVersion(versions, verSlug, v.id);
    verState.delete(verSlug);
    saveVersionsAndRender();
    return;
  }
  const verCount = verSlug && event.target.closest('[data-ver-count]');
  if (verCount) {
    const v = activeVersion();
    if (!v) return;
    const section = verCount.dataset.section === 'extra' ? 'extra' : 'main';
    const name = verCount.dataset.verCount;
    const now = v[section].find((e) => e.name === name)?.count ?? 0;
    versions = upsertVersion(versions, verSlug, setCardCount(v, section, name, now + Number(verCount.dataset.delta)));
    saveVersionsAndRender();
    document.querySelector(`[data-ver-count="${CSS.escape(name)}"][data-section="${section}"][data-delta="${verCount.dataset.delta}"]:not([disabled])`)?.focus({ preventScroll: true });
    return;
  }
  const verAdd = verSlug && event.target.closest('[data-ver-add]');
  if (verAdd) {
    const v = activeVersion();
    if (!v) return;
    const section = verAdd.dataset.section === 'extra' ? 'extra' : 'main';
    versions = upsertVersion(versions, verSlug, addCard(v, section, verAdd.dataset.verAdd));
    saveVersionsAndRender();
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

// Typing in the collection search (or the My version card search) only redraws the results, so the box keeps its focus.
document.addEventListener('input', (event) => {
  const verBox = event.target.closest?.('#ver-search');
  if (verBox && currentSlug) {
    verState.set(currentSlug, { id: activeVersionId(), query: verBox.value });
    const results = document.getElementById('ver-results');
    if (results) results.innerHTML = renderVersionResults(pageCtx());
    return;
  }
  const box = event.target.closest?.('#collection-search');
  if (!box) return;
  collectionQuery = box.value;
  const results = document.getElementById('collection-results');
  if (results) results.innerHTML = renderResults(pageCtx(), collectionQuery);
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

document.addEventListener('change', async (event) => {
  const input = event.target.closest?.('[data-own-import]');
  if (!input || !input.files?.[0]) return;
  const result = parseCollection(await input.files[0].text());
  input.value = '';
  if (result.ok) {
    owned = result.owned;
    if (result.versions) versions = cleanVersions(result.versions);
    const savedVersions = result.versions ? saveVersions(versions) : true;
    const saved = saveCollection(owned);
    ownMsg = saved && savedVersions ? importMessage(owned, result.versions ? versions : undefined) : saveWarning(false);
    ownMsgKind = saved && savedVersions ? 'ok' : 'warn';
  } else {
    ownMsg = result.error;
    ownMsgKind = 'warn';
  }
  render({ keepScroll: true });
  ownMsg = '';
  ownMsgKind = 'ok';
});
