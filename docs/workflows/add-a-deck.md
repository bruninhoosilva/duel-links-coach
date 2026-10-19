# Workflow: add a deck from a video (or two)

This is how all seven guides were made. The guide file `guides/<slug>.json` is the product; everything else is checking and plumbing. Estimated effort: a long session, mostly reading.

## 0. Agree the scope with the user
- One video = one guide. Two videos for the same deck = **two builds** in one guide (`videoLists`, see [../guide-format.md](../guide-format.md)).
- Ask before downloading anything. State what, from where and roughly how large (see [../conventions.md](../conventions.md)).

## 1. Identify the deck and read the captions
```bash
yt-dlp --skip-download --print "%(id)s | %(title)s | %(uploader)s | %(duration_string)s" "<url>"
yt-dlp --list-subs --skip-download "<url>"          # look for pt-orig and en-orig
node scripts/digest-video.js "<url>" --langs pt-orig,en-orig
```
- Captions land in `data/raw/video-<id>/transcript.<lang>.txt` (gitignored). Lines look like `[12:03] text`.
- **The English track is a machine translation of the Portuguese captions and mangles card and skill names** ("Orcust" for Horus, "Allure of Darkness" for Precious Cards of the Dark). Use English to read the flow and Portuguese plus the in-game screen to confirm names.
- Duel Links Meta may already have lists for the deck (`site/data/otherdecks.json`, key = slug): useful as a cross-check, but the guide follows the creator's own list.
- Find the skill: `data/skills.json` (the on-screen name is in Portuguese; match by the skill text).

## 2. Get the creator's exact deck list (needs a yes from the user)
The captions never list the deck, so read it off the deck editor shown in the video.

```bash
cd data/raw/video-<id>
yt-dlp -q --no-warnings -f "bv*[height<=480]+ba/b[height<=480]" --download-sections "*3:35-6:30" -o "sec-b1.%(ext)s" "<url>"
```
- Pick sections where the deck editor (or the in-duel "Deck info" tab) is on screen, plus one turn-one replay. Run long downloads in the background; they take minutes on this machine.
- If the file stays as `sec-x.webm.part`, it is complete when `ffprobe` shows the expected duration: rename it. Do not use `--force-keyframes-at-cuts`.
- Frames: `ffmpeg -ss <t> -i sec.webm -frames:v 1 -vf "crop=in_w*W:in_h*H:in_w*X:in_h*Y,scale=iw*3:-1:flags=lanczos" out.png`, then view the image. The video is 854x480, so crop to the deck panel and enlarge. Each creator's layout differs; take a small contact sheet first (`fps=1/12,scale=480:-1,tile=4x3`) to find the panel.
- Read the **header counts** (monsters / spells / traps, Fusion / Synchro / Xyz / Link) and the **Deck Principal / Deck Adicional totals**; a sum that does not match means a misread card.
- Identify each card by level, attribute, rarity, art and the preview overlay (it shows the name and "n/3" copies), cross-checked with `data/cards.json`. Same art = same card, so counts are easy.
- Anything you could not read for certain must be said to the user, and stays `medium` in the notes.

## 3. Read the card texts
```bash
node scripts/evidence.js --cards "Card A|Card B" --skill "Skill name"
```
or query `data/cards.json` directly. Every statement in the guide about what a card does must come from the real text.

## 4. Write the guide
Create `guides/<slug>.json` (a small Node script that builds the object and writes the JSON is the easiest way: helper functions for `moves` and list entries keep it short, but the JSON stays the source of truth). Include:
1. `cards` with roles, copies, notes, and the swaps the creators recommend (`substitutes`). **Re-read the transcript for every "if you don't have X, use Y" remark**: they are easy to miss.
2. `synergies` (pairs with the reason), `strengths`, `weaknesses`, `gamePlan`.
3. `skill` (trigger, enabler, `adds`), `sideSkills` for other skills the creator mentions.
4. `scenarios`: one or two play lines per build. Reconstruct from the replay plus card texts; the validator simulates the table, so impossible moves fail. Mark reconstructed steps `medium`.
5. `featuredCard` (the deck's main character card).
6. The creator list: `videoList` (one video) or `videoLists` + `buildDifferences` (two videos).

## 5. Validate and build
```bash
npm run check            # 0 errors, 0 warnings for the new guide
npm run build:site       # fails if the guide uses a card or skill that is not in the data
node scripts/fetch-card-images.js --dry-run     # lists missing card pictures
```
Missing pictures: ask the user for permission, then `node scripts/fetch-card-images.js` (small files from YGOPRODeck, saved in `site/img/cards/`). YGOPRODeck names files without leading zeros of the passcode (already handled in `scripts/lib/card-images.js`).

## 6. Look at it
```bash
npm run serve           # http://127.0.0.1:5173
```
Open the deck: Overview, Deck lists (the "From Video - Creator" chips), Cards, Synergies, Alternatives (two builds: the comparison on top), Play guide (builds collapsed), Hand picker. Resize to phone width. The browser caches data files: hard reload, or run `fetch(url, { cache: 'reload' })` for the changed files and reload.

## 7. Finish
```bash
npm run docs:decks      # regenerate docs/decks/<slug>.md
npm test
git add guides site docs tests && git commit
```
Then add anything uncertain to [../decks/known-issues.md](../decks/known-issues.md), tell the user what is uncertain, and **ask before publishing** ([publish.md](publish.md)).

## Checklist
- [ ] Skill found and described from its real text
- [ ] Deck list read from the screen, totals match the header
- [ ] Every recommended swap captured
- [ ] Play lines validated; reconstructed steps marked `medium`
- [ ] `featuredCard` set; creator list(s) set
- [ ] Missing images downloaded with the user's yes
- [ ] `npm run check`, `npm test` green; page checked in the browser, desktop and phone
- [ ] `known-issues.md` updated; `npm run docs:decks` run
