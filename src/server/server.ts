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

  // ── Moderator menu endpoints ──────────────────────────────────────────
  if (pathname === "/internal/menu/post-all-today") {
    const result = await onMenuPostAllGames();
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

// ════════════════════════════════════════════════════════════════════════
// Settings helpers
// ════════════════════════════════════════════════════════════════════════

/**
 * Read the per-subreddit teamId setting.
 * Returns null if unset, blank, or non-numeric so the schedule call falls
 * back to fetching all games instead of erroring out.
 *
 * Devvit's select setting returns an array at runtime even though the
 * schema's defaultValue is a plain string, so we handle both shapes.
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

function scheduleUrl(date: string, teamId: string | null): string {
  const base = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`;
  return teamId ? `${base}&teamId=${teamId}` : base;
}

// ════════════════════════════════════════════════════════════════════════
// Date / title helpers
// ════════════════════════════════════════════════════════════════════════

/**
 * Anchor "today" to US Eastern Time so the date matches MLB's scheduling day.
 * The Devvit server runs in UTC, which would otherwise treat evening ET
 * as "tomorrow". sv-SE locale conveniently outputs ISO YYYY-MM-DD.
 */
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
 * Build the game-thread title.
 *
 * If the configured team filter matches the HOME team, format the title with
 * the home team leading ("Reds vs Mets") — the team-sub's perspective.
 * Otherwise use the standard "Away @ Home" format.
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

## Quick setup

1. Open **Mod Tools → Community Apps → mlb-scores → Settings**.
2. Under **MLB Team Filter**, choose one of:
   - **Your team** — for team subreddits like r/Reds, r/Yankees, or r/Dodgers. Game Threads will only post for that team's games.
   - **All Teams (post every game)** — for league-wide subreddits that cover the full slate. The bot will post a Game Thread for every MLB game on today's schedule.
3. Click **Save**.
4. When you're ready to post today's threads, open the moderator menu on your subreddit and select **"Post today's MLB game threads."** The bot reads your team setting and posts only what applies.

You can change the team filter at any time — each existing Game Thread is locked to its own game's data, so switching teams later doesn't affect threads already posted.

## On duplicate prevention

If you click the menu twice on the same day, the bot will skip games it has already posted and only add new ones (such as the second game of a doubleheader added mid-day). If you delete a Game Thread the bot created, the system will automatically recognize the removal and allow that game to be re-posted on the next menu run. Tomorrow's games carry their own IDs and will post normally without any cleanup on your end.

## Questions or feedback

Reach out to u/0xgod with anything — feature requests, bug reports, suggestions. This is built for your community; it should work the way you want it to.

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
 * Auto-clean dedup keys when a Game Thread is deleted.
 *
 * If a mod removes one of our posts, this trigger wipes both Redis entries
 * for that post so the bulk-poster menu can re-post the game cleanly.
 * Non-bot posts pass through silently (no mapping → no cleanup).
 */
async function onPostDelete(req: IncomingMessage): Promise<TriggerResponse> {
  try {
    const body = await readJSON<{ postId?: string; post?: { id?: string } }>(req);
    const postId = body?.postId || body?.post?.id;
    if (!postId) {
      console.warn("onPostDelete: no postId in event payload", body);
      return {};
    }

    const gamePk = await redis.get(`post-game:${postId}`);
    if (!gamePk) return {}; // Not one of our posts — nothing to clean.

    const subId = context.subredditId;
    if (subId) {
      await redis.del(`posted:${subId}:${gamePk}`);
    }
    await redis.del(`post-game:${postId}`);

    console.log(`Cleaned dedup for deleted post ${postId} (gamePk ${gamePk})`);
  } catch (e) {
    console.error("onPostDelete error:", e);
  }
  return {};
}