# MLB Scoreboards

A live Game Thread experience for Major League Baseball communities on Reddit. Built on Devvit Web.

---

## Overview

MLB Scoreboards turns ordinary Game Thread posts into real-time, data-rich scoreboards. Each post auto-renders its assigned game with score, situation, box score, scoring plays, win probability, and final wrap — all updating every 10 seconds while the game is in progress.

The app is designed for both ends of the MLB subreddit spectrum:

- **Team subreddits** (r/Reds, r/Yankees, r/Dodgers, etc.) that want focused Game Threads for only their team's games.
- **Aggregator subreddits** (r/MLBScoreboards and similar) that want a Game Thread for every game on the slate.

A single per-subreddit setting — **MLB Team Filter** — switches between these two modes. No code changes required.

---

## Features

### Scoreboard tabs

| Tab | Contents |
|-----|----------|
| **Live / Pregame / Wrap** | State-aware default tab. Pregame shows probable pitchers and first pitch. Live shows the active batter and pitcher, K-zone with numbered pitch dots, base/outs scorebug, latest-pitch chip with velocity and result. Wrap shows W/L pitcher decisions and top performers. |
| **Box Score** | Batting and pitching tables for both teams. Toggle between away and home with an animated underline. Internal scroll preserves position across polls. |
| **Scoring Plays** | Every run-producing event with mini-scorebug, RBI counter, and Statcast chips (exit velocity, launch angle, distance). |
| **All Plays** | Full play log, newest first, filtered to completed plays. |
| **Win Probability** | Inning-by-inning chart with team-colored polygons. Hover any zone on desktop or tap on mobile to see the play that drove the swing, the WP delta, and the resulting probabilities. |

### Moderator tools

- **One-click bulk posting** — Posts a Game Thread for every game on today's schedule, filtered by the configured team.
- **Per-subreddit team filter** — Dropdown of all 30 MLB teams plus "All Teams" for aggregators. Configurable via standard Reddit Community Apps settings.
- **Duplicate prevention** — Internal deduplication keyed to subreddit + game, so accidentally double-clicking the menu doesn't create duplicate posts.
- **Per-post game linking** — Each post is bound to its game's ID. Multiple posts in one sub each render their own game, not the auto-picked default.
- **Welcome post on install** — A one-time setup-and-overview post is created when a moderator installs the app, walking the team through configuration.

### Design

- Dark mode throughout, with MLB-aligned red (`#bf0d3d`) and navy (`#0a1828`) palette.
- Per-team color theming on the Win Probability chart, with a dark-mode-tuned palette so historically dark colors (Padres brown, Dodgers navy, etc.) remain readable on the dark background.
- Custom branded scrollbar with a white-to-red gradient that glows on hover.
- Rubik / Oswald / DM Mono typography.
- Definitive viewport layout: the tab bar is anchored to the bottom of the card, active tab content scrolls internally, and no zone ever pushes another off-screen.

---

## Installation

MLB Scoreboards is currently installable on subreddits the developer moderates. Public listing is pending Reddit's app review.

If you moderate a subreddit and would like to evaluate the app, reach out to u/0xgod.

---

## Configuration

After installation, configure the app via:

**Mod Tools → Community Apps → mlb-scores → Settings**

| Setting | Description |
|---------|-------------|
| **MLB Team Filter** | The team your subreddit follows. Game Threads will only post for that team's games. Choose **All Teams (post every game)** if your sub covers every team across the league. |

---

## Usage

Open the moderator menu on your subreddit (the `⋯` icon) and select:

**Post today's MLB game threads**

The bot reads your team filter and posts only what applies. Each post is automatically linked to its game and renders the live scoreboard.

Click the menu twice on the same day and duplicate prevention will skip already-posted games while adding any new ones (such as a doubleheader Game 2 added after Game 1).

---

## Tech Stack

- **Platform** — Devvit Web (Reddit's Node.js app platform)
- **Frontend** — Vanilla TypeScript, no framework. Inline-rendered `splash.html` with tab navigation, CSS custom properties, and inline SVG charts (K-zone, Win Probability, mini-scorebugs)
- **Backend** — Node.js server bundled as CommonJS, with Redis for dedup keys and post-to-gamePk mapping
- **Data** — [MLB Stats API](https://statsapi.mlb.com) for schedule, live game feed, and win probability
- **Logos** — mlbstatic.com SVG team logos, with dark-mode cap-only variants

---

## Project Structure

```
mlb-scores/
├── devvit.json              # App manifest — permissions, post entrypoints, menu, settings, triggers
├── public/
│   ├── splash.html          # Scoreboard markup
│   ├── splash.css           # Design system + tab layouts + Win Prob styles
│   ├── splash.ts            # Rendering, polling, win prob, tab switching
│   ├── diamond.png          # Background graphic
│   └── teams/               # Team logo SVGs (light + dark variants)
├── src/
│   └── server/
│       └── server.ts        # MLB API proxies, menu handlers, triggers, settings reader
└── tools/
    └── build.ts             # Build watcher
```

---

## Architecture Notes

### Per-post game linking

When the bulk poster creates a Game Thread, it writes a `post-game:{postId} → gamePk` mapping to Redis. The splash calls `/api/post-game` on load to look up which game its post is for, falling back to today's auto-picked game only if no mapping exists. This means a sub can have multiple Game Threads on the same day, each rendering its own game, with zero ambiguity.

### ET-anchored scheduling

The Devvit server runs in UTC. Clicking the menu at 11pm ET would otherwise fetch tomorrow's games. `todayDateStr()` uses `sv-SE` locale formatting with the `America/New_York` timezone to anchor "today" to MLB's scheduling day.

### Game status detection

MLB Stats API's status codes are nuanced: postponed games carry `abstractGameState: "Final"` even though they didn't play. The app checks `codedGameState === 'D'` for postponements before the Final branch. State helpers (`isFinalState`, `isPreGameState`, `isLiveState`) live at the top of `splash.ts`.

### Anti-flicker scroll preservation

The box score and plays tabs save scroll position before re-render and restore it after, so background 10-second polls don't snap the user back to the top mid-scroll.

---

## Roadmap

- [ ] Pre-game scheduled auto-posting via Devvit scheduler
- [ ] Adaptive polling: 2s during live at-bats, 30s pregame, 10s default
- [ ] Anti-flicker render diffing for smoother in-game updates
- [ ] Standings widget on the dashboard
- [ ] Favorite-team notifications

---

## Credits

Built by [u/0xgod](https://reddit.com/u/0xgod).

Data provided by the [MLB Stats API](https://statsapi.mlb.com).

Not affiliated with Major League Baseball Properties, Inc.

---

## License

[TBD]