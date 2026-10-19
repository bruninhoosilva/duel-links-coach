# Design system

"In-game feel": dark navy and gold, like the Duel Links menus. Desktop-first with a sidebar, responsive down to a phone. All styles are in `site/css/styles.css` (base rules first, the theme layer appended below).

## Tokens (`:root`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0f24` | Page background (with a radial glow) |
| `--surface`, `--surface-hi` | `#131943`, `#1a2152` | Panels (a gradient between them) |
| `--text`, `--muted` | `#eceffa`, `#a9b3d3` | Body and secondary text |
| `--line`, `--line-gold` | `#2c3566`, gold at 38% | Borders; gold borders mark important blocks |
| `--accent` | `#8fb4ff` | Links |
| `--gold`, `--gold-hi` | `#e0b04a`, `#ffd976` | Headings, active states, buttons |
| `--ok`, `--warn` | `#5ed39a`, `#f0b35a` | Strengths / gains, weaknesses / losses |

There is one theme (dark). The page declares `color-scheme: dark`.

## Fonts
- Titles and the brand: **Cinzel** (Google Fonts, 600 and 700).
- Body text: **Source Sans 3** (400, 600, 700, italic 400), 17px, line height 1.6, paragraphs capped at 78 characters for readability.
- Both load from Google Fonts in `index.html`; system sans-serif is the fallback.

## Layout
- `.shell` is a two-column grid: a sticky 240px sidebar (`.site-header`, brand + `.side-nav`) and the content. Under 900px the sidebar becomes a top bar.
- Content max width 1200px (`--maxw`); the My version split view fits inside it.
- Deck tabs (`.tabs`) are a game-menu strip; the active tab is a gold button.
- Panels: `.panel`, `.deck-card`, `.scenario`: gradient background, gold top edge, soft shadow.
- Card tiles (`.dtile`, `.pool-card`, `.hand-card`): framed like cards in a binder, lift with a gold glow on hover; the copy count is a gold badge (`.qty`).
- Decks page: `.deck-card.has-art` puts the deck's featured card (`.deck-art`, 118px) beside its box.
- Collapsible build blocks in the play guide: `details.build-group` (see [guide-format.md](guide-format.md)).

## Rules
- Text must stay easy to read: keep contrast, do not shrink body text, keep long paragraphs narrow.
- Every card name is a button (`data-card`) that opens the card pop-up; keep that when adding screens.
- Escape every string with `esc()`.
