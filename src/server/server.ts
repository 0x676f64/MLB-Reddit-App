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

  // ── Scheduler endpoints ───────────────────────────────────────────────
  if (pathname === "/internal/scheduler/postgame-sweep") {
    await onCronPostgameSweep();
    writeJSON<PartialJsonValue>(200, { ok: true } as PartialJsonValue, rsp);
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
 * Called by the splash the moment its poll cycle sees the game has gone
 * Final. Server re-validates by fetching the feed, then creates the
 * postgame thread if all conditions are met. Idempotent via dedup keys.
 */
async function onPostgameCheck(rsp: ServerResponse): Promise<void> {
  const subId = context.subredditId;
  const postId = context.postId;
  if (!subId || !postId) {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  const gamePkStr = await redis.get(`post-game:${postId}`);
  if (!gamePkStr) {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  const enabled = await getAutoPostgameSetting();
  if (!enabled) {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

  const pgKey = `postgame:${subId}:${gamePkStr}`;
  if (await redis.get(pgKey)) {
    writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
    return;
  }

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

  // 12-hour age window
  const gameDateTime = feed?.gameData?.datetime?.dateTime;
  if (gameDateTime) {
    const ageMs = Date.now() - new Date(gameDateTime).getTime();
    if (ageMs > 12 * 60 * 60 * 1000) {
      console.log(`postgame-check: skipped gamePk ${gamePkStr} (game too old: ${Math.round(ageMs / 3600000)}h)`);
      writeJSON<PartialJsonValue>(200, { created: false } as PartialJsonValue, rsp);
      return;
    }
  }

  const teamId = await getTeamIdFilter();
  const customTitles = await getCustomPostgameTitles();

  try {
    const post = await reddit.submitCustomPost({
      title: buildPostgameTitleFromFeed(feed, teamId, customTitles),
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

/**
 * Read the optional custom postgame title templates for wins and losses.
 * Both default to empty string when unset, which means "use the default
 * format". Only meaningful when a specific team is configured in the
 * team filter — for "All Teams" subs, there's no concept of your team
 * winning or losing.
 */
async function getCustomPostgameTitles(): Promise<{ win: string; loss: string }> {
  const normalize = (raw: unknown): string => {
    if (Array.isArray(raw)) return (raw[0] ?? "").toString().trim();
    if (typeof raw === "string") return raw.trim();
    return "";
  };

  try {
    const winRaw = await settings.get<string | string[]>("postgameWinTitle");
    const lossRaw = await settings.get<string | string[]>("postgameLossTitle");
    return {
      win: normalize(winRaw),
      loss: normalize(lossRaw),
    };
  } catch (e) {
    console.error("getCustomPostgameTitles error:", e);
    return { win: "", loss: "" };
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

function yesterdayDateStr(): string {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return yesterday.toLocaleDateString("sv-SE", { timeZone: "America/New_York" });
}

async function fetchGamesForDate(date: string, teamId: string | null): Promise<any[]> {
  try {
    const r = await fetch(scheduleUrl(date, teamId));
    const data: any = await r.json();
    return data?.dates?.[0]?.games || [];
  } catch (e) {
    console.error(`fetchGamesForDate failed for ${date}:`, e);
    return [];
  }
}

async function fetchRecentGames(teamId: string | null): Promise<any[]> {
  const [today, yesterday] = await Promise.all([
    fetchGamesForDate(todayDateStr(), teamId),
    fetchGamesForDate(yesterdayDateStr(), teamId),
  ]);

  const seen = new Set<number>();
  const combined: any[] = [];
  for (const g of [...today, ...yesterday]) {
    const pk = g?.gamePk;
    if (typeof pk === "number" && !seen.has(pk)) {
      seen.add(pk);
      combined.push(g);
    }
  }
  return combined;
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
 * Substitute {team}, {opp}, {teamScore}, {oppScore} placeholders in a
 * custom title template.
 */
function applyTitleTemplate(
  template: string,
  team: string,
  opp: string,
  teamScore: number,
  oppScore: number,
): string {
  return template
    .replace(/\{team\}/g, team)
    .replace(/\{opp\}/g, opp)
    .replace(/\{teamScore\}/g, String(teamScore))
    .replace(/\{oppScore\}/g, String(oppScore));
}

/**
 * Postgame thread title using the schedule API format. If a team filter
 * is set AND a matching custom title template is provided, that template
 * is applied. Otherwise falls back to the standard format.
 */
function buildPostgameThreadTitle(
  game: any,
  teamId: string | null,
  customTitles: { win: string; loss: string },
): string {
  const awayName = game?.teams?.away?.team?.name || "Away";
  const homeName = game?.teams?.home?.team?.name || "Home";
  const homeId = String(game?.teams?.home?.team?.id ?? "");
  const awayId = String(game?.teams?.away?.team?.id ?? "");
  const awayScore = game?.teams?.away?.score ?? 0;
  const homeScore = game?.teams?.home?.score ?? 0;

  // No team filter — use default format, no custom titles possible
  if (!teamId) {
    return `Postgame Thread: ${awayName} ${awayScore} @ ${homeName} ${homeScore}`;
  }

  const isHomeYourTeam = teamId === homeId;
  const isAwayYourTeam = teamId === awayId;
  if (!isHomeYourTeam && !isAwayYourTeam) {
    return `Postgame Thread: ${awayName} ${awayScore} @ ${homeName} ${homeScore}`;
  }

  const teamName = isHomeYourTeam ? homeName : awayName;
  const oppName = isHomeYourTeam ? awayName : homeName;
  const teamScore = isHomeYourTeam ? homeScore : awayScore;
  const oppScore = isHomeYourTeam ? awayScore : homeScore;
  const teamWon = teamScore > oppScore;

  const template = teamWon ? customTitles.win : customTitles.loss;
  if (template) {
    return applyTitleTemplate(template, teamName, oppName, teamScore, oppScore);
  }

  // Default format
  if (isHomeYourTeam) {
    return `Postgame Thread: ${homeName} ${homeScore} vs ${awayName} ${awayScore}`;
  }
  return `Postgame Thread: ${awayName} ${awayScore} @ ${homeName} ${homeScore}`;
}

/**
 * Postgame thread title using the live feed format (different shape than
 * the schedule API). Custom title logic mirrors buildPostgameThreadTitle.
 */
function buildPostgameTitleFromFeed(
  feed: any,
  teamId: string | null,
  customTitles: { win: string; loss: string },
): string {
  const awayName = feed?.gameData?.teams?.away?.name || "Away";
  const homeName = feed?.gameData?.teams?.home?.name || "Home";
  const homeId = String(feed?.gameData?.teams?.home?.id ?? "");
  const awayId = String(feed?.gameData?.teams?.away?.id ?? "");
  const awayScore = feed?.liveData?.linescore?.teams?.away?.runs ?? 0;
  const homeScore = feed?.liveData?.linescore?.teams?.home?.runs ?? 0;

  if (!teamId) {
    return `Postgame Thread: ${awayName} ${awayScore} @ ${homeName} ${homeScore}`;
  }

  const isHomeYourTeam = teamId === homeId;
  const isAwayYourTeam = teamId === awayId;
  if (!isHomeYourTeam && !isAwayYourTeam) {
    return `Postgame Thread: ${awayName} ${awayScore} @ ${homeName} ${homeScore}`;
  }

  const teamName = isHomeYourTeam ? homeName : awayName;
  const oppName = isHomeYourTeam ? awayName : homeName;
  const teamScore = isHomeYourTeam ? homeScore : awayScore;
  const oppScore = isHomeYourTeam ? awayScore : homeScore;
  const teamWon = teamScore > oppScore;

  const template = teamWon ? customTitles.win : customTitles.loss;
  if (template) {
    return applyTitleTemplate(template, teamName, oppName, teamScore, oppScore);
  }

  if (isHomeYourTeam) {
    return `Postgame Thread: ${homeName} ${homeScore} vs ${awayName} ${awayScore}`;
  }
  return `Postgame Thread: ${awayName} ${awayScore} @ ${homeName} ${homeScore}`;
}

/**
 * Title for a postponement notice thread. Includes the postponement
 * reason in parentheses if MLB provided one (Rain, Inclement Weather,
 * Field Conditions, etc.).
 */
function buildPostponedThreadTitle(game: any, teamId: string | null): string {
  const away = game?.teams?.away?.team?.name || "Away";
  const home = game?.teams?.home?.team?.name || "Home";
  const homeId = String(game?.teams?.home?.team?.id ?? "");
  const reason = game?.status?.reason ? ` (${game.status.reason})` : "";

  if (teamId && teamId === homeId) {
    return `Postponed: ${home} vs ${away}${reason}`;
  }
  return `Postponed: ${away} @ ${home}${reason}`;
}

// ════════════════════════════════════════════════════════════════════════
// Postponement + Postgame handling (shared helper)
// ════════════════════════════════════════════════════════════════════════

/**
 * For a given game, decide whether it warrants a postponement notice or
 * a postgame thread, and create the appropriate post if needed.
 *
 * Returns:
 *   - "postponed" if a postponement notice was created
 *   - "postgame"  if a postgame thread was created
 *   - "skipped"   if nothing was created (dedup hit, not yet final, etc.)
 *   - "failed"    if the post submission threw
 *
 * Shared between the cron sweep and the manual menu so the logic only
 * lives in one place.
 */
async function handlePostgameOrPostponement(
  game: any,
  subredditId: string,
  teamId: string | null,
  customTitles: { win: string; loss: string },
): Promise<"postponed" | "postgame" | "skipped" | "failed"> {
  const pk = game?.gamePk;
  if (!pk) return "skipped";

  // Every event-end thread requires a Game Thread to have been posted first
  const gameDedupKey = `posted:${subredditId}:${pk}`;
  if (!(await redis.get(gameDedupKey))) return "skipped";

  const codedState = game?.status?.codedGameState;
  const abstractState = game?.status?.abstractGameState;

  // Postponement branch
  if (codedState === "D") {
    const postponedKey = `postponed:${subredditId}:${pk}`;
    if (await redis.get(postponedKey)) return "skipped";

    try {
      const post = await reddit.submitCustomPost({
        title: buildPostponedThreadTitle(game, teamId),
      });
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
      await redis.set(`post-game:${post.id}`, String(pk), { expiration: expiresAt });
      await redis.set(postponedKey, post.id, { expiration: expiresAt });
      console.log(`postponed: created ${post.id} for gamePk ${pk}`);
      return "postponed";
    } catch (e) {
      console.error(`postponed post failed for gamePk ${pk}:`, e);
      return "failed";
    }
  }

  // Postgame branch — only for actually-completed games
  if (abstractState !== "Final") return "skipped";
  if (codedState === "C") return "skipped"; // cancelled

  // 12-hour age window
  const gameDateTime = game?.gameDate;
  if (gameDateTime) {
    const ageMs = Date.now() - new Date(gameDateTime).getTime();
    if (ageMs > 12 * 60 * 60 * 1000) return "skipped";
  }

  const pgKey = `postgame:${subredditId}:${pk}`;
  if (await redis.get(pgKey)) return "skipped";

  try {
    const post = await reddit.submitCustomPost({
      title: buildPostgameThreadTitle(game, teamId, customTitles),
    });
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
    await redis.set(`post-game:${post.id}`, String(pk), { expiration: expiresAt });
    await redis.set(pgKey, post.id, { expiration: expiresAt });
    console.log(`postgame: created ${post.id} for gamePk ${pk}`);
    return "postgame";
  } catch (e) {
    console.error(`postgame post failed for gamePk ${pk}:`, e);
    return "failed";
  }
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
  const games = await fetchGamesForDate(todayDateStr(), teamId);

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
 * Manual fallback: scan today + yesterday's schedules and create event-end
 * threads (postponement notices or postgame threads) for any qualifying
 * games that don't yet have one.
 */
async function onMenuPostPostgame(): Promise<UiResponse> {
  const subredditId = context.subredditId;
  if (!subredditId) {
    return { showToast: { text: "No subreddit context.", appearance: "neutral" } };
  }

  const teamId = await getTeamIdFilter();
  const customTitles = await getCustomPostgameTitles();
  const games = await fetchRecentGames(teamId);

  if (!games.length) {
    return { showToast: { text: "No recent games found.", appearance: "neutral" } };
  }

  let postgameCreated = 0;
  let postponedCreated = 0;
  let failed = 0;

  for (const game of games) {
    const result = await handlePostgameOrPostponement(game, subredditId, teamId, customTitles);
    if (result === "postgame") postgameCreated++;
    else if (result === "postponed") postponedCreated++;
    else if (result === "failed") failed++;
  }

  if (postgameCreated === 0 && postponedCreated === 0 && failed === 0) {
    return {
      showToast: {
        text: "Nothing new to post — all completed games already have threads.",
        appearance: "neutral",
      },
    };
  }

  const parts: string[] = [];
  if (postgameCreated > 0) parts.push(`${postgameCreated} postgame`);
  if (postponedCreated > 0) parts.push(`${postponedCreated} postponement`);
  if (failed > 0) parts.push(`${failed} failed`);
  const msg = `Posted ${parts.join(", ")} thread(s).`;

  return {
    showToast: {
      text: msg,
      appearance: postgameCreated + postponedCreated > 0 ? "success" : "neutral",
    },
  };
}

/**
 * Backup safety net for splash-based postgame detection AND the primary
 * detection path for postponements. Runs every minute. Same logic as the
 * manual menu, just without the UI response.
 */
async function onCronPostgameSweep(): Promise<void> {
  const subredditId = context.subredditId;
  if (!subredditId) return;

  const enabled = await getAutoPostgameSetting();
  // Note: autoPostgame setting only gates postgame threads; postponement
  // notices fire regardless because they're informational, not celebratory.
  // If you want to gate postponements on the same setting, add a check here.

  const teamId = await getTeamIdFilter();
  const customTitles = await getCustomPostgameTitles();
  const games = await fetchRecentGames(teamId);

  for (const game of games) {
    // Honor autoPostgame: if disabled, only do postponements, not postgames
    if (!enabled) {
      const codedState = game?.status?.codedGameState;
      if (codedState !== "D") continue;
    }
    await handlePostgameOrPostponement(game, subredditId, teamId, customTitles);
  }
}

async function onMenuClearTodayDedup(): Promise<UiResponse> {
  const subredditId = context.subredditId;
  if (!subredditId) {
    return { showToast: { text: "No subreddit context.", appearance: "neutral" } };
  }

  const teamId = await getTeamIdFilter();
  const games = await fetchGamesForDate(todayDateStr(), teamId);

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

    // Postponement dedup
    const ppKey = `postponed:${subredditId}:${pk}`;
    const linkedPpPostId = await redis.get(ppKey);
    if (linkedPpPostId) {
      await redis.del(ppKey);
      await redis.del(`post-game:${linkedPpPostId}`);
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

## Three types of automated threads

The app creates up to three types of discussion threads per game:

- **Game Thread** — Posted manually by you when you run the "Post today's MLB game threads" menu. Captures live, in-game reactions.
- **Postgame Thread** — Posted automatically the moment a game ends. Includes the final score in the title and captures postgame analysis.
- **Postponement Notice** — Posted automatically when MLB officially postpones a game. Includes the reason (Rain, Field Conditions, etc.) when available.

This matches the discussion pattern of most established sports subreddits and keeps live, postgame, and postponement conversations separate. If you prefer single-thread style, disable **Auto-post postgame threads** in the settings — postponement notices will still fire, since they're informational.

## Custom postgame titles (optional)

If your subreddit has a signature postgame phrase — "Theeee Yankees Win!", "Lets Go Mets!", "It's right there in front of us!" — you can set these as custom titles in the app settings:

- **Postgame Win Title** — used when your configured team wins
- **Postgame Loss Title** — used when your configured team loses

Both fields support placeholders:

- \`{team}\` — your team's name
- \`{opp}\` — opponent's name
- \`{teamScore}\` — your team's score
- \`{oppScore}\` — opponent's score

**Example:** \`THEEEE YANKEES WIN! {team} {teamScore}, {opp} {oppScore}\` produces \`THEEEE YANKEES WIN! New York Yankees 7, Boston Red Sox 3\`.

Leave both blank to use the default format. Only applies when a specific team is configured in the Team Filter — for "All Teams" subs, the default format is always used.

## Quick setup

1. Open **Mod Tools → Community Apps → mlb-scores → Settings**.
2. Under **MLB Team Filter**, choose one of:
   - **Your team** — for team subreddits like r/Reds, r/Yankees, or r/Dodgers.
   - **All Teams (post every game)** — for league-wide subreddits.
3. Confirm **Auto-post postgame threads** is set to your preference (on by default).
4. (Optional) Set custom **Postgame Win Title** and **Postgame Loss Title** if your sub has signature phrases.
5. Click **Save**.
6. When you're ready to post today's threads, open the moderator menu on your subreddit and select **"Post today's MLB game threads."** Postgame threads and postponement notices will follow automatically.

## Recovering removed threads

If you delete or remove any thread the bot created, the system detects the removal and automatically allows it to be re-posted. If a thread doesn't come back on its own, run **"Allow re-posting removed game threads"** from the moderator menu. For postgame or postponement threads specifically, you can also run **"Post postgame threads for completed games"** to create any that were missed.

## On duplicate prevention

If you click the posting menu twice on the same day, the bot will skip games it has already posted and only add new ones (such as the second game of a doubleheader added mid-day).

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
 * Remove the dedup keys (Game Thread, Postgame Thread, AND Postponement
 * notice) associated with a given post ID. Safe to call on unknown
 * postIds — silently no-ops if no mapping exists.
 */
async function cleanDedupForPost(postId: string): Promise<void> {
  const gamePk = await redis.get(`post-game:${postId}`);
  if (!gamePk) return;

  const subId = context.subredditId;
  if (subId) {
    const gameKey = `posted:${subId}:${gamePk}`;
    const pgKey = `postgame:${subId}:${gamePk}`;
    const ppKey = `postponed:${subId}:${gamePk}`;

    // Only clear whichever namespace this post belongs to
    const gameLinked = await redis.get(gameKey);
    if (gameLinked === postId) await redis.del(gameKey);

    const pgLinked = await redis.get(pgKey);
    if (pgLinked === postId) await redis.del(pgKey);

    const ppLinked = await redis.get(ppKey);
    if (ppLinked === postId) await redis.del(ppKey);
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
