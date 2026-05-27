import type { IncomingMessage, ServerResponse } from "node:http";
import { once } from "node:events";
import { context, reddit, redis, settings } from "@devvit/web/server";
import type { PartialJsonValue, TriggerResponse, UiResponse } from "@devvit/web/shared";

// ════════════════════════════════════════════════════════════════════════
// Entry point
// ════════════════════════════════════════════════════════════════════════

export async function serverOnRequest(
  req: IncomingMessage,
  rsp: ServerResponse,
): Promise<void> {
  try {
    await onRequest(req, rsp);
  } catch (err) {
    const msg = `server error; ${err instanceof Error ? err.stack : err}`;
    console.error(msg);
    writeJSON<ErrorResponse>(500, { error: msg, status: 500 }, rsp);
  }
}

async function onRequest(
  req: IncomingMessage,
  rsp: ServerResponse,
): Promise<void> {
  const url = req.url;
  if (!url || url === "/") {
    writeJSON<ErrorResponse>(404, { error: "not found", status: 404 }, rsp);
    return;
  }

  const urlObj = new URL(url, "http://localhost");
  const pathname = urlObj.pathname;

  // ── Public read endpoints (called by the splash) ──────────────────────
  if (pathname === "/api/schedule") {
    await onSchedule(urlObj, rsp);
    return;
  }
  if (pathname.startsWith("/api/game/")) {
    await onGame(pathname.slice("/api/game/".length), rsp);
    return;
  }
  if (pathname.startsWith("/api/winprob/")) {
    await onWinProb(pathname.slice("/api/winprob/".length), rsp);
    return;
  }
  if (pathname === "/api/post-game") {
    await onPostGame(rsp);
    return;
  }
  if (pathname === "/api/postgame-check") {
    await onPostgameCheck(rsp);
    return;
  }

  // ── Moderator menu endpoints ──────────────────────────────────────────
  if (pathname === "/internal/menu/post-all-today") {
    const result = await onMenuPostAllGames();
    writeJSON<PartialJsonValue>(200, result as unknown as PartialJsonValue, rsp);
    return;
  }
  if (pathname === "/internal/menu/post-postgame") {
    const result = await onMenuPostPostgame();
    writeJSON<PartialJsonValue>(200, result as unknown as PartialJsonValue, rsp);
    return;
  }
  if (pathname === "/internal/menu/clear-today-dedup") {
    const result = await onMenuClearTodayDedup();
    writeJSON<PartialJsonValue>(200, result as unknown as PartialJsonValue, rsp);
    return;
  }

  // ── Trigger endpoints ─────────────────────────────────────────────────
  if (pathname === "/internal/triggers/on-app-install") {
    const result = await onAppInstall();
    writeJSON<PartialJsonValue>(200, result as unknown as PartialJsonValue, rsp);
    return;
  }
  if (pathname === "/internal/triggers/on-post-delete") {
    const result = await onPostDelete(req);
    writeJSON<PartialJsonValue>(200, result as unknown as PartialJsonValue, rsp);
    return;
  }
  if (pathname === "/internal/triggers/on-mod-action") {
    const result = await onModAction(req);
    writeJSON<PartialJsonValue>(200, result as unknown as PartialJsonValue, rsp);
    return;
  }

  writeJSON<ErrorResponse>(404, { error: "not found", status: 404 }, rsp);
}

type ErrorResponse = {
  error: string;
  status: number;
};

// ════════════════════════════════════════════════════════════════════════
// HTTP helpers
// ════════════════════════════════════════════════════════════════════════

function writeJSON<T extends PartialJsonValue>(
  status: number,
  json: Readonly<T>,
  rsp: ServerResponse,
): void {
  const body = JSON.stringify(json);
  const len = Buffer.byteLength(body);
  rsp.writeHead(status, {
    "Content-Length": len,
    "Content-Type": "application/json",
  });
  rsp.end(body);
}

