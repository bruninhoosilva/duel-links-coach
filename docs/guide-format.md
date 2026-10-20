# Guide file format (`guides/<slug>.json`)

One JSON file per deck. `slug` = the deck name lower-cased with dashes (`Red-Eyes` is `red-eyes`). The validator is `scripts/lib/validate-guide.js` (run `npm run check`); this page describes what it enforces. A `verified` guide is held to a stricter standard than a `draft`.

All card names must exist in `data/cards.json` (English names, exact spelling) and skill names in `data/skills.json`. Text is written in our own words, plain English, for a beginner.

## Top level

| Field | Required | Notes |
|---|---|---|
| `deck` | yes | Display name, also used to find the Meta deck lists (case-insensitive match) |
| `format` | yes | `"speed"` (the standard Duel Links format) or `"rush"` |
| `status` | yes | `"draft"` or `"verified"` (only verified guides are published) |
| `updated` | yes | `YYYY-MM-DD`, shown on the site |
| `featuredCard` | no | Card shown beside the deck box on the Decks page |
| `metaDeck` | no | The deck's name on Duel Links Meta when it differs from `deck` (for example `"HEROs"` for Elemental HERO). Used for the Meta deck lists, stats and the "other decks" exclusion |
| `skill` | yes | See below |
| `sideSkills` | no | `[{ name, reason }]`: other skills the creator says work. Shown on the Alternatives tab |
| `sources` | verified: yes | `[{ title, creator, language, url }]`: the videos the guide comes from |
| `gamePlan`, `strengths[]`, `weaknesses[]` | gamePlan yes | Overview tab |
| `cards` | yes | See below |
| `synergies` | no | `[{ card, partners: [{ name, reason, link }] }]`: card pairs with the reason; `link` is the short label on the arrow |
| `scenarios` | yes | Play lines, see below |
| `videoList` | no | The creator's deck list for a guide built from **one** video |
| `videoLists` | no | One entry per video for a guide built from **two** videos (see "Two builds") |
| `buildDifferences` | no | Written comparison of the two builds |

### `skill`
```json
{ "name": "Skill name", "enablerCards": [], "trigger": "When it works", "enabler": "What it needs and does",
  "adds": [{ "card": "Name", "copies": 1, "note": "Added to your deck/hand by the skill" }] }
```
`trigger` and `enabler` are required text. `adds` lists cards the skill puts in the deck (shown as "Added by the skill" below deck lists and counted in the odds).

### `cards[]`
```json
{ "name": "Card", "role": "starter", "copies": 3, "note": "What it does here", "substitutes": [{ "name": "Other card", "why": "Reason the creator gives" }] }
```
- `role`: `starter`, `extender`, `payoff`, `removal` or `hand-trap`.
- `copies`: the creator's count (for two builds, the first build's count; say what the other build plays in `note`).
- `substitutes` feed the **Alternatives** tab ("No card X? use Y because Z"). Only swaps a creator actually recommends, or an honestly labelled option.

### `scenarios[]` (play lines)
```json
{ "id": "unique-id", "title": "Plain-language title", "build": "<videoLists id>",
  "hand": ["cards shown in the hand picker"],
  "requires": { "turn": "first", "hand": ["Card"], "anyOf": [{ "label": "Text", "cards": ["A","B"] }], "without": [{ "label": "Text", "cards": ["C"] }], "board": "text for a line that continues an earlier board" },
  "skillPlan": { "uses": true, "note": "..." },
  "start": { "hand": [], "graveyard": [], "banished": [], "monster-zone": [], "extra-monster-zone": [], "spell-trap-zone": [], "note": "..." },
  "steps": [ ... ], "chainNotes": "...", "endBoard": "...", "weakSpots": "..." }
```
- `build` (optional): the `id` of a `videoLists` entry. With two or more videos, play lines are grouped into collapsed "Build N (video title)" blocks; a line without `build` stays above the blocks.
- `requires` drives the hand picker (`turn` is `first` or `second`). `board` makes the line "needs an earlier board" and never matches a hand.
- `start` is the table before the first step. Use `"Unknown card"` for a card we cannot name (a draw, a card that does not matter).
- Verified guides need `requires`, `start`, `moves` on every step, a `source` and a `confidence` of `high` or `medium` on every step.

### Steps
Card step:
```json
{ "type": "card", "card": "Name", "action": "activate", "reason": "...", "confidence": "high",
  "source": { "url": "https://www.youtube.com/watch?v=...", "timestamp": "8:55" },
  "moves": [{ "card": "Name", "from": "hand", "to": "graveyard" }] }
```
`action`: `normal-summon`, `special-summon`, `set`, `activate`, `chain`, `attack`.

Skill step: `{ "type": "skill", "skill": "Name", "when": "...", "needs": "...", "gives": "...", "used": true, "reason": "...", "confidence", "source", "moves" }`.

`moves` replay the table: `from` and `to` are zones `hand`, `deck`, `extra-deck`, `graveyard`, `banished`, `monster-zone`, `extra-monster-zone`, `spell-trap-zone` or `overlay` (Xyz material; then `under` names the Xyz monster). The validator **simulates every scenario** and rejects an impossible move (a card that is not where the move says, a full zone, an Xyz with materials leaving the field). `deck` and `extra-deck` are not tracked, so cards can leave them freely. Field zones hold 5 (monster, spell/trap) and 2 (extra monster). A Field Spell is placed in `spell-trap-zone`.

`confidence`: `high` = shown clearly on screen or stated by the creator; `medium` = reconstructed from captions and card text (say so in the guide and to the user); `low` is not allowed in a verified guide.

## Two builds from two videos

```json
"videoLists": [
  { "id": "yralps", "title": "Name of the video", "creator": "Creator", "url": "https://...", "main": [{ "name": "Card", "count": 3 }], "extra": [] },
  { "id": "ignister", "title": "...", "creator": "...", "url": "...", "main": [], "extra": [] }
],
"buildDifferences": [{ "topic": "How it opens", "a": "Build 1 does...", "b": "Build 2 does...", "why": "Why it matters" }]
```
- Each entry needs `id` (unique), `title` (the video's name, used in "Build N (title)") and the lists. Counts are 1 to 3; at most 30 main and 9 Extra Deck cards.
- Effects on the site: the Deck lists tab opens with one chip per video, named **"From Video - Creator"**; the play guide groups scenarios per build; the Alternatives tab opens with "Two builds, two videos" (written comparison from `buildDifferences` plus an automatic table of every card whose count differs).
- A guide built from one video uses `videoList` (same shape without `id`/`title`); it shows as one "From Video - Creator" chip.

## Checking a guide
```bash
npm run check          # validation, including the board simulation
npm run build:site     # rebuild site/data
npm test
```
