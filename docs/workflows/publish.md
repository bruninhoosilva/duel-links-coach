# Workflow: publish to the live site

The live site is https://bruninhoosilva.github.io/duel-links-coach/ , served by GitHub Pages from the `main` branch (root) of **https://github.com/bruninhoosilva/duel-links-coach**, a separate public repository that contains only the contents of this project's `site/` folder (plus a `.nojekyll` file and a `README.md` of its own).

**Never push the main project repository** (the folder this project lives in has no remote and sits inside a folder of unrelated personal files). **Publish only when the user asks.**

## One-time setup
Clone the Pages repository somewhere outside this project (any folder):
```bash
git clone https://github.com/bruninhoosilva/duel-links-coach.git ../duel-links-coach-pages
```
`.nojekyll` and `README.md` live only in that clone: keep them.

## Every publish
```bash
# 1. In this project: make sure everything is committed, tests and the guide check pass, then rebuild
npm run check && npm test
npm run build:site

# 2. In the Pages clone: update, copy the site over, review
cd ../duel-links-coach-pages
git pull --ff-only
cp -r ../duel-links-coach/site/. .
git add -A
git status --short | grep -v img/        # only the files you expect

# 3. Commit and push
git commit -m "What changed"
git push

# 4. Wait for the deploy and verify
gh run list --limit 1                   # "pages build and deployment": queued, in_progress, completed
curl -s https://bruninhoosilva.github.io/duel-links-coach/data/index.json | head
```
Notes:
- `cp -r` copies and overwrites but **does not delete**: if a file was removed from `site/`, delete it in the clone too.
- `site/data/index.json` always changes on a build (it carries a `generatedAt` time). That is normal.
- Verify a changed file, not only the page: for example `curl` a new JS file or a new `data/guides.json` entry. The page itself may be cached by the browser: hard refresh (Ctrl+F5).
- A deploy normally takes under a minute. If the run stays `queued` for many minutes, check https://www.githubstatus.com : GitHub Actions had an incident on 2026-10-19 and the deploy of that day's publish waited a long time. The push itself is safe; the site updates when GitHub runs the job.
- Commit messages in the Pages repository end with the `Co-Authored-By` line the session asks for.

## What is public
Card images are included on purpose (the user chose public hosting with the card pictures; the artwork belongs to Konami and is shown only as a reference, and the Pages README invites rights holders to open an issue). The footer states that the tool is unofficial. Browser data (collection, versions) never leaves the browser.
