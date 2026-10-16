import { esc } from './dom.js';
import { deckHref } from './router.js';
import { renderCards, renderOverview, renderPlay, renderSynergies } from './views-guide.js';
import { renderPicker } from './views-picker.js';
import { renderDeckLists } from './views-decklists.js';
import { renderOptions } from './views-options.js';
import { renderMyVersion } from './views-myversion.js';

const TAB_LABELS = { overview: 'Overview', lists: 'Deck lists', myversion: 'My version', cards: 'Cards', synergies: 'Synergies', options: 'Alternatives', play: 'Play guide', picker: 'Hand picker' };

export function renderDeckPage(guide, ctx, route, hand, listId, turn = 'first') {
  const tabs = Object.entries(TAB_LABELS)
    .map(
      ([tab, label]) =>
        `<a href="${deckHref(route.slug, tab)}"${tab === route.tab ? ' aria-current="page"' : ''}>${esc(label)}</a>`,
    )
    .join('');
  const builders = {
    overview: () => renderOverview(guide, ctx),
    lists: () => renderDeckLists(guide, ctx, route.slug, listId),
    myversion: () => renderMyVersion(guide, ctx, route.slug),
    cards: () => renderCards(guide, ctx),
    synergies: () => renderSynergies(guide, ctx),
    options: () => renderOptions(guide, ctx),
    play: () => renderPlay(guide, ctx),
    picker: () => renderPicker(guide, hand, route.slug, ctx, turn),
  };
  const body = (builders[route.tab] ?? builders.overview)(guide, ctx, route, hand);
  const badge = guide.status === 'verified' ? 'Verified' : 'Draft';
  return `
    <section>
      <p class="crumbs"><a href="#/">All decks</a></p>
      <h1>${esc(guide.deck)} <span class="badge badge-${esc(guide.status)}">${badge}</span></h1>
      <p class="muted">Updated ${esc(guide.updated)} · Skill: ${esc(guide.skill.name)}</p>
      <nav class="tabs" aria-label="Guide sections">${tabs}</nav>
      <div class="tab-body">${body}</div>
    </section>`;
}
