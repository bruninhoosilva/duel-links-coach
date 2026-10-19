# Documentation index

Everything needed to continue this project without the chat history that built it.

## Start here
| File | Read it when |
|---|---|
| ../README.md | You want the overview and the commands |
| ../CLAUDE.md | You are a Claude Code session starting work |
| [conventions.md](conventions.md) | Before any change: rules, decisions, user preferences, gotchas |
| [backlog.md](backlog.md) | You want to know what is open, uncertain or planned |

## How things work
| File | Content |
|---|---|
| [architecture.md](architecture.md) | Data pipeline, site modules, routes, browser storage |
| [guide-format.md](guide-format.md) | The guide JSON file: every field and validation rule |
| [design-system.md](design-system.md) | The dark navy and gold look: tokens, fonts, layout rules |

## Step-by-step workflows
| File | Task |
|---|---|
| [workflows/add-a-deck.md](workflows/add-a-deck.md) | Add a deck from one or two videos |
| [workflows/publish.md](workflows/publish.md) | Put the current site on GitHub Pages |
| [workflows/refresh-data.md](workflows/refresh-data.md) | Refresh cards, skills and deck lists from Duel Links Meta |

## The decks
| File | Content |
|---|---|
| [decks/README.md](decks/README.md) | Index of the guided decks (generated) |
| [decks/known-issues.md](decks/known-issues.md) | Per-deck caveats that are not in the data (hand-written) |
| `decks/<slug>.md` | One generated page per deck: sources, builds, lists, play lines |

## History
| File | Content |
|---|---|
| [history.md](history.md) | Timeline of what was built and why, and the decisions taken |
| ../PRD.md | The original v1 product requirements (partly superseded; see its header) |
| `../../docs/superpowers/plans/` and `specs/` | Implementation plans and the AI-verdicts spec written during the build (they are in the parent repository, outside this folder) |
| ../review/ | Review queue and results of earlier quality checks (video go/no-go, AI-verdict gate) |

## Keeping the docs true
- `docs/decks/*.md` are **generated**: run `npm run docs:decks` after any guide change.
- Everything else is hand-written. When behavior changes, update the matching file in the same commit.