async function readJSON<T>(req: IncomingMessage): Promise<T | null> {
  try {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    await once(req, "end");
    const body = Buffer.concat(chunks).toString();
    return body ? (JSON.parse(body) as T) : null;
  } catch {
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════
// MLB Stats API proxies (called by the splash)
// ════════════════════════════════════════════════════════════════════════

async function onSchedule(urlObj: URL, rsp: ServerResponse): Promise<void> {
  const date = urlObj.searchParams.get("date");
  if (!date) {
    writeJSON<ErrorResponse>(400, { error: "Missing date param", status: 400 }, rsp);
    return;
  }
  try {
    const r = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`,
    );
    const data = (await r.json()) as PartialJsonValue;
    writeJSON<PartialJsonValue>(200, data, rsp);
  } catch (e) {
    writeJSON<ErrorResponse>(500, { error: String(e), status: 500 }, rsp);
  }
}

async function onGame(pk: string, rsp: ServerResponse): Promise<void> {
  try {
    const r = await fetch(
      `https://statsapi.mlb.com/api/v1.1/game/${pk}/feed/live`,
    );
    const data = (await r.json()) as PartialJsonValue;
    writeJSON<PartialJsonValue>(200, data, rsp);
  } catch (e) {
    writeJSON<ErrorResponse>(500, { error: String(e), status: 500 }, rsp);
  }
}

async function onWinProb(pk: string, rsp: ServerResponse): Promise<void> {
  if (!/^\d+$/.test(pk)) {
    writeJSON<ErrorResponse>(400, { error: "Invalid gamePk", status: 400 }, rsp);
    return;
  }
  try {
    const r = await fetch(
      `https://statsapi.mlb.com/api/v1/game/${pk}/winProbability`,
    );
    const data = (await r.json()) as PartialJsonValue;
    writeJSON<PartialJsonValue>(200, data, rsp);
  } catch (e) {
    console.error(`onWinProb error for ${pk}:`, e);
    writeJSON<ErrorResponse>(500, { error: String(e), status: 500 }, rsp);
  }
}

// Per-post game lookup — the splash calls this to find which game to render
async function onPostGame(rsp: ServerResponse): Promise<void> {
  if (!context.postId) {
    writeJSON<PartialJsonValue>(200, { gamePk: null } as PartialJsonValue, rsp);
    return;
  }
  try {
    const val = await redis.get(`post-game:${context.postId}`);
    const gamePk = val ? Number(val) : null;
    writeJSON<PartialJsonValue>(200, { gamePk } as PartialJsonValue, rsp);
  } catch (e) {
    console.error("onPostGame error:", e);
    writeJSON<PartialJsonValue>(200, { gamePk: null } as PartialJsonValue, rsp);
  }
}

/**
 * Called by the splash the moment its 10-second poll cycle sees the game
 * has gone Final. Server re-validates by fetching the feed directly
 * (don't trust the client's claim), then creates the postgame thread
 * if all conditions are met.
 *
 * Idempotent — multiple simultaneous viewers' splashes can call this and
 * only one postgame thread is created (the dedup key check guards it).
 */
async function onPostgameCheck(rsp: ServerResponse): Promise<void> {
  const subId = context.subredditId;
  const postId = context.postId;
  if (!subId || !postId) {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  // Which game does this post belong to?
  const gamePkStr = await redis.get(`post-game:${postId}`);
  if (!gamePkStr) {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  // Auto-postgame disabled for this sub?
  const enabled = await getAutoPostgameSetting();
  if (!enabled) {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  // Postgame thread already exists?
  const pgKey = `postgame:${subId}:${gamePkStr}`;
  if (await redis.get(pgKey)) {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  // Re-fetch the feed to confirm Final state — don't trust client claim
  let feed: any;
  try {
    const r = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePkStr}/feed/live`);
    feed = await r.json();
  } catch (e) {
    console.error("postgame-check feed fetch failed:", e);
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  const abstractState = feed?.gameData?.status?.abstractGameState;
  const codedState = feed?.gameData?.status?.codedGameState;
  if (abstractState !== "Final" || codedState === "D" || codedState === "C") {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  const teamId = await getTeamIdFilter();

  try {
    const post = await reddit.submitCustomPost({
      title: buildPostgameTitleFromFeed(feed, teamId),
    });
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
    await redis.set(`post-game:${post.id}`, gamePkStr, { expiration: expiresAt });
    await redis.set(pgKey, post.id, { expiration: expiresAt });

    console.log(`postgame-check: created ${post.id} for gamePk ${gamePkStr}`);
    writeJSON<PartialJsonValue>(200, { created: true } as PartialJsonValue, rsp);
  } catch (e) {
    console.error("postgame-check submit failed:", e);
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
  }
}

// ════════════════════════════════════════════════════════════════════════
// Settings helpers
// ════════════════════════════════════════════════════════════════════════

/**
 * Read the per-subreddit teamId setting.
 * Returns null if unset, blank, or non-numeric so the schedule call falls
 * back to fetching all games instead of erroring out.
 */
async function getTeamIdFilter(): Promise<string | null> {
  try {
    const raw = await settings.get<string | string[]>("teamId");

    let value: string;
    if (Array.isArray(raw)) {
      value = (raw[0] ?? "").toString().trim();
    } else if (typeof raw === "string") {
      value = raw.trim();
    } else {
      value = "";
    }

    if (!value) return null;
    if (!/^\d+$/.test(value)) {
      console.warn(`Invalid teamId setting: "${value}" — falling back to all games`);
      return null;
    }
    return value;
  } catch (e) {
    console.error("getTeamIdFilter error:", e);
    return null;
  }
}

/**
 * Read the per-subreddit autoPostgame toggle.
 * Defaults to true (opt-out) if unset or unreadable.
 */
async function getAutoPostgameSetting(): Promise<boolean> {
  try {
    const raw = await settings.get<boolean | boolean[]>("autoPostgame");
    if (Array.isArray(raw)) return raw[0] ?? true;
    if (typeof raw === "boolean") return raw;
    return true;
  } catch (e) {
    console.error("getAutoPostgameSetting error:", e);
    return true;
  }
}

function scheduleUrl(date: string, teamId: string | null): string {
  const base = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`;
  return teamId ? `${base}&teamId=${teamId}` : base;
}

// ════════════════════════════════════════════════════════════════════════
// Date / title helpers
// ════════════════════════════════════════════════════════════════════════

function todayDateStr(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/New_York" });
}

function formatGameTimeET(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
}

/**
 * Game thread title using the schedule API format.
 */
function buildGameThreadTitle(game: any, teamId: string | null): string {
  const away = game?.teams?.away?.team?.name || "Away";
  const home = game?.teams?.home?.team?.name || "Home";
  const homeId = String(game?.teams?.home?.team?.id ?? "");
  const time = formatGameTimeET(game?.gameDate || new Date().toISOString());

  if (teamId && teamId === homeId) {
    return `Game Thread: ${home} vs ${away} - ${time}`;
  }
  return `Game Thread: ${away} @ ${home} - ${time}`;
}

/**
 * Postgame thread title using the schedule API format.
 * Used by the manual menu fallback (which scans the schedule).
 */
function buildPostgameThreadTitle(game: any, teamId: string | null): string {
  const away = game?.teams?.away?.team?.name || "Away";
  const home = game?.teams?.home?.team?.name || "Home";
  const homeId = String(game?.teams?.home?.team?.id ?? "");
  const awayScore = game?.teams?.away?.score ?? 0;
  const homeScore = game?.teams?.home?.score ?? 0;

  if (teamId && teamId === homeId) {
    return `Postgame Thread: ${home} ${homeScore} vs ${away} ${awayScore}`;
  }
  return `Postgame Thread: ${away} ${awayScore} @ ${home} ${homeScore}`;
}

/**
 * Postgame thread title using the live feed format (different shape than
 * the schedule API). Used by the splash-triggered postgame check.
 */
function buildPostgameTitleFromFeed(feed: any, teamId: string | null): string {
  const awayName = feed?.gameData?.teams?.away?.name || "Away";
  const homeName = feed?.gameData?.teams?.home?.name || "Home";
  const homeId = String(feed?.gameData?.teams?.home?.id ?? "");
  const awayScore = feed?.liveData?.linescore?.teams?.away?.runs ?? 0;
  const homeScore = feed?.liveData?.linescore?.teams?.home?.runs ?? 0;

  if (teamId && teamId === homeId) {
    return `Postgame Thread: ${homeName} ${homeScore} vs ${awayName} ${awayScore}`;
  }
  return `Postgame Thread: ${awayName} ${awayScore} @ ${homeName} ${homeScore}`;
}

// ════════════════════════════════════════════════════════════════════════
// Moderator menu handlers
// ════════════════════════════════════════════════════════════════════════

async function onMenuPostAllGames(): Promise<UiResponse> {
  const subredditId = context.subredditId;
  if (!subredditId) {
    return { showToast: { text: "No subreddit context.", appearance: "neutral" } };
  }

  const teamId = await getTeamIdFilter();

  let games: any[] = [];
  try {
    const r = await fetch(scheduleUrl(todayDateStr(), teamId));
    const data: any = await r.json();
    games = data?.dates?.[0]?.games || [];
  } catch (e) {
    console.error("schedule fetch failed:", e);
    return { showToast: { text: "Couldn't fetch schedule.", appearance: "neutral" } };
  }

  if (!games.length) {
    const note = teamId ? " for the configured team" : "";
    return { showToast: { text: `No games today${note}.`, appearance: "neutral" } };
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const game of games) {
    const pk = game?.gamePk;
    if (!pk) continue;

    const dedupKey = `posted:${subredditId}:${pk}`;
    if (await redis.get(dedupKey)) {
      skipped++;
      continue;
    }

    try {
      const post = await reddit.submitCustomPost({
        title: buildGameThreadTitle(game, teamId),
      });
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
      await redis.set(`post-game:${post.id}`, String(pk), { expiration: expiresAt });
      await redis.set(dedupKey, post.id, { expiration: expiresAt });
      created++;
    } catch (e) {
      console.error(`Failed posting game ${pk}:`, e);
      failed++;
    }
  }

  const msg = `Posted ${created}, skipped ${skipped}${failed ? `, failed ${failed}` : ""}.`;
  return {
    showToast: {
      text: msg,
      appearance: created > 0 ? "success" : "neutral",
    },
  };
}

/**
 * Manual fallback: scan today's schedule and create postgame threads for
 * any completed games that don't yet have one. Used when a postgame
 * thread didn't auto-fire (e.g., no one was viewing when the game ended).
 */
async function onMenuPostPostgame(): Promise<UiResponse> {
  const subredditId = context.subredditId;
  if (!subredditId) {
    return { showToast: { text: "No subreddit context.", appearance: "neutral" } };
  }

  const teamId = await getTeamIdFilter();

  let games: any[] = [];
  try {
    const r = await fetch(scheduleUrl(todayDateStr(), teamId));
    const data: any = await r.json();
    games = data?.dates?.[0]?.games || [];
  } catch (e) {
    console.error("schedule fetch (postgame menu) failed:", e);
    return { showToast: { text: "Couldn't fetch schedule.", appearance: "neutral" } };
  }

  if (!games.length) {
    return { showToast: { text: "No games today.", appearance: "neutral" } };
  }

  let created = 0;
  let failed = 0;

  for (const game of games) {
    const pk = game?.gamePk;
    if (!pk) continue;

    const abstractState = game?.status?.abstractGameState;
    const codedState = game?.status?.codedGameState;
    if (abstractState !== "Final") continue;
    if (codedState === "D") continue; // postponed
    if (codedState === "C") continue; // cancelled

    // Must have had a Game Thread
    const gameDedupKey = `posted:${subredditId}:${pk}`;
    if (!(await redis.get(gameDedupKey))) continue;
        
    // Must not already have a Postgame Thread
    const pgKey = `postgame:${subredditId}:${pk}`;
    if (await redis.get(pgKey)) continue;

    try {
      const post = await reddit.submitCustomPost({
        title: buildPostgameThreadTitle(game, teamId),
      });
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
      await redis.set(`post-game:${post.id}`, String(pk), { expiration: expiresAt });
      await redis.set(pgKey, post.id, { expiration: expiresAt });
      created++;
    } catch (e) {
      console.error(`Failed posting postgame for game ${pk}:`, e);
      failed++;
    }
  }

  if (created === 0 && failed === 0) {
    return {
      showToast: {
        text: "No completed games are ready for a postgame thread.",
        appearance: "neutral",
      },
    };
  }

  const msg = `Posted ${created} postgame thread(s)${failed ? `, failed ${failed}` : ""}.`;
  return {
    showToast: { text: msg, appearance: created > 0 ? "success" : "neutral" },
  };
}

async function onMenuClearTodayDedup(): Promise<UiResponse> {
  const subredditId = context.subredditId;
  if (!subredditId) {
    return { showToast: { text: "No subreddit context.", appearance: "neutral" } };
  }

  const teamId = await getTeamIdFilter();

  let games: any[] = [];
  try {
    const r = await fetch(scheduleUrl(todayDateStr(), teamId));
    const data: any = await r.json();
    games = data?.dates?.[0]?.games || [];
  } catch (e) {
    console.error("schedule fetch (clear-dedup) failed:", e);
    return { showToast: { text: "Couldn't fetch schedule.", appearance: "neutral" } };
  }

  if (!games.length) {
    return { showToast: { text: "No games today to clear.", appearance: "neutral" } };
  }

  let cleared = 0;
  for (const game of games) {
    const pk = game?.gamePk;
    if (!pk) continue;

    // Game thread dedup
    const gameDedupKey = `posted:${subredditId}:${pk}`;
    const linkedGamePostId = await redis.get(gameDedupKey);
    if (linkedGamePostId) {
      await redis.del(gameDedupKey);
      await redis.del(`post-game:${linkedGamePostId}`);
      cleared++;
    }

    // Postgame thread dedup
    const pgKey = `postgame:${subredditId}:${pk}`;
    const linkedPgPostId = await redis.get(pgKey);
    if (linkedPgPostId) {
      await redis.del(pgKey);
      await redis.del(`post-game:${linkedPgPostId}`);
      cleared++;
    }
  }

  return {
    showToast: {
      text: `Cleared ${cleared} thread(s). You can now re-post them.`,
      appearance: cleared > 0 ? "success" : "neutral",
    },
  };
}

// ════════════════════════════════════════════════════════════════════════
// Triggers
// ════════════════════════════════════════════════════════════════════════

const WELCOME_POST_BODY = `# Welcome to MLB Scoreboards

Thanks for installing **MLB Scoreboards** — a live Game Thread experience built for Major League Baseball communities, from team-focused subreddits to league-wide aggregators.

## What it does

MLB Scoreboards turns each Game Thread into a real-time, data-rich scoreboard. Once a thread is posted, the bot does the rest:

- **Pregame** — Probable starters, season stat lines, first pitch time
- **Live** — Score, count, base/outs scorebug, K-zone with numbered pitch dots, latest pitch chip with velocity and result
- **Box Score** — Batting and pitching tables for both teams, toggleable team view
- **Scoring Plays** and **All Plays** — Every event with mini-scorebug, RBI, and Statcast chips (exit velocity, launch angle, distance)
- **Win Probability** — Inning-by-inning chart, hover or tap any swing to see the play that drove it
- **Final / Wrap** — W/L pitcher decisions, top performers, completed linescore

Threads refresh every 10 seconds while a game is in progress. No further moderator action required after posting.

## Two threads per game

By default, this app creates **two discussion threads** for each game:

- **Game Thread** — Posted manually by you when you run the menu. Captures live, in-game reactions.
- **Postgame Thread** — Posted automatically the moment a game ends. Includes the final score in the title and captures postgame analysis.

This matches the discussion pattern of most established sports subreddits and keeps live and postgame conversations separate. If you prefer single-thread style, disable **Auto-post postgame threads** in the settings.

## Quick setup

1. Open **Mod Tools → Community Apps → mlb-scores → Settings**.
2. Under **MLB Team Filter**, choose one of:
   - **Your team** — for team subreddits like r/Reds, r/Yankees, or r/Dodgers.
   - **All Teams (post every game)** — for league-wide subreddits.
3. Confirm **Auto-post postgame threads** is set to your preference (on by default).
4. Click **Save**.
5. When you're ready to post today's threads, open the moderator menu on your subreddit and select **"Post today's MLB game threads."** Postgame threads will follow automatically as games end.

## Recovering removed threads

If you delete or remove any Game Thread or Postgame Thread the bot created, the system will detect the removal and automatically allow it to be re-posted. If a thread doesn't come back, run **"Allow re-posting removed game threads"** from the moderator menu to reset the tracker manually. For postgame threads specifically, you can also run **"Post postgame threads for completed games"** to create any that were missed.

## On duplicate prevention

If you click the posting menu twice on the same day, the bot will skip games it has already posted and only add new ones (such as the second game of a doubleheader added mid-day).

## Questions or feedback

Reach out to u/mlb-scores with anything — feature requests, bug reports, suggestions. This is built for your community; it should work the way you want it to.

---

*Built on Devvit Web. Data provided by the MLB Stats API. Not affiliated with Major League Baseball Properties, Inc.*`;

async function onAppInstall(): Promise<TriggerResponse> {
  const subredditName = context.subredditName;
  if (!subredditName) {
    console.warn("onAppInstall: no subredditName in context");
    return {};
  }
  try {
    await reddit.submitPost({
      subredditName,
      title: "Welcome to MLB Scoreboards — setup and overview",
      text: WELCOME_POST_BODY,
    });
  } catch (e) {
    console.error("onAppInstall welcome post failed:", e);
  }
  return {};
}

/**
 * Remove the dedup keys (both Game Thread and Postgame Thread) associated
 * with a given post ID. Safe to call on unknown postIds — silently no-ops.
 */
async function cleanDedupForPost(postId: string): Promise<void> {
  const gamePk = await redis.get(`post-game:${postId}`);
  if (!gamePk) return;

  const subId = context.subredditId;
  if (subId) {
    const gameKey = `posted:${subId}:${gamePk}`;
    const pgKey = `postgame:${subId}:${gamePk}`;

    // Clear whichever dedup namespace this post belongs to
    const gameLinked = await redis.get(gameKey);
    if (gameLinked === postId) await redis.del(gameKey);

    const pgLinked = await redis.get(pgKey);
    if (pgLinked === postId) await redis.del(pgKey);
  }
  await redis.del(`post-game:${postId}`);

  console.log(`Cleaned dedup for post ${postId} (gamePk ${gamePk})`);
}

async function onPostDelete(req: IncomingMessage): Promise<TriggerResponse> {
  try {
    const body = await readJSON<{ postId?: string; post?: { id?: string } }>(req);
    const postId = body?.postId || body?.post?.id;
    if (!postId) {
      console.warn("onPostDelete: no postId in event payload", body);
      return {};
    }
    await cleanDedupForPost(postId);
  } catch (e) {
    console.error("onPostDelete error:", e);
  }
  return {};
}

async function onModAction(req: IncomingMessage): Promise<TriggerResponse> {
  try {
    const body = await readJSON<{
      action?: string;
      targetPost?: { id?: string };
      targetPostId?: string;
    }>(req);

    const action = (body?.action || "").toLowerCase();
    const REMOVAL_ACTIONS = ["removelink", "spamlink"];
    if (!REMOVAL_ACTIONS.includes(action)) return {};

    const postId = body?.targetPost?.id || body?.targetPostId;
    if (!postId) {
      console.warn("onModAction: no targetPost ID in event payload", body);
      return {};
    }
    await cleanDedupForPost(postId);
  } catch (e) {
    console.error("onModAction error:", e);
  }
  return {};
}