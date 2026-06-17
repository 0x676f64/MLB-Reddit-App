# MLB Scoreboards

A live Game Thread experience for Major League Baseball communities on Reddit. Built on Devvit Web.

---

## Overview

MLB Scoreboards turns ordinary Reddit posts into real-time, data-rich scoreboards. Each post auto-renders its assigned game with score, situation, box score, scoring plays, win probability, and final wrap — all updating every 10 seconds while the game is in progress.

Beyond the live scoreboard itself, the app handles the full lifecycle of MLB threads for moderators: game threads, postgame threads, postponement notices, suspended-game displays, and off-day discussion threads — all generated automatically based on schedule and game state.

The app is designed for both ends of the MLB subreddit spectrum:

- **Team subreddits** (r/Reds, r/Yankees, r/Dodgers, etc.) that want focused threads for only their team's games.
- **Aggregator subreddits** (r/MLBScoreboards and similar) that want a thread for every game on the slate.

A single per-subreddit setting — **MLB Team Filter** — switches between these two modes. No code changes required.

---

## Features

### Thread types

| Thread | When |
|--------|------|
| **Game Thread** | Posted manually via mod menu. Pre-game probable pitchers, live in-game scoreboard, final wrap — the same post evolves through all three states. |
| **Postgame Thread** | Posted automatically the moment a game ends (or manually via mod menu). Title includes final score; supports custom mod-defined templates with placeholders. |
| **Postponement Notice** | Posted automatically within ~1 minute of MLB officially postponing a game. Dedicated POSTPONED visual with reason and doubleheader note when applicable. |
| **Suspended Game Display** | Existing Game Thread automatically detects mid-game suspension (rain delays turning into holds, etc.). Shows SUSPENDED headline with the inning where play stopped. Linescore stays visible. |
| **Off-Day Discussion** | For team-specific subs only. When the team has no game scheduled, the bot posts a discussion thread with last result and next scheduled game. |

### Scoreboard tabs

| Tab | Contents |
|-----|----------|
| **Live / Pregame / Wrap / PPD / Suspended** | State-aware default tab. Pregame shows probable pitchers and first pitch. Live shows the active batter and pitcher, K-zone with numbered pitch dots, base/outs scorebug, latest-pitch chip with velocity and result. Wrap shows W/L pitcher decisions and top performers. Postponed and Suspended states get their own news-style displays. |
| **Box Score** | Batting and pitching tables for both teams. Toggle between away and home with an animated underline. Internal scroll preserves position across polls. |
| **Scoring Plays** | Every run-producing event with mini-scorebug, RBI counter, and Statcast chips (exit velocity, launch angle, distance). |
| **All Plays** | Full play log, newest first, filtered to completed plays. |
| **Win Probability** | Inning-by-inning chart with team-colored polygons. Hover any zone on desktop or tap on mobile to see the play that drove the swing, the WP delta, and the resulting probabilities. |

### Game-type context

The app handles every type of MLB game with appropriate title prefixes and an in-card context pill:

- **Regular Season** — Standard titles. No prefix.
- **Spring Training** — "Spring Training" prefix; visible context pill in card.
- **Postseason** — Title and context pill reflect the series and game number ("ALDS Game 3", "World Series Game 7", "AL Wild Card", etc.). All four rounds detected automatically.
- **All-Star Game** — "All-Star Game" prefix; visible context pill.
- **Exhibition** — "Exhibition" prefix; visible context pill.
- **Doubleheaders** — "(Game 1)" / "(Game 2)" suffix on every title. Context pill in card reads "GAME 1 OF 2". Combinations like postseason doubleheaders render correctly ("[ALDS Game 3] ... (Game 1)").

### Custom postgame titles

Mods can configure signature subreddit phrases for win/loss postgame posts. Both fields support placeholders:

- `{team}` — your team's name
- `{opp}` — opponent's name
- `{teamScore}` — your team's score
- `{oppScore}` — opponent's score

**Example:** `THEEEE YANKEES WIN! {team} {teamScore}, {opp} {oppScore}` produces `THEEEE YANKEES WIN! New York Yankees 7, Boston Red Sox 3`.

For postseason games, a bracketed context prefix is auto-prepended (e.g. `[ALDS Game 3] THEEEE YANKEES WIN!...`). Doubleheader suffix appends automatically.

### Moderator tools

- **One-click bulk posting** — Posts a Game Thread for every game on today's schedule, filtered by the configured team.
- **Off-day fallback** — On team-sub off days, the same menu posts an Off-Day Discussion thread instead.
- **Postgame trigger** — Manual menu for posting postgame threads for any recent completed games not yet captured by the auto-sweep.
- **Recover removed threads** — Auto-detects when mods delete/remove the bot's threads and clears dedup keys so they can be re-posted cleanly.
- **Per-subreddit team filter** — Dropdown of all 30 MLB teams plus "All Teams" for aggregators.
- **Duplicate prevention** — Internal Redis-backed dedup keyed to subreddit + game.
- **Per-post game linking** — Each post is bound to its game's ID. Multiple posts in one sub each render their own game.
- **Welcome post on install** — Auto-posted setup-and-overview when a moderator installs the app.

### Design

