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
- **Creator list (added 2026-11-03):** "From Video - YRalps" (28 main / 9 Extra, read from his deck screen; the main-deck count matches the 28 shown). He plays no Cynet Mining and no Artifact Lancea. Medium confidence: the three UR spells in the first column of the spell row are read as Forbidden Droplet (the art is too small and he gives no count), the 2 Hey, Trunade! (the badge shows 2) and the Level 8 Extra Deck cards (Primera Primus and Geomathmech Magma, read from level, rarity and art). The fourth card in his first-replay hand looks like Mathmech Addition and the fifth is not clear. Downloaded: the deck-list section and two replays (about 30 MB). Only one replay is built (turn one, the opponent's deck is called "Eswort" in the captions, probably Swordsoul); the Valmonica replay (turn one, then turn two) is told in the chain notes and not simulated, and the turn-two replays against Centurion and Dark Magician were not downloaded. The captions say "Belle" for the card he would rather play than D.D. Crow: read as Ghost Belle & Haunted Mansion.
- **Play guide (2026-11-09)**: the play guide has a chooser for the Ignister and the YRalps deck. Ignister: Going first (his 5:31-11:30 line) and Bricked hand (11:58-15:58) were checked against the video frames; Going second is the same standard line kept as it was (his video shows it with the HUD on "Turn 2" and an empty opponent field, so going first and going second are the same sequence, the difference being that from turn 2 the skill can also Set a Mathmech Trap, which he skips), and Mekklord's English line stays as a fourth chip. Unconfirmed on screen: the second card the skill adds in the standard line (read as Sigma), and the two cards Dugares draws (the captions say a Book of Eclipse and "another Eclipse"; the guide names Infinite Impermanence from his later remark). The bricked hand start was wrong before and is now corrected: the screen shows Cynet Mining and Book of Eclipse in his hand (Mining fetches Circular, Book is discarded) and the captions a Forbidden Droplet sent to the skill; Effect Veiler and Artifact Lancea were not in that hand. YRalps: the going-second (Dark Magician) and bricked-hand (Centurion) lines were checked against the frames of the downloaded replays (the cards, the opponent's Eternal Soul and trap, Laplacian, Multiplication, Final Sigma and the winning direct attack are visible); the middle steps come from quick animations, so most stay medium confidence and the opponent's side is not simulated.
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

## Icejade (updated 2026-11-02), one video
- Source: YRalps (Portuguese, narrated). Deck list read from the deck screen at the start of the video (27 main / 9 Extra, totals and the type counts in the header match). Downloaded: the deck-list section and three replays (about 51 MB). The data was refreshed on 2026-11-02 first, because the skill "A World of Ice and Water" was not in the data from 2026-10-13.
- The creator says he plays 2 Nibiru and 2 Droll & Lock Bird, but the deck screen shows 3 of each (the screen is the only version whose totals match the header: 27 main cards). The guide follows the screen and says so on both cards.
- Extra Deck, medium confidence: two Icejade Gymir Aegirine (the third and second Synchro 10 look almost the same on screen), and the Link-2 shown as UR is read as I:P Masquerena (data lists it as SR; the creator says "SP" and does not discuss it). Knightmare Phoenix, Underworld Goddess of the Closed World and Worldsea Dragon Zealantis match his spoken names ("Fênix", "Deusa", "Zelantes").
- Three replays: turn one vs Dark Magician (the best-read), turn one vs Valmonica (narration plus a few frames), turn two vs Dark Magician (narration plus frames). The mirror match (22:47-26:45) was not downloaded. Which Level 7 Tuner (Ran Aegirine or Creation Aegirocassis) is searched or played face-down is not always clear, the card the skill's second effect adds is not always named, and the opening hands are partly reconstructed (an "Unknown card" slot). All of those steps are medium confidence.
- The Icejade Token is not a card in the data, so the board simulation does not track it.

## Swordsoul (updated 2026-11-03), one video
- Source: Sorem (Portuguese, a full course, uploaded 2026-05-17, so about 5 months older than our data). Deck list read from the deck screen at the start of the video (20 main / 9 Extra; the header counts 11 monsters / 8 spells / 1 trap and 4 Fusion / 5 Synchro match). Downloaded: the deck-list section and two replays (about 31 MB). The data was refreshed on 2026-11-02, so card and skill texts are current; no card in his list differs from the data except one wording: he says "except Fish" for Starving Venom Fusion Dragon, the data says "except Tokens" (the data text is used).
- Medium confidence: the Extra Deck Fusion cards are matched by level, rarity and art (the first, purple UR card is Khaos Starsource Dragon, called "Origin Chaos Dragon" in the captions) and the 4th card with the orange art is Albion the Branded Dragon. Starving Venom Predapower Fusion Dragon is only mentioned as something other players use; it is not in his list.
- Two replays built: turn one (the best-read one) and turn two vs Galaxy-Eyes Photon. The hand of the turn-one replay is only partly known (Ecclesia, Taia and Sacred Summit are inferred from the narration, two cards are Unknown), and the turn-two replay is told at speed, so its order and the card Chixiao searches (probably Sacred Summit) are medium confidence. The other two turn-two replays (vs D/D/D and Orcust) were not downloaded, and the turn-two replay vs D/D/D is only a description in the captions.
- The Golden Swordsoul and Super Polymerization show limit badges on the deck screen (2 and 1); this is read from the badge, not from the video.

## Winged Dragon of Ra (updated 2026-11-10), one video
- Source: Yami Ewerton (Portuguese, uploaded 2025-09-08, about 14 months before the guide). Deck list read from the deck screen (26 main / 9 Extra; the header counts 14 monsters / 11 spells / 1 trap and 2 Fusion / 3 Xyz / 4 Link match). Downloaded: the first-turn combo, the deck screen and the turn-two replay (about 56 MB), plus three card pictures.
- **Banned / limited check (asked by the user)**: all 13 Forbidden/Limited updates Duel Links Meta announced between 2025-09-26 and 2026-09-28 were read with `node scripts/banlist-history.js 2025-09-08 <card names>`. No card of his list was banned. Guardian Slime went Limited 2 to Unlimited (2025-09-26). Droll & Lock Bird went Unlimited to Limited 3 (2026-04-23) and back to Unlimited (2026-06-22). Everything else is unchanged and Unlimited, except Monster Reborn, which was already Limited 1 and is not in any update. Number 81 Super Dora / Gustav Max: Gustav Max went Unlimited to Limited 1 (2026-04-23) but is not in his list.
- The skill "Sun God's Flare" had its third effect changed on 2026-03-26: it now works if you control a Divine-Beast or the opponent controls a monster (before, it needed the opponent to control a monster and you to control nothing, as he explains). The guide uses today's text, so his remark that the second half only works "if the opponent controls a monster" is now more permissive. The first-turn line still works with today's wording.
- Medium confidence: the Rank 10 Xyz with orange art is read as Number 81 Super Dora (compared with the card pictures; Gustav Max is the other candidate), Knightmare Unicorn (the video says "unicórnio", the deck screen shows a UR Link-3), and Pentestag (the captions say "Pentag", the preview shows a 1600 ATK Link-2). The Link-5 and Masquerena are matched from his spoken description.
- Three lines: his turn-one combo, his two-Ra branch (told, not replayed, medium confidence) and the turn-two replay against Utopia (the captions and screen agree but the opponent's side is not simulated: Sphere Mode goes to the opponent's side and the board only tracks your cards). His starting hand in the first-turn example is not readable on screen. The other replay (the Wightprincess one, 13:50-17:30) was not downloaded.
