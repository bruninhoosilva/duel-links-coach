import { describeObtain, esc } from './dom.js';
import { boxPriority } from './box-priority.js';
import { MAX_COPIES } from './collection.js';

const SHOWN = 8;

const ownControl = (name, owned) => {
  const known = Object.hasOwn(owned, name);
  const have = Math.min(owned[name] ?? 0, MAX_COPIES);
  const label = esc(name);
  return `<span class="own"><button type="button" class="own-btn" data-own="${label}" data-delta="-1" aria-label="I own one less ${label}"${known && have === 0 ? ' disabled' : ''}>−</button><span class="own-n${known ? '' : ' unknown'}">${known ? have : '?'}</span><button type="button" class="own-btn" data-own="${label}" data-delta="1" aria-label="I own one more ${label}"${have >= MAX_COPIES ? ' disabled' : ''}>+</button></span>`;
};

function cardRow(c, ctx) {
  const image = ctx.cards?.[c.name]?.image;
  const thumb = image ? `<img class="thumb" src="${esc(image)}" alt="" width="44" height="64" loading="lazy">` : '<span class="thumb"></span>';
  const decks = c.decks.map((d) => `${esc(d.deck)} ×${d.short}`).join(', ');
  return `<li class="coll-row">${thumb}<span class="coll-name"><button type="button" class="linklike" data-card="${esc(c.name)}"><strong>${esc(c.name)}</strong></button><span class="muted small">Short in ${c.nDecks} ${c.nDecks === 1 ? 'deck' : 'decks'}: ${decks}</span></span>${ownControl(c.name, ctx.owned ?? {})}</li>`;
}

function boxCard(b, rank, ctx) {
  const copies = `${b.copies} missing ${b.copies === 1 ? 'copy' : 'copies'}`;
  return `<li class="build-row box-row">
    <details class="box-details" data-box="${esc(b.name)}">
      <summary><strong>${rank}. ${b.url ? `<a href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${esc(b.name)}</a>` : esc(b.name)}</strong> <span class="muted small">${esc(b.type)}</span>
        <span class="box-score">${b.score} priority</span></summary>
      <p class="small">Helps ${b.decks.length} ${b.decks.length === 1 ? 'deck' : 'decks'} (${b.decks.map(esc).join(', ')}). ${b.cards.length} ${b.cards.length === 1 ? 'card' : 'cards'} you are short of, ${copies}.</p>
      <ul class="coll-list">${b.cards.map((c) => cardRow(c, ctx)).join('')}</ul>
    </details>
  </li>`;
}

function elsewhereRow(c, ctx) {
  const sources = c.obtain.length ? c.obtain.map(describeObtain).join('; ') : 'No pack or reward is listed for this card.';
  return `${cardRow(c, ctx).replace('</li>', `<span class="muted small box-where">${sources}</span></li>`)}`;
}

function unmarkedBlock(unmarked) {
  if (unmarked.length === 0) return '';
  const items = unmarked
    .map((u) => `<li><strong>${esc(u.deck)}</strong>: ${u.names.length} ${u.names.length === 1 ? 'card' : 'cards'} not marked. <button type="button" class="linklike" data-own-checkrest="${esc(JSON.stringify(u.names))}">Mark them as not owned</button></li>`)
    .join('');
  return `<h2>Not counted: cards you have not marked</h2>
    <p class="muted">These cards are left out of the ranking, because I do not know whether you own them. Mark them (on a deck's list, in the pop-up of a card, or with the button below) and this page updates.</p>
    <ul>${items}</ul>`;
}

export function renderBoxesPage(ctx) {
  const owned = ctx.owned ?? {};
  const { boxes, noBox, cardsShort, unmarked } = boxPriority(ctx);
  const empty = Object.keys(owned).length === 0
    ? '<p class="skill-status warn">You have not marked any cards yet, so there is nothing to compare. Open <a href="#/collection">My collection</a> and add the cards you own, or mark cards on a deck\'s list.</p>'
    : '';
  const first = boxes.slice(0, SHOWN);
  const rest = boxes.slice(SHOWN);
  return `
    <section>
      <p><a href="#/collection">← My collection</a></p>
      <h1>Which box should I open?</h1>
      <p class="lead">The cards you are short of for the decks with a play guide, grouped by the boxes that contain them. A card that is missing in several decks counts for more: each missing card scores 1 for every deck that needs it, and a box's priority is the sum of its cards.</p>
      <p class="muted small">Only the creators' video lists count. Pull rates, prices and which boxes are still on sale are not included: the data says what a box contains, not how likely you are to pull a card. A card found in several boxes counts for each of them.</p>
      ${empty}
      ${cardsShort.length === 0 && !empty ? '<p class="skill-status">You are not short of any marked card for these decks.</p>' : ''}
      ${first.length ? `<h2>Boxes, best first</h2><ol class="build-list box-list">${first.map((b, i) => boxCard(b, i + 1, ctx)).join('')}</ol>` : ''}
      ${rest.length ? `<details class="box-details" data-box="more-boxes"><summary>Show the other ${rest.length} boxes</summary><ol class="build-list box-list" start="${SHOWN + 1}">${rest.map((b, i) => boxCard(b, SHOWN + i + 1, ctx)).join('')}</ol></details>` : ''}
      ${noBox.length ? `<h2>Missing cards that are not in a box</h2><p class="muted">These come from rewards, events or special sets, or the data lists no source for them.</p><ul class="coll-list">${noBox.map((c) => elsewhereRow(c, ctx)).join('')}</ul>` : ''}
      ${unmarkedBlock(unmarked)}
    </section>`;
}
