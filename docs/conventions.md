# Conventions, decisions and working agreements

Read this before changing anything. It records how the project owner wants the work done and the decisions already taken, so they do not have to be repeated.

## Product principles
- **The user is a beginner.** Guide text is plain English, in our own words (never copied from the videos or card text), and explains jargon the first time ("an extender is a card that lets you summon more monsters"). The Glossary tab holds the definitions.
- **Honesty about quality is the top rule.** "Make sure nothing will be off." Every claim traces to the real card text, the skill text or something the creator showed or said. When a step is reconstructed, mark it `medium` and tell the user. Never present a guess as fact; say plainly what is uncertain after each piece of work.
- **Verified guides only** are published. Credit the creators: each guide lists its videos and every step carries a video link with a timestamp.
- **Alternatives are crucial.** For every deck, capture every "if you don't have X, use Y because Z" the creators say. The Alternatives tab exists for this.
- Text must be **easy to read** (the user said it is the most important thing visually).

## How to work with the user
- **Decisions by questions, one decision at a time**, with a recommended option first. Use the question tool; do not ask in prose and wait.
- **Ask before downloading anything** (video sections, card images): say what, from where, roughly how much. A yes covers that request only. The user usually approves "deck list plus one replay" sections.
- **Publish only when asked.** The usual flow: build locally, show/describe it, ask "should I publish?", then publish and verify the live site.
- When the user says "tell me when X finishes", watch it and report; do not poll them.
- **Never switch tools or platforms silently** after failures: say what failed and ask first.
- Report honestly: what was built, what was verified, what is uncertain, what was not done. Short, plain, no hedging when something is verified.
- The user works on a Windows PC; give shell commands as single commands in a code block.

## Decisions already taken
| Decision | Why |
|---|---|
| Static site, no server, no live API calls | Free hosting, simple, nothing to maintain |
| Standard format = "Speed" on Duel Links Meta; Rush later | Duel Links already plays by Speed Duel rules |
| Public GitHub Pages hosting **with the Konami card images** | The user chose it. Card artwork belongs to Konami and is shown only as a reference for the guides; the footer says "unofficial fan tool" and the Pages README invites rights holders to open an issue |
| Separate site-only repository for hosting; the project repository is never pushed | The project folder has no remote and sits inside unrelated personal files |
| Dark navy and gold in-game look, Cinzel titles + Source Sans 3 body | User request: closer to Duel Links, text very readable |
| Creator's own deck list always shown first, named "From Video - Creator" | The user wants the exact list from the video next to the Meta lists |
| Two videos for one deck = two **builds** in one guide: collapsed "Build N (video title)" blocks in the play guide, a comparison on the Alternatives tab | User request; keeps one page per deck |
| AI-written "what you gain / lose" verdicts with a local model were **stopped** | Three prompt designs on a 7B model (qwen2.5) failed the 80% quality gate (invented details, restrictions counted as abilities). Code of tasks 1 to 5 stays unused; see [history.md](history.md) |
| Mathmech's two sources are **not** two builds | Its guide merges an English guide and Portuguese replays; it has no single video list |

## Writing guide text
- Card effects: only what the real text says. Use the English card names exactly as in `data/cards.json`.
- Keep the creator's terms where useful ("Tuner", "omni-negate") but explain them.
- A swap's `why` is the reason the creator gives, or an honestly labelled option ("the creator tried it and did not find it interesting").
- Say what the other build plays when you write a card note for a two-build guide.

## Code conventions
- Dependency-free Node v24, ES modules, no build step. Views are pure functions returning HTML strings; everything goes through `esc()`.
- Tests next to every behavior; `npm test` from the project folder, **never** `node --test <path>` (broken on this machine).
- Match the surrounding style (comment density, naming); small focused files; keep files under 500 lines when practical.
- Validate input at boundaries: guide files by `validate-guide.js`; browser storage reads and writes in try/catch; deck keys from the URL use own-property checks (`Object.hasOwn`).
- Commit messages: `feat:`, `fix:`, `docs:`, `data:` prefix; end with the `Co-Authored-By` trailer the session asks for.

## Gotchas on this machine (Windows 11, Git Bash)
1. **Do not put code with backticks or `${}` in shell commands** (`node -e`, heredocs): the shell expands it and corrupts files. Write a script file with the Write tool, or use the Edit tool.
2. Many files have CRLF line endings; multi-line text replacement scripts must normalize `\r\n` first. The Edit tool handles it.
3. The browser caches data and JS: hard reload, or `fetch(url, { cache: 'reload' })` for changed files before reloading.
4. `yt-dlp` section downloads are slow and may leave `*.webm.part`; do not use `--force-keyframes-at-cuts`.
5. `cp -r site/. <clone>` never deletes files from the Pages clone.
6. `git` prints "LF will be replaced by CRLF" warnings: harmless.
7. The local server (`npm run serve`) dies when the PC restarts.
8. Background watchers: a `pgrep`-based wait loop does not work in Git Bash; wait on a file or log line instead.
