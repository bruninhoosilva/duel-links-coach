# History and decision log

What was built, in order, and why. Dates are the days the work was done (the git history has the details: `git log -- .` in this folder, about 130 commits).

## 2026-10-13: foundation
- Idea: a beginner-friendly Duel Links coach with guides that are checked against real card text. PRD, then plans (`../../docs/superpowers/plans/`): data layer, video digester, first guide (Mathmech), visuals, website.
- **Data layer**: fetch cards, skills and top decks from Duel Links Meta (paged: the API caps one response at 3000 rows). Normalized files `cards.json`, `skills.json`, `decks.json`.
- **Video digester**: caption downloader (rate-limit back-off), VTT parser, transcript scanner, review queue. A go/no-go test on a Portuguese replay video decided that captions-first (no heavy video analysis) works (../review/go-no-go-result.md, ../review/go-no-go-result-pt.md).
- **Guide format and validator**: roles, skill panel (trigger, enabler), scenarios with steps and sources; verified guides need board data. First guide: Mathmech (draft, audit, review questions answered).
- **Website**: shell, router, loader, glossary, hand picker, board model with move simulation, step-by-step board in the play guide.

## 2026-10-14: more decks and the board
- Dark Magician and Memento guides (from Portuguese and English videos); card images; card-based hand picker with a "draw" animation; first/second turn toggle.
- Synergies shown as card pairs with arrows; **Alternatives** tab ("if you don't have X, use Y because Z") for every deck: the user called optionality crucial for all decks.
- Where-to-get information for every card and skill, and a pack plan (which packs hold the most missing cards).

## 2026-10-15: collection and hosting
- **My collection** (owned cards with quantities, saved in the browser), mark-as-owned on every deck list, export/import with clear messages, **What can I build?** (decks ranked by how much you own), 1,470 more card images, arrows and an X in the card pop-up.
- **Hosting**: published on GitHub Pages from a separate site-only repository, with card images (user's decision).

## 2026-10-16: My version, a stopped idea, and the new look
- **My version** tab: named versions of a deck, split view of your list next to the guide's list, exact opening-hand odds, pros and cons of each change, warnings for deck rules (warn but allow).
- **AI verdicts (stopped).** Idea: use a free local model (Ollama, qwen2.5 7B, only on the user's PC) to explain what you gain and lose with each change. The user asked for a quality gate before any UI. Three prompt designs were tested on 14 fixed changes (pass rule: 80% not misleading, none contradicting the card text):

  | Design | Correct | Misleading | Wrong | No answer |
  |---|---|---|---|---|
  | One step, free text | 7 | 2 | 5 | 0 |
  | Two steps, numbered effects | 2 | 9 | 1 | 2 |
  | Effects separated from limits | 4 | 5 | 1 | 4 |

  The model invented details and counted restrictions as abilities. The user chose to stop. Reports: ../review/ai-gate-result.md; spec and plan: `../../docs/superpowers/specs/2026-10-16-duel-links-coach-ai-verdicts-design.md` and `plans/2026-10-16-duel-links-coach-ai-verdicts.md`. The code (`scripts/lib/ai-*.js`, `npm run ai:eval`) stays, unused. Open alternatives: hand-written effect summaries per card, or a bigger model.
- **Duel Links look**: dark navy and gold, sidebar, game-style tabs, framed cards; then Cinzel titles with Source Sans 3 body text ([design-system.md](design-system.md)).
- Overview page restructured (key points first, details folded away).
- **Horus** guide (Sorem).

## 2026-10-17 to 2026-10-19: more decks and standards
- Deck lists: the **creator's own list from the video** comes first on the Deck lists tab.
- Decks page: the deck's **main character card** beside each box.
- **Red-Eyes** guide (IgnisterPRC), **Shining Sarcophagus** (two builds: IgnisterPRC and Sorem), **Cyber Dragon** (two builds: YRalps and IgnisterPRC).
- New standard for decks with two videos: play guide in collapsed **"Build N (video title)"** blocks; deck list chips named **"From Video - Creator"**; the Alternatives tab opens with the build comparison.
- Fix: card image download used passcodes with leading zeros that YGOPRODeck does not accept.
- This documentation set was written (and `docs/decks/*.md` made generated from the guide files).

## 2026-10-20 to 2026-10-26: Elemental HERO, owned copies in the pop-up, box ranking
- **Elemental HERO** guide (Palladino BR), with the new optional `metaDeck` field (Meta's name for the deck).
- The card pop-up has a **Copies I own** control, same collection as the deck lists.
- **Mathmech** gets its video list ("From Video - Ignister").
- **Which box should I open?** (`#/collection/boxes`, linked from My collection): the cards you are short of for the guided decks, grouped by box and ranked; a missing card scores 1 for every deck that needs it. Only video lists count; unmarked cards are listed apart and not counted. Pull rates and prices are not in the data.
