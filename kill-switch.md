# MLB Scores — Emergency Stop (Kill Switch)

If the app ever misbehaves during a game, this is how to stop it. Do the smallest fix for your problem and escalate only if it doesn't work. Every step here is reversible.

## Fastest path — pick your symptom

- **One post is wrong** (wrong game, broken scoreboard, bad title) → take that post down. **(Level 2)**
- **It's auto-posting threads it shouldn't** (unwanted postgame threads) → turn off Auto-post postgame threads. **(Level 1)**
- **Everything looks broken and you're not sure why** → uninstall the app. **(Level 3)**
- **You (the developer) just shipped a build that broke it** → roll the deploy back. **(Level 3, developer note)**

---

## Level 1 — Stop automatic posting

**When:** the app is posting postgame threads on its own that you don't want.

**Do:**
1. Mod Tools → Community Apps → mlb-scores → Settings
2. Turn **Auto-post postgame threads** off
3. Save

Takes effect within about a minute (the next background check).

**Stops:** automatic postgame threads — both the ones that fire when a game ends and the every-minute background sweep.

**Does NOT stop:**
- **Postponement notices** — those still post, by design (they're informational, so they fire even with this off).
- **Live scoreboards already on existing posts** — this setting only controls new auto-posts, not scoreboards that are already running.
- **The mod menu** — you can still post threads manually if you click the menu items.

**Undo:** turn it back on and Save.

---

## Level 2 — Take down one bad post

**When:** a single thread is the problem.

**Do:** open the post and remove it the way you'd remove any post (or delete it if it's your own).

Once it's down, no one sees its scoreboard, and the app automatically clears its own internal records for that post so it won't interfere with future posts. This works whether you **Remove** it as a mod or **Delete** it as the author — both are handled.

**Undo / bring it back:** run **Allow re-posting removed game threads** from the mod menu, and the app can post it again.

---

## Level 3 — Full stop

**When:** something's wrong across the board and you just want it all to stop.

**Do:** uninstall the app — Mod Tools → Community Apps → mlb-scores → Remove.

**Stops:** everything new — auto-posts, menu actions, and the background sweep. Existing posts may stop showing live data once the app is gone. This is the definitive off.

**Undo:** reinstall. You may need to re-enter your settings (team filter, custom titles, etc.).

### Developer note (u/0xgod only)

A subreddit mod can't do this — if a mod hits an app-wide problem, they contact you. If a build **you just shipped** broke rendering or behavior everywhere, don't uninstall — roll back instead:

1. From the machine with the Devvit CLI (logged in), redeploy the last known-good version.
2. Reopen a post to confirm the fix and clear the cached web-view bundle.

This keeps the app installed; it just reverts the code.

---

## One thing no setting stops instantly

A live scoreboard already open on someone's screen keeps refreshing until the game ends or **the post is removed**. There's no toggle that blanks a single running scoreboard — to stop a specific one, take that post down (Level 2).