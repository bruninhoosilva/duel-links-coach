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
- Sources: an English deck guide (Mekklord) and a Portuguese replay guide (Ignister). The guide text merges both.
- **Creator list (added 2026-10-21):** "From Video - Ignister", read from his deck screen at the start of the video (30 main / 9 Extra). Mekklord only shows a 20-card core, so he has no list. Medium-confidence identifications: the 3 Forbidden Droplet (icy-art Ultra Rare spells), Underworld Goddess of the Closed World and I:P Masquerena in the Extra Deck (read from art, rarity and Link rating). His list has no Effect Veiler or Droll & Lock Bird and plays 3 Cynet Mining and 2 Mathmech Sigma, unlike the merged guide text.
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

## Blue-Eyes (updated 2026-10-29), one video
- Source: Yami Ewerton (Portuguese, narrated). Deck list read from the deck screen at the end of the video (26 main / 9 Extra; the creator says he plays 26 because he owns only two Kaibaman, with three he would play 30). Downloaded: the Extra Deck talk, the first combo, the deck screen, the second turn-one option and the three replays (about 67 MB in total).
- The creator says the English name "Azure-Eyes Silver Dragon" while talking about the Synchros, but the Level 9 "R" card in his Extra Deck is **Lightstorm Dragon** (Azure-Eyes is SR). The Lightstorm Dragon identification is medium confidence and he does not mention it in the video.
- The three main-deck card groups were matched to local card images, and the names shown on screen while he hovers confirm Jet Dragon, Chaos Dragon, Kaibaman, Droll & Lock Bird, Kumongous, Majesty, Synchro Rumble, Ultimate Fusion and Shenshen.
- Five play lines. The first (Spirit Dragon, Crimson Dragon, Shenshen, Abyss) and the second turn-one option (Sanaphond, True Light, Shenshen) are explained by the creator, not replayed; every step is medium confidence. The three replays (vs Elemental HERO, Dragon Maid, Horus/Bystial) are rebuilt from his narration and the frames: the frames were checked in detail only for the first replay, so the other two are narration-based. Several cards in the replays (which Kaiju, how many Melodies, the opponent's exact fusion and traps) are not named clearly, so those steps are medium confidence or left out.
- Open question: whether True Light can be activated the turn it is Set (the skill's second effect lets a Set card be activated the same turn, but in the first line True Light was added by the first effect). The skill's first effect also sends Blue-Eyes Ultimate Dragon and Black Luster Soldier to the Graveyard; the board simulation leaves them out.
