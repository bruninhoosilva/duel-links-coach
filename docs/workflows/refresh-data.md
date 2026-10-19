# Workflow: refresh the Duel Links Meta data

Card and skill data change with each set; deck popularity changes weekly. The site shows the fetch date on the Decks page ("Deck statistics are from Duel Links Meta, fetched <date>"), and each guide shows its own date.

```bash
npm run fetch                       # cards, skills and the top decks of the last 30 days into data/
node scripts/fetch-data.js --days 14
node scripts/fetch-data.js --from-raw        # rebuild cards.json and skills.json from data/raw without the network
node scripts/fetch-names.js --lang pt        # Portuguese card names into data/names-pt.json
node scripts/fetch-card-images.js --dry-run  # what pictures are missing (ask the user before downloading)
npm run check && npm run build:site && npm test
```

## Facts about the sources (learned the hard way)
- **Duel Links Meta** (primary source) has an undocumented JSON backend (top-decks, cards, skills). It may change or have usage terms: request sparingly and cache.
- "Speed" on Duel Links Meta is the **standard Duel Links format**. The scripts filter it with `rush[$ne]=true`; Rush is `rush=true`.
- The API silently **caps one response at 3000 rows**. The fetcher pages with `limit` + `skip` and a stable `sort=_id`, and throws if it got 3000 rows or fewer for cards.
- **YGOPRODeck** is used for Portuguese names and card pictures. It asks that data be stored locally, not hotlinked, with a 20 requests per second limit. Its image files are named without the leading zeros of the passcode.
- Duel Links card text can differ from the TCG text: never mix sources for card text.
- A guide records what the creator's video said at the time. After a data refresh, `npm run check` flags any card or skill that no longer exists under that name.

After refreshing, tell the user what changed (new cards, changed skills, new top decks) before publishing.
