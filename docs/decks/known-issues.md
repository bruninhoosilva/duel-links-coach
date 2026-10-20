# Known issues and caveats per deck

Hand-written. These are the things the guide data cannot say about itself. Update this file whenever a guide is added or corrected. The structured facts of each deck are in the generated pages (`<slug>.md`).

Confidence labels: **high** = shown clearly on screen or stated by the creator; **medium** = reconstructed from captions and card texts.

## All decks
- Play lines marked medium were rebuilt from captions and card texts; the order of some steps may differ from what the creator did. The site says "check in game" next to such steps.
- Deck lists come from the creators' deck screens (480p video) unless noted. A misread card is possible; the totals were checked against the on-screen header counts.
- Guide text is the project's own wording; it should be re-checked after a Duel Links Meta data refresh (`npm run check` flags renamed cards).

## Dark Magician (updated 2026-10-14)
- Creator list: derived from the guide's copy counts (single video, 30 main / 7 Extra), **not** re-checked against the video frames.

## Mathmech (updated 2026-10-13)
- Sources: an English deck guide and a Portuguese replay guide. The guide merges both, so there is **no single creator list** (its copy counts add up to 31 main cards). The Deck lists tab shows Meta lists only.
- Notes and audit: `guides/mathmech.md`, `guides/mathmech.audit.md`, `guides/mathmech.boards.md`.

## Memento (updated 2026-10-14)
- Creator list: derived from the guide's copy counts (single video, 30 main / 9 Extra), not re-checked against the video frames.

## Horus (updated 2026-10-16)
- The Portuguese captions say "Orcust" where the creator says "Horus"; the English captions also mangle several card names. Names were matched against the card data and the on-screen list.
- Deck list read from the deck editor (30 main / 9 Extra). The exact step order of the turn-one line (Imsety and Walls start) is **medium** for several steps, notably the three Coach King Giantrainer draws.
- Second play line (the opponent's turn) is built from the creator's explanations and the end of the replay, not a full replay.
- Only one replay section (about 2 minutes) and the deck screens were read; the other replays were not.

## Red-Eyes (updated 2026-10-19)
- Skill: Red-Eyes Armament. The creator's list is not the Duel Links Meta "Red-Eyes" list (a different build).
- A few cards on the deck screen were identified by level, rarity and art at low resolution; totals match (30 main / 9 Extra, 15 Red-Eyes cards).
- Both play lines are medium-confidence reconstructions. The End Phase step of the first line shows Branded Banishment because the replay used it; the final list has Branded Beast and Branded in Red.

## Shining Sarcophagus (updated 2026-10-19), two builds
- Build 1: IgnisterPRC (King of Games). Build 2: Sorem. Both lists read from deck screens.
- **Timaeus the United Magical Dragon** in Build 1's Extra Deck is the least certain identification.
- Both play lines are "the creator's explained core line with an example hand", not replays of single duels; every step is medium confidence and the lines stop before the full end board.
- "Powersink Stone" (listed as an alternative for hand traps) is a **guess**: the captions say "Soul-Absorbing Bone Tower" / "pedra absorve alma"; the card is a Continuous Trap that appears in Meta lists for the deck.
- The Dark Magical Curtain advice (swap for Forbidden Droplet, Book of Moon or Effect Veiler) is Build 1's opinion.

## Cyber Dragon (updated 2026-10-19), two builds
- Build 1: YRalps (30 main). Build 2: IgnisterPRC (24 main, no hand traps). Both read from deck screens; the Extra Deck is the same in both (taken from the screens: 4 Fusion, 3 Xyz, 2 Link).
- **Cyber Revsystem** in Build 2's list was identified from card art and rarity (the only Ultra Rare Spell that fits); check it.
- The Extra Deck Links on screen were read as I:P Masquerena and S:P Little Knight (both videos use them); Duel Links Meta's own list shows Cyber Dragon Sieger instead of I:P.
- Both play lines are the creators' explained core lines with example hands, ending at I:P Masquerena and the first extenders; the Extra Deck boss sequences are only described in the chain notes. IgnisterPRC's replay section was downloaded but not read frame by frame.

## Elemental HERO (updated 2026-10-20), one video
- Source: PALLADINO BR (Portuguese, narrated). Deck list read from the deck screen (30 main / 9 Extra); only the deck-list and first-replay sections of the video were downloaded.
- **Copy counts** for Elemental HERO Stratos and Miracle Ejector: the screen shows 3 of each, the narration mentions one. The guide follows the screen.
- **Forbidden Droplet x3**: one copy is probably an alternate art; check.
- The Duel Links Meta name for this deck is "HEROs" (`metaDeck`), which is why its lists and stats use that name.
- Line 1 (Voltic Thunder wipe) comes from the first replay, read frame by frame with the duel log; the exact order of some steps is medium confidence, and whether the skill's third effect can Set E - Emergency Call on the same turn is not certain (the replay suggests a hand copy was used).
- Line 2 (Aqua Neos hand destruction) is built from the creator's explanation and the card texts, not a replay: every step is medium confidence.
