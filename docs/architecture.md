# Architecture

A static website plus pre-downloaded data. No server, no database, no live API calls from the browser. Plain HTML, CSS and ES modules; no dependencies, no build step for the JavaScript.

## Data pipeline

```
Duel Links Meta (API)  --fetch-data.js-->  data/cards.json, skills.json, decks.json, meta.json   (raw copies in data/raw/, gitignored)
YGOPRODeck             --fetch-names.js--> data/names-pt.json                                    (Portuguese card names)
YGOPRODeck images      --fetch-card-images.js--> site/img/cards/<slug>.jpg                       (committed, public)
guides/<slug>.json     (hand-written, validated by check-guides.js)
        \
         +--build-site-data.js-->  site/data/*.json   (what the browser loads)
```

`build-site-data.js` (logic in `scripts/lib/site-data.js`) writes:

| File in `site/data/` | Loaded | Content |
|---|---|---|
| `index.json` | at start | One entry per verified guide: slug, name, skill, stats, `featured` card |
| `guides.json` | at start | The guide files, by slug |
| `cards.json` | at start | Only the cards a guide mentions (text, type, image path, Portuguese name, where to obtain) |
| `skills.json` | at start | Skill texts and how to get them |
| `decklists.json` | at start | Per deck: the creators' own lists first (`video: true`), then up to 6 real lists from recent top decks |
| `allcards.json`, `otherdecks.json`, `extracards.json` | lazily, on collection pages | All card names (6 columns incl. the Extra Deck flag), decks without a guide, cards of those decks |

Only guides with `status: "verified"` are published (drafts need `--include-drafts`). A deck with a guide is removed from `otherdecks.json`.

## Site modules (`site/js/`)

| Module | Role |
|---|---|
| `app.js` | Starts the app, owns the page state (hand per deck, chosen deck list, turn, opened builds), renders on route changes, handles clicks and the card pop-up |
| `router.js` | Hash routes (see below) |
| `data.js` | Loads the data files, lazy-loads the extra data |
| `dom.js` | `esc()`, `cardButton()`, role labels, `buildName()`, small helpers |
| `views-*.js` | **Pure functions that return HTML strings** (always through `esc()`); one per screen or tab |
| `board.js`, `board-ui.js`, `views-board.js` | The table model (zones, moves, simulation) and the step-by-step board shown in play lines |
| `card-dialog.js`, `card-nav.js` | Card pop-up with arrows through the cards of the current page |
| `match-hand.js`, `views-picker.js` | Hand picker: which play lines fit a hand (`requires`) |
| `collection.js`, `views-collection.js`, `views-own.js` | "My collection": owned cards with quantities, export/import |
| `packs.js`, `build-rank.js`, `views-build.js` | Pack plan and "What can I build?" |
| `versions.js`, `compare.js`, `odds.js`, `views-myversion.js`, `views-compare.js` | "My version": named versions of a deck, comparison with the guide, exact opening-hand odds |
| `card-search.js` | Name search (English and Portuguese) |
| `ai-key.js` | Leftover of the stopped AI-verdicts idea (unused by the site) |

Rule: views do not touch the DOM and do not read global state; `app.js` passes everything in (`pageCtx()`), which keeps views testable in Node.

## Routes

| Hash | Screen |
|---|---|
| `#/` | Decks page |
| `#/deck/<slug>/<tab>[/<scenario id>]` | Deck page. Tabs: `overview`, `lists`, `myversion`, `cards`, `synergies`, `options` (Alternatives), `play`, `picker` |
| `#/list/<slug>` | A top deck without a guide |
| `#/collection`, `#/build`, `#/glossary` | My collection, What can I build?, Glossary |

The sidebar highlights the section (`markNav` in `app.js`).

## Browser storage (per browser, never sent anywhere)

| Key | Content |
|---|---|
| `duel-links-coach-collection-v1` | Owned cards with quantities |
| `duel-links-coach-backup-v1` | Backup metadata for the collection |
| `duel-links-coach-versions-v1` | Named versions of a deck (also inside the collection export file) |

Every read and write is wrapped in try/catch; the site works with storage blocked.

## Scripts (`scripts/`)

| Script | Purpose |
|---|---|
| `fetch-data.js` | Download cards, skills, decks (paged; the API caps one response at 3000 rows) |
| `fetch-names.js` | Portuguese (and other) card names |
| `fetch-card-images.js` | Download missing card images (`--dry-run` lists them) |
| `check-guides.js` | Validate every guide (`npm run check`) |
| `build-site-data.js` | Build `site/data/` |
| `serve-site.js` | Local server on 127.0.0.1:5173 (dies on restart) |
| `digest-video.js`, `scan-transcript.js`, `evidence.js`, `review-queue.js`, `render-guide.js` | Video and review helpers used when writing guides |
| `gen-deck-docs.js` | Generate `docs/decks/*.md` |
| `ai-eval.js` | Quality test of the stopped AI-verdicts idea |

## Tests

`tests/*.test.js`, run with `npm test` from this folder. Scripts and site modules are both tested in Node (views are pure functions). A change is not done until the whole suite passes.

## Hosting

The site is a separate public repository that holds only the contents of `site/`. See [workflows/publish.md](workflows/publish.md).
