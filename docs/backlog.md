# Backlog and open items

Ordered roughly by value. Nothing here is started unless it says so. Per-deck caveats are in [decks/known-issues.md](decks/known-issues.md).

## Pending right now
- Nothing is waiting. Everything up to the documentation set is published (the Cyber Dragon deploy and the first docs deploy both finished green on 2026-10-19). Local-only: any change made after the last publish; check with `git log` against the Pages repository.

## Content
- **Mathmech creator list.** The guide merges two creators; to give it a "From Video - Creator" list, re-read the deck screen of its main video (needs the user's yes to download a short section).
- **Re-check the derived lists** of Dark Magician and Memento against their video frames (they come from the guide's copy counts).
- **Cyber Dragon**: read IgnisterPRC's turn-one replay frame by frame (downloaded, not yet read) and extend both play lines to the Extra Deck bosses; confirm Cyber Revsystem and the Extra Deck Links.
- **Shining Sarcophagus**: extend both lines past the first extenders; confirm Timaeus the United Magical Dragon and Powersink Stone.
- **Horus and Red-Eyes**: the other replays were not read; more play lines (going second) would help the hand picker.
- More decks: each new deck follows [workflows/add-a-deck.md](workflows/add-a-deck.md). Ideas the user has mentioned: decks from the Meta list that still have no guide (see "Other top decks" on the "What can I build?" page).
- Decks without a creator-explained "going second" line only have turn-one lines.

## Features and polish (small, from reviews)
- "Marked as not owned" section on My collection, so the user can undo marking a whole list as not owned.
- Card pictures: all 204 cards the site shows have one (checked 2026-10-19 with `node scripts/fetch-card-images.js --dry-run`); run it after adding any deck.
- Glossary: fold into short searchable entries (offered to the user, not requested yet).
- Play guide step text could be shorter on long lines.
- Delete unused video clips in `data/raw/` when disk space matters (they are gitignored).

## Ideas that were considered
- Local-model explanations of what changes between your version and the guide: stopped (see [history.md](history.md)). Revisit only with hand-written effect summaries or a stronger model, and keep the 80% quality gate (`npm run ai:eval`).
- Rush format: the data has a `format` field and the validator accepts `rush`, but nothing is built for it.
- Data refresh: the card and skill data were last fetched 2026-10-13; run [workflows/refresh-data.md](workflows/refresh-data.md) after new sets or banlist changes.

## Process
- Keep [decks/known-issues.md](decks/known-issues.md) and this file honest after every deck.
- Run `npm run docs:decks` whenever a guide changes.