- Dark mode throughout, with MLB-aligned red (`#bf0d3d`) and navy (`#0a1828`) palette.
- Per-team color theming on the Win Probability chart, with a dark-mode-tuned palette so historically dark colors (Padres brown, Dodgers navy, etc.) remain readable on the dark background.
- Custom branded scrollbar with a white-to-red gradient that glows on hover.
- Rubik / Oswald / DM Mono typography.
- State-aware body classes (`is-pregame`, `is-live`, `is-final`, `is-postponed`, `is-suspended`) enable per-state CSS overrides (e.g. hiding the linescore for postponed games where it has no relevant data).
- Definitive viewport layout: the tab bar is anchored to the bottom of the card, active tab content scrolls internally, no zone pushes another off-screen.

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
| **MLB Team Filter** | The team your subreddit follows. Threads will only post for that team's games. Choose **All Teams (post every game)** if your sub covers every team across the league. |
| **Auto-post postgame threads** | When enabled (default), the app posts a Postgame Thread automatically the moment a game ends. Disable for single-thread subs — postponement notices still fire since they're informational. |
| **Postgame Win Title** | Optional custom title template used when the configured team wins. Supports `{team}`, `{opp}`, `{teamScore}`, `{oppScore}` placeholders. Leave blank for the default format. |
| **Postgame Loss Title** | Optional custom title template used when the configured team loses. Same placeholders. Leave blank for the default format. |

Custom titles only apply when a specific team is configured. "All Teams" subs always use the default format.

---

## Usage

Open the moderator menu on your subreddit (the `⋯` icon) and select:

**Post today's MLB game threads** — Posts a Game Thread for every game on today's slate. If the configured team has no game today, posts an Off-Day Discussion instead. Skips games that already have threads.

**Post postgame threads for completed games** — Sweeps recent games and creates Postgame Thread or Postponement Notice posts for any that need them. Useful as a backstop if the auto-sweep missed something.

**Allow re-posting removed game threads** — Clears today's dedup keys so removed threads can be re-posted.

Postgame threads and postponement notices fire automatically via a background cron, so day-to-day mod intervention is usually limited to running the morning menu.

---

## Tech Stack

- **Platform** — Devvit Web (Reddit's Node.js app platform)
- **Frontend** — Vanilla TypeScript, no framework. Inline-rendered `splash.html` with state-aware tab navigation, CSS custom properties, and inline SVG (K-zone, Win Probability, mini-scorebugs)
- **Backend** — Node.js server bundled as CommonJS, with Redis for dedup keys, post-to-gamePk mapping, and post-type tracking
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

---

## Architecture Notes

### Post-type tracking

Each thread the app creates is tagged in Redis with both its `gamePk` (which game) and its `postType` (`game`, `postgame`, `postponed`, or implicit off-day). When the splash loads, it reads both. This lets the splash force the correct UI state regardless of what `/feed/live` currently reports — important because the live-feed endpoint can lag MLB's official postponement announcement by hours, while the cron-driven postponement notice is posted within a minute.

### Per-post game linking

When the bulk poster creates a thread, it writes a `post-game:{postId} → gamePk` mapping to Redis. The splash calls `/api/post-game` on load to look up which game its post is for, falling back to today's auto-picked game only if no mapping exists. This means a sub can have multiple threads on the same day, each rendering its own game, with zero ambiguity.

### ET-anchored scheduling

The Devvit server runs in UTC. Clicking the menu at 11pm ET would otherwise fetch tomorrow's games. `todayDateStr()` uses `sv-SE` locale formatting with the `America/New_York` timezone to anchor "today" to MLB's scheduling day. Same logic underpins postponement detection, postgame sweeps, and off-day fallback.

### Game status detection

MLB Stats API's status codes are nuanced:

- **Postponed** (`codedGameState === "D"`) carries `abstractGameState: "Final"` even though no play happened. Detected before the Final branch in `handlePostgameOrPostponement`.
- **Suspended** (`codedGameState === "U"`) carries `abstractGameState: "Live"` — game paused mid-play. The cron correctly ignores suspended games (postgame branch requires `abstractGameState === "Final"`). The splash detects suspended state via a `startsWith("Suspended")` check.
- **Cancelled** (`codedGameState === "C"`) is skipped entirely — no postgame thread.

State helpers (`isFinalState`, `isPreGameState`, `isLiveState`, `isSuspendedState`) live at the top of `splash.ts` and are the single source of truth for state branching.

### Cron sweep

A 1-minute scheduler iterates today's and yesterday's games, calling `handlePostgameOrPostponement` for each. Final games get postgame threads; postponed games get postponement notices. Both write `post-type` Redis keys so the splash can render them correctly. Off-day threads are NOT created via cron — they're manual via the menu.

### Auto-cleanup on delete/remove

The `on-post-delete` and `on-mod-action` triggers (the latter filtering for `removelink` / `spamlink`) call `cleanDedupForPost`, which removes all Redis keys associated with that post: the game/postgame/postponed dedup key, the `post-game` reverse lookup, and the `post-type` marker. Off-day threads have their own keying handled separately.

### Anti-flicker scroll preservation

The box score and plays tabs save scroll position before re-render and restore it after, so background 10-second polls don't snap the user back to the top mid-scroll.

---

## Roadmap

- [ ] Pre-game scheduled auto-posting via Devvit scheduler (currently mod-triggered)
- [ ] Adaptive polling: 2s during live at-bats, 30s pregame, 10s default
- [ ] Network broadcast logos (ESPN, FOX, Apple TV+, etc.) in the meta strip
- [ ] Optional auto-pin of created game threads
- [ ] Auto-flair created posts
- [ ] Standings widget on the dashboard
- [ ] Favorite-team notifications
- [ ] WBC support (`sportId=51`)
- [ ] Skip Spring Training setting for subs that don't want spring coverage

---

## Credits

Built by [u/0xgod](https://reddit.com/u/0xgod).

Data provided by the [MLB Stats API](https://statsapi.mlb.com).

Not affiliated with Major League Baseball Properties, Inc.

---

## License

MIT License — see [LICENSE](./LICENSE) for full text.

Copyright (c) 2026 0X676F64