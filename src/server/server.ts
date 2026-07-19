import type { IncomingMessage, ServerResponse } from "node:http";
import { once } from "node:events";
import { context, reddit, redis, settings } from "@devvit/web/server";
import type { PartialJsonValue, TriggerResponse, UiResponse } from "@devvit/web/shared";

// ════════════════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════════════════

const TEAM_NAMES: Record<string, string> = {
  "108": "Los Angeles Angels",
  "109": "Arizona Diamondbacks",
  "110": "Baltimore Orioles",
  "111": "Boston Red Sox",
  "112": "Chicago Cubs",
  "113": "Cincinnati Reds",
  "114": "Cleveland Guardians",
  "115": "Colorado Rockies",
  "116": "Detroit Tigers",
  "117": "Houston Astros",
  "118": "Kansas City Royals",
  "119": "Los Angeles Dodgers",
  "120": "Washington Nationals",
  "121": "New York Mets",
  "133": "Athletics",
  "134": "Pittsburgh Pirates",
  "135": "San Diego Padres",
  "136": "Seattle Mariners",
  "137": "San Francisco Giants",
  "138": "St. Louis Cardinals",
  "139": "Tampa Bay Rays",
  "140": "Texas Rangers",
  "141": "Toronto Blue Jays",
  "142": "Minnesota Twins",
  "143": "Philadelphia Phillies",
  "144": "Atlanta Braves",
  "145": "Chicago White Sox",
  "146": "Miami Marlins",
  "147": "New York Yankees",
  "158": "Milwaukee Brewers",
};

// ════════════════════════════════════════════════════════════════════════
// Redis expiration helpers
// ════════════════════════════════════════════════════════════════════════

// Dedup keys only need to live long enough to prevent same-day or
// next-day re-posts. Three days is plenty.
function dedupExpiresAt(): Date {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
}

// Render keys (`post-game:{postId}`, `post-type:{postId}`) need to live
// as long as the Reddit post is likely to be viewed. Reddit archives
// posts at 6 months by default, after which engagement drops to near
// zero, so 180 days covers the entire useful lifespan.
function renderExpiresAt(): Date {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 180);
}

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

// ─────────────────────────────────────────────────────────────────────────────
//  CACHE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
 
const GAME_CACHE_TTL_S = 8;       // live feed — pitch-by-pitch, refreshes ~every 10s
const SCHEDULE_CACHE_TTL_S = 30;  // schedule — changes slowly
const WINPROB_CACHE_TTL_S = 12;   // win probability — per play
 
// Like writeJSON, but writes an already-serialized JSON string as-is. Lets a
// cache hit go straight to the wire without a parse/re-stringify round trip.
function writeRawJSON(status: number, body: string, rsp: ServerResponse): void {
  rsp.writeHead(status, {
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "application/json",
  });
  rsp.end(body);
}
 
// Serve `url` as JSON, backed by a short-lived Redis cache under `cacheKey`.
// See the header comment for the safety/fallback contract.
async function proxyMlbJsonCached(
  cacheKey: string,
  url: string,
  ttlSeconds: number,
  rsp: ServerResponse,
): Promise<void> {
  // Cache read — a failure here is non-fatal; we just fall through to a fetch.
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      writeRawJSON(200, cached, rsp);
      return;
    }
  } catch (e) {
    console.error(`cache read failed for ${cacheKey}:`, e);
  }
 
  try {
    const r = await fetch(url);
    const text = await r.text();
    if (r.ok) {
      // Cache write — a failure here (e.g. value too large for Redis) is also
      // non-fatal; we serve the freshly-fetched body uncached. If these show up
      // in the logs frequently, the feed payload is exceeding the Redis value
      // limit and we can switch to caching a trimmed subset.
      try {
        await redis.set(cacheKey, text, {
          expiration: new Date(Date.now() + ttlSeconds * 1000),
        });
      } catch (e) {
        console.error(`cache write failed for ${cacheKey}:`, e);
      }
      writeRawJSON(200, text, rsp);
    } else {
      // Pass upstream errors through uncached so the client can retry.
      writeRawJSON(
        r.status,
        text || `{"error":"upstream ${r.status}","status":${r.status}}`,
        rsp,
      );
    }
  } catch (e) {
    writeJSON<ErrorResponse>(500, { error: String(e), status: 500 }, rsp);
  }
}

// ════════════════════════════════════════════════════════════════════════
// MLB Stats API proxies (called by the splash)
// ════════════════════════════════════════════════════════════════════════

async function onSchedule(urlObj: URL, rsp: ServerResponse): Promise<void> {
  const date = urlObj.searchParams.get("date");
  // Tightened from a bare presence check to a shape check — the client always
  // sends sv-SE (YYYY-MM-DD), and this keeps a junk value out of the cache key.
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    writeJSON<ErrorResponse>(400, { error: "Missing or invalid date param", status: 400 }, rsp);
    return;
  }
  await proxyMlbJsonCached(
    `mlbcache:sched:${date}`,
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`,
    SCHEDULE_CACHE_TTL_S,
    rsp,
  );
}
 
async function onGame(pk: string, rsp: ServerResponse): Promise<void> {
  // Adds the gamePk guard onGame was missing (onWinProb already had it).
  if (!/^\d+$/.test(pk)) {
    writeJSON<ErrorResponse>(400, { error: "Invalid gamePk", status: 400 }, rsp);
    return;
  }
  await proxyMlbJsonCached(
    `mlbcache:game:${pk}`,
    `https://statsapi.mlb.com/api/v1.1/game/${pk}/feed/live`,
    GAME_CACHE_TTL_S,
    rsp,
  );
}
 
async function onWinProb(pk: string, rsp: ServerResponse): Promise<void> {
  if (!/^\d+$/.test(pk)) {
    writeJSON<ErrorResponse>(400, { error: "Invalid gamePk", status: 400 }, rsp);
    return;
  }
  await proxyMlbJsonCached(
    `mlbcache:winprob:${pk}`,
    `https://statsapi.mlb.com/api/v1/game/${pk}/winProbability`,
    WINPROB_CACHE_TTL_S,
    rsp,
  );
}

async function onPostGame(rsp: ServerResponse): Promise<void> {
  if (!context.postId) {
    writeJSON<PartialJsonValue>(200, { gamePk: null, postType: null } as PartialJsonValue, rsp);
    return;
  }
  try {
    const val = await redis.get(`post-game:${context.postId}`);
    const postType = await redis.get(`post-type:${context.postId}`);
    const gamePk = val ? Number(val) : null;
    writeJSON<PartialJsonValue>(200, { gamePk, postType: postType || null } as PartialJsonValue, rsp);
  } catch (e) {
    console.error("onPostGame error:", e);
    writeJSON<PartialJsonValue>(200, { gamePk: null, postType: null } as PartialJsonValue, rsp);
  }
}

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

  const gameDateTime = feed?.gameData?.datetime?.dateTime;
  if (gameDateTime) {
    const ageMs = Date.now() - new Date(gameDateTime).getTime();
    if (ageMs > 36 * 60 * 60 * 1000) {
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
    await redis.set(`post-game:${post.id}`, gamePkStr, { expiration: renderExpiresAt() });
    await redis.set(`post-type:${post.id}`, "postgame", { expiration: renderExpiresAt() });
    await redis.set(pgKey, post.id, { expiration: dedupExpiresAt() });

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
// Date helpers
// ════════════════════════════════════════════════════════════════════════

function todayDateStr(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/New_York" });
}

function yesterdayDateStr(): string {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return yesterday.toLocaleDateString("sv-SE", { timeZone: "America/New_York" });
}

function dateOffsetStr(daysOffset: number): string {
  const d = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString("sv-SE", { timeZone: "America/New_York" });
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

/**
 * Fetch a team's schedule over a date range (default 7 days back, 7 days
 * forward). Used by the off-day discussion thread to populate last-game
 * and next-game info.
 */
async function fetchTeamScheduleRange(
  teamId: string,
  daysBack: number = 7,
  daysForward: number = 7,
): Promise<any[]> {
  const startStr = dateOffsetStr(-daysBack);
  const endStr = dateOffsetStr(daysForward);

  try {
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${teamId}&startDate=${startStr}&endDate=${endStr}`;
    const r = await fetch(url);
    const data: any = await r.json();
    const allGames: any[] = [];
    for (const date of data?.dates || []) {
      for (const game of date?.games || []) {
        allGames.push(game);
      }
    }
    return allGames;
  } catch (e) {
    console.error("fetchTeamScheduleRange error:", e);
    return [];
  }
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

function formatDateShortET(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

// ════════════════════════════════════════════════════════════════════════
// Game type / context helpers
// ════════════════════════════════════════════════════════════════════════

function getGameType(game: any): string {
  return (
    game?.gameType ||
    game?.gameData?.game?.type ||
    game?.game?.type ||
    "R"
  );
}

function getSeriesDescription(game: any): string {
  return (
    game?.seriesDescription ||
    game?.gameData?.game?.seriesDescription ||
    ""
  );
}

function getSeriesGameNumber(game: any): number | null {
  const num =
    game?.seriesGameNumber ||
    game?.gameData?.game?.seriesGameNumber ||
    null;
  return typeof num === "number" ? num : null;
}

function getDoubleHeaderInfo(game: any): { isDH: boolean; gameNum: number | null } {
  const dh =
    game?.doubleHeader ||
    game?.gameData?.game?.doubleHeader ||
    "N";
  const numRaw =
    game?.gameNumber ||
    game?.gameData?.game?.gameNumber ||
    null;
  const gameNum = typeof numRaw === "number" ? numRaw : null;
  return { isDH: dh !== "N", gameNum };
}

function abbreviateSeriesDesc(desc: string): string {
  if (!desc) return "Postseason";
  if (/world series/i.test(desc)) return "World Series";
  if (/american league championship/i.test(desc)) return "ALCS";
  if (/national league championship/i.test(desc)) return "NLCS";
  if (/american league division/i.test(desc)) return "ALDS";
  if (/national league division/i.test(desc)) return "NLDS";
  if (/american league wild card/i.test(desc)) return "AL Wild Card";
  if (/national league wild card/i.test(desc)) return "NL Wild Card";
  if (/wild card/i.test(desc)) return "Wild Card";
  return desc;
}

function getCustomTitleContext(game: any): string {
  const gameType = getGameType(game);

  if (["F", "D", "L", "W"].includes(gameType)) {
    const seriesPrefix = abbreviateSeriesDesc(getSeriesDescription(game));
    const seriesGameNum = getSeriesGameNumber(game);
    const gameNumStr = seriesGameNum ? ` Game ${seriesGameNum}` : "";
    return `[${seriesPrefix}${gameNumStr}] `;
  }

  if (gameType === "S") return "[Spring Training] ";
  if (gameType === "A") return "[All-Star Game] ";
  if (gameType === "E") return "[Exhibition] ";

  return "";
}

function getGamePrefix(game: any, isPostgame: boolean): string {
  const gameType = getGameType(game);

  if (["F", "D", "L", "W"].includes(gameType)) {
    const seriesPrefix = abbreviateSeriesDesc(getSeriesDescription(game));
    const seriesGameNum = getSeriesGameNumber(game);
    const gameNumStr = seriesGameNum ? ` Game ${seriesGameNum}` : "";
    return isPostgame ? `${seriesPrefix}${gameNumStr} Final` : `${seriesPrefix}${gameNumStr}`;
  }

  if (gameType === "S") {
    return isPostgame ? "Spring Training Postgame" : "Spring Training";
  }

  if (gameType === "A") {
    return isPostgame ? "All-Star Game Final" : "All-Star Game";
  }

  if (gameType === "E") {
    return isPostgame ? "Exhibition Postgame" : "Exhibition";
  }

  return isPostgame ? "Postgame Thread" : "Game Thread";
}

function doubleHeaderSuffix(game: any): string {
  const { isDH, gameNum } = getDoubleHeaderInfo(game);
  if (isDH && gameNum) {
    return ` (Game ${gameNum})`;
  }
  return "";
}

// ════════════════════════════════════════════════════════════════════════
// Title builders
// ════════════════════════════════════════════════════════════════════════

function buildGameThreadTitle(game: any, teamId: string | null): string {
  const away = game?.teams?.away?.team?.name || "Away";
  const home = game?.teams?.home?.team?.name || "Home";
  const homeId = String(game?.teams?.home?.team?.id ?? "");
  const time = formatGameTimeET(game?.gameDate || new Date().toISOString());
  const prefix = getGamePrefix(game, false);
  const dhSuffix = doubleHeaderSuffix(game);

  if (teamId && teamId === homeId) {
    return `${prefix}: ${home} vs ${away}${dhSuffix} - ${time}`;
  }
  return `${prefix}: ${away} @ ${home}${dhSuffix} - ${time}`;
}

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
  const prefix = getGamePrefix(game, true);
  const dhSuffix = doubleHeaderSuffix(game);

  if (!teamId) {
    return `${prefix}: ${awayName} ${awayScore} @ ${homeName} ${homeScore}${dhSuffix}`;
  }

  const isHomeYourTeam = teamId === homeId;
  const isAwayYourTeam = teamId === awayId;
  if (!isHomeYourTeam && !isAwayYourTeam) {
    return `${prefix}: ${awayName} ${awayScore} @ ${homeName} ${homeScore}${dhSuffix}`;
  }

  const teamName = isHomeYourTeam ? homeName : awayName;
  const oppName = isHomeYourTeam ? awayName : homeName;
  const teamScore = isHomeYourTeam ? homeScore : awayScore;
  const oppScore = isHomeYourTeam ? awayScore : homeScore;
  const teamWon = teamScore > oppScore;

  const template = teamWon ? customTitles.win : customTitles.loss;
  if (template) {
    const contextPrefix = getCustomTitleContext(game);
    const filled = applyTitleTemplate(template, teamName, oppName, teamScore, oppScore);
    return `${contextPrefix}${filled}${dhSuffix}`;
  }

  if (isHomeYourTeam) {
    return `${prefix}: ${homeName} ${homeScore} vs ${awayName} ${awayScore}${dhSuffix}`;
  }
  return `${prefix}: ${awayName} ${awayScore} @ ${homeName} ${homeScore}${dhSuffix}`;
}

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
  const prefix = getGamePrefix(feed, true);
  const dhSuffix = doubleHeaderSuffix(feed);

  if (!teamId) {
    return `${prefix}: ${awayName} ${awayScore} @ ${homeName} ${homeScore}${dhSuffix}`;
  }

  const isHomeYourTeam = teamId === homeId;
  const isAwayYourTeam = teamId === awayId;
  if (!isHomeYourTeam && !isAwayYourTeam) {
    return `${prefix}: ${awayName} ${awayScore} @ ${homeName} ${homeScore}${dhSuffix}`;
  }

  const teamName = isHomeYourTeam ? homeName : awayName;
  const oppName = isHomeYourTeam ? awayName : homeName;
  const teamScore = isHomeYourTeam ? homeScore : awayScore;
  const oppScore = isHomeYourTeam ? awayScore : homeScore;
  const teamWon = teamScore > oppScore;

  const template = teamWon ? customTitles.win : customTitles.loss;
  if (template) {
    const contextPrefix = getCustomTitleContext(feed);
    const filled = applyTitleTemplate(template, teamName, oppName, teamScore, oppScore);
    return `${contextPrefix}${filled}${dhSuffix}`;
  }

  if (isHomeYourTeam) {
    return `${prefix}: ${homeName} ${homeScore} vs ${awayName} ${awayScore}${dhSuffix}`;
  }
  return `${prefix}: ${awayName} ${awayScore} @ ${homeName} ${homeScore}${dhSuffix}`;
}

function buildPostponedThreadTitle(game: any, teamId: string | null): string {
  const away = game?.teams?.away?.team?.name || "Away";
  const home = game?.teams?.home?.team?.name || "Home";
  const homeId = String(game?.teams?.home?.team?.id ?? "");
  const reason = game?.status?.reason ? ` (${game.status.reason})` : "";
  const dhSuffix = doubleHeaderSuffix(game);

  if (teamId && teamId === homeId) {
    return `Postponed: ${home} vs ${away}${dhSuffix}${reason}`;
  }
  return `Postponed: ${away} @ ${home}${dhSuffix}${reason}`;
}

// ════════════════════════════════════════════════════════════════════════
// Off-day discussion threads
// ════════════════════════════════════════════════════════════════════════

function buildOffDayThreadTitle(teamName: string): string {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
  return `${teamName} Off Day Discussion - ${dateStr}`;
}

function formatLastGameLine(game: any, teamId: string): string {
  const homeId = String(game?.teams?.home?.team?.id ?? "");
  const isHome = teamId === homeId;
  const oppName = isHome ? game?.teams?.away?.team?.name : game?.teams?.home?.team?.name;
  const teamScore = isHome ? (game?.teams?.home?.score ?? 0) : (game?.teams?.away?.score ?? 0);
  const oppScore = isHome ? (game?.teams?.away?.score ?? 0) : (game?.teams?.home?.score ?? 0);
  const wl = teamScore > oppScore ? "W" : (teamScore < oppScore ? "L" : "T");
  const venueDir = isHome ? "vs" : "at";
  const dateStr = formatDateShortET(game.gameDate);
  return `**${dateStr} ${venueDir} ${oppName || "Opponent"}** — ${teamScore}-${oppScore} (${wl})`;
}

function formatNextGameLine(game: any, teamId: string): string {
  const homeId = String(game?.teams?.home?.team?.id ?? "");
  const isHome = teamId === homeId;
  const oppName = isHome ? game?.teams?.away?.team?.name : game?.teams?.home?.team?.name;
  const venueDir = isHome ? "vs" : "at";
  const venueName = game?.venue?.name || "";
  const dateStr = formatDateShortET(game.gameDate);
  const timeStr = formatGameTimeET(game.gameDate);
  return `**${dateStr} at ${timeStr}** — ${venueDir} ${oppName || "Opponent"}${venueName ? `, ${venueName}` : ""}`;
}

async function getOffDayContext(teamId: string): Promise<{ lastGame: any | null; nextGame: any | null }> {
  const games = await fetchTeamScheduleRange(teamId, 7, 7);
  const now = Date.now();

  let lastGame: any = null;
  let nextGame: any = null;
  let lastGameTime = -Infinity;
  let nextGameTime = Infinity;

  for (const game of games) {
    const gameTime = new Date(game.gameDate).getTime();
    const absState = game?.status?.abstractGameState;
    const isFinal = absState === "Final";
    const isUpcoming = absState === "Preview" && gameTime > now;

    if (isFinal && gameTime > lastGameTime && gameTime < now) {
      lastGame = game;
      lastGameTime = gameTime;
    }
    if (isUpcoming && gameTime < nextGameTime) {
      nextGame = game;
      nextGameTime = gameTime;
    }
  }

  return { lastGame, nextGame };
}

function buildOffDayThreadBody(
  teamName: string,
  teamId: string,
  lastGame: any | null,
  nextGame: any | null,
): string {
  let body = `## ${teamName} Off Day\n\n`;
  body += `No game today. Use this thread for general team discussion — news, prospect talk, recent performance, or anything else ${teamName}-related.\n\n`;

  if (lastGame) {
    body += `### Recent Result\n\n`;
    body += formatLastGameLine(lastGame, teamId);
    body += `\n\n`;
  }

  if (nextGame) {
    body += `### Next Game\n\n`;
    body += formatNextGameLine(nextGame, teamId);
    body += `\n\n`;
  }

  body += `---\n\n`;
  body += `*Discussion thread automatically created by MLB Scoreboards on team off days.*`;

  return body;
}

async function maybePostOffDayThread(
  subredditId: string,
  subredditName: string,
  teamId: string,
): Promise<boolean> {
  const teamName = TEAM_NAMES[teamId] || "Team";
  const dateStr = todayDateStr();
  const offDayKey = `offday:${subredditId}:${teamId}:${dateStr}`;

  if (await redis.get(offDayKey)) {
    return false;
  }

  const { lastGame, nextGame } = await getOffDayContext(teamId);
  const title = buildOffDayThreadTitle(teamName);
  const body = buildOffDayThreadBody(teamName, teamId, lastGame, nextGame);

  try {
    const post = await reddit.submitPost({
      subredditName,
      title,
      text: body,
    });
    await redis.set(offDayKey, post.id, { expiration: dedupExpiresAt() });
    await redis.set(`offday-key:${post.id}`, offDayKey, { expiration: renderExpiresAt() });
    console.log(`off-day: created ${post.id} for team ${teamId} on ${dateStr}`);
    return true;
  } catch (e) {
    console.error("Off-day thread submit failed:", e);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════════════
// Postponement + Postgame handling (shared helper)
// ════════════════════════════════════════════════════════════════════════

async function handlePostgameOrPostponement(
  game: any,
  subredditId: string,
  teamId: string | null,
  customTitles: { win: string; loss: string },
): Promise<"postponed" | "postgame" | "skipped" | "failed"> {
  const pk = game?.gamePk;
  if (!pk) return "skipped";

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
      await redis.set(`post-game:${post.id}`, String(pk), { expiration: renderExpiresAt() });
      await redis.set(`post-type:${post.id}`, "postponed", { expiration: renderExpiresAt() });
      await redis.set(postponedKey, post.id, { expiration: dedupExpiresAt() });
      // Release the original Game Thread's dedup so the makeup date can post
      // a fresh Game Thread for this same gamePk (MLB reuses gamePk on reschedule).
      await redis.del(gameDedupKey);
      console.log(`postponed: created ${post.id} for gamePk ${pk}, released gameDedupKey for makeup`);
      return "postponed";
    } catch (e) {
      console.error(`postponed post failed for gamePk ${pk}:`, e);
      return "failed";
    }
  }

  // Postgame branch
  if (abstractState !== "Final") return "skipped";
  if (codedState === "C") return "skipped";

  const gameDateTime = game?.gameDate;
  if (gameDateTime) {
    const ageMs = Date.now() - new Date(gameDateTime).getTime();
    if (ageMs > 36 * 60 * 60 * 1000) return "skipped";
  }

  const pgKey = `postgame:${subredditId}:${pk}`;
  if (await redis.get(pgKey)) return "skipped";

  try {
    const post = await reddit.submitCustomPost({
      title: buildPostgameThreadTitle(game, teamId, customTitles),
    });
    await redis.set(`post-game:${post.id}`, String(pk), { expiration: renderExpiresAt() });
    await redis.set(`post-type:${post.id}`, "postgame", { expiration: renderExpiresAt() });
    await redis.set(pgKey, post.id, { expiration: dedupExpiresAt() });
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
  const subredditName = context.subredditName;
  if (!subredditId || !subredditName) {
    return { showToast: { text: "No subreddit context.", appearance: "neutral" } };
  }

  const teamId = await getTeamIdFilter();
  const games = await fetchGamesForDate(todayDateStr(), teamId);

  if (!games.length) {
    if (teamId) {
      const posted = await maybePostOffDayThread(subredditId, subredditName, teamId);
      if (posted) {
        return {
          showToast: {
            text: "Off Day Discussion thread posted.",
            appearance: "success",
          },
        };
      }
      return {
        showToast: {
          text: "Off Day Discussion thread already posted today.",
          appearance: "neutral",
        },
      };
    }
    return { showToast: { text: "No games today.", appearance: "neutral" } };
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
      await redis.set(`post-game:${post.id}`, String(pk), { expiration: renderExpiresAt() });
      await redis.set(`post-type:${post.id}`, "game", { expiration: renderExpiresAt() });
      await redis.set(dedupKey, post.id, { expiration: dedupExpiresAt() });
      // If this game was previously postponed, release the postponement lock so
      // the cron can fire another postponement notice if it happens again.
      await redis.del(`postponed:${subredditId}:${pk}`);
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

async function onCronPostgameSweep(): Promise<void> {
  const subredditId = context.subredditId;
  if (!subredditId) return;

  const enabled = await getAutoPostgameSetting();
  const teamId = await getTeamIdFilter();
  const customTitles = await getCustomPostgameTitles();
  const games = await fetchRecentGames(teamId);

  for (const game of games) {
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
  const todayStr = todayDateStr();
  const games = await fetchGamesForDate(todayStr, teamId);

  let cleared = 0;

  for (const game of games) {
    const pk = game?.gamePk;
    if (!pk) continue;

    const gameDedupKey = `posted:${subredditId}:${pk}`;
    const linkedGamePostId = await redis.get(gameDedupKey);
    if (linkedGamePostId) {
      await redis.del(gameDedupKey);
      await redis.del(`post-game:${linkedGamePostId}`);
      await redis.del(`post-type:${linkedGamePostId}`);
      cleared++;
    }

    const pgKey = `postgame:${subredditId}:${pk}`;
    const linkedPgPostId = await redis.get(pgKey);
    if (linkedPgPostId) {
      await redis.del(pgKey);
      await redis.del(`post-game:${linkedPgPostId}`);
      await redis.del(`post-type:${linkedPgPostId}`);
      cleared++;
    }

    const ppKey = `postponed:${subredditId}:${pk}`;
    const linkedPpPostId = await redis.get(ppKey);
    if (linkedPpPostId) {
      await redis.del(ppKey);
      await redis.del(`post-game:${linkedPpPostId}`);
      await redis.del(`post-type:${linkedPpPostId}`);
      cleared++;
    }
  }

  if (teamId) {
    const offDayKey = `offday:${subredditId}:${teamId}:${todayStr}`;
    const linkedOffDayPostId = await redis.get(offDayKey);
    if (linkedOffDayPostId) {
      await redis.del(offDayKey);
      await redis.del(`offday-key:${linkedOffDayPostId}`);
      await redis.del(`post-type:${linkedOffDayPostId}`);
      cleared++;
    }
  }

  if (!games.length && cleared === 0) {
    return { showToast: { text: "No games or off-day threads today to clear.", appearance: "neutral" } };
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

# Welcome to MLB Scoreboards

Thanks for installing **MLB Scoreboards** — a live Game Thread experience built for Major League Baseball communities, from team-focused subreddits to league-wide aggregators.

I'm **u/0xgod** — I built this app and run it on r/MLBScoreboards myself. It's actively maintained, and I'm around for questions, bug reports, and feature requests. If anything ever looks off, message me directly.

## What it does

MLB Scoreboards turns each Game Thread into a real-time, data-rich scoreboard. Once a thread is posted, the bot does the rest:

- **Pregame** — Probable starters, season stat lines, first pitch time
- **Live** — Score, count, base/outs scorebug, K-zone with numbered pitch dots, latest pitch chip with velocity and result
- **Box Score** — Batting and pitching tables for both teams, toggleable team view
- **Scoring Plays** and **All Plays** — Every event with mini-scorebug, RBI, and Statcast chips (exit velocity, launch angle, distance)
- **Win Probability** — Inning-by-inning chart, hover or tap any swing to see the play that drove it
- **Final / Wrap** — W/L pitcher decisions, top performers, completed linescore

Threads refresh every 10 seconds while a game is in progress. No further moderator action required after posting.

## What's covered

The app handles every type of MLB game automatically:

- **Regular Season** — Standard "Game Thread" and "Postgame Thread" titles.
- **Spring Training** — Titles use "Spring Training" prefix so they're easy to spot.
- **Postseason** — Titles automatically reflect the series and game number ("ALDS Game 3", "World Series Game 7", "AL Wild Card", etc.).
- **All-Star Game** — Titles use "All-Star Game" prefix.
- **Doubleheaders** — Each game gets a "(Game 1)" / "(Game 2)" suffix so both games are clearly distinguished in the subreddit feed.
- **Postponements** — Automatic notice within ~1 minute of MLB's official announcement, including the reason (Rain, Field Conditions, etc.) when available.
- **Off Days** — For team-specific subreddits, the app posts a discussion thread with last-game and next-game info instead of game threads.

## Three types of automated threads

The app creates up to three types of game-related discussion threads per game:

- **Game Thread** — Posted manually by you when you run the "Post today's MLB game threads" menu. Captures live, in-game reactions.
- **Postgame Thread** — Posted automatically the moment a game ends. Includes the final score in the title and captures postgame analysis.
- **Postponement Notice** — Posted automatically when MLB officially postpones a game.

Plus, on off days for team-specific subs:

- **Off Day Discussion** — Posted via the same menu when there's no game scheduled. Includes last game result and next game info.

If you prefer single-thread style, disable **Auto-post postgame threads** in the settings — postponement notices will still fire, since they're informational.

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

For doubleheaders, "(Game 1)" / "(Game 2)" is automatically appended to your custom title so both games of the doubleheader have unique titles.

## Off-day discussion threads

If your subreddit is configured to follow a specific team, and that team has no game scheduled today, the "Post today's MLB game threads" menu will instead post an **Off Day Discussion** thread. It includes:

- Last game result with score and W/L
- Next scheduled game with date, time, opponent, and venue
- A general team-discussion prompt

This keeps the subreddit active on off days. Off-day threads aren't created for "All Teams" subs — there's always a game somewhere in MLB during the season.

## Quick setup

1. Open **Mod Tools → Community Apps → mlb-scores → Settings**.
2. Under **MLB Team Filter**, choose one of:
   - **Your team** — for team subreddits like r/Reds, r/Yankees, or r/Dodgers.
   - **All Teams (post every game)** — for league-wide subreddits.
3. Confirm **Auto-post postgame threads** is set to your preference (on by default).
4. (Optional) Set custom **Postgame Win Title** and **Postgame Loss Title** if your sub has signature phrases.
5. Click **Save**.
6. When you're ready to post today's threads, open the moderator menu on your subreddit and select **"Post today's MLB game threads."** Postgame threads, postponement notices, and off-day discussions will follow automatically based on context.

## Recovering removed threads

If you delete or remove any thread the bot created, the system detects the removal and automatically allows it to be re-posted. If a thread doesn't come back on its own, run **"Allow re-posting removed game threads"** from the moderator menu. For postgame or postponement threads specifically, you can also run **"Post postgame threads for completed games"** to create any that were missed.

## On duplicate prevention

If you click the posting menu twice on the same day, the bot will skip games it has already posted and only add new ones (such as the second game of a doubleheader added mid-day).

## Questions or feedback

Reach out to me — **u/0xgod** — with anything: feature requests, bug reports, suggestions. This is built for your community; it should work the way you want it to.

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
 * Remove the dedup keys associated with a given post ID. Handles Game
 * Threads, Postgame Threads, Postponement notices, AND Off-Day threads.
 * Safe to call on unknown postIds — silently no-ops if no mapping exists.
 */
async function cleanDedupForPost(postId: string): Promise<void> {
  // Off-day thread cleanup (no gamePk for these)
  const offDayKey = await redis.get(`offday-key:${postId}`);
  if (offDayKey) {
    await redis.del(offDayKey);
    await redis.del(`offday-key:${postId}`);
    await redis.del(`post-type:${postId}`);
    console.log(`Cleaned off-day dedup for post ${postId}`);
    return;
  }

  // Game-related post cleanup
  const gamePk = await redis.get(`post-game:${postId}`);
  if (!gamePk) return;

  const subId = context.subredditId;
  if (subId) {
    const gameKey = `posted:${subId}:${gamePk}`;
    const pgKey = `postgame:${subId}:${gamePk}`;
    const ppKey = `postponed:${subId}:${gamePk}`;

    const gameLinked = await redis.get(gameKey);
    if (gameLinked === postId) await redis.del(gameKey);

    const pgLinked = await redis.get(pgKey);
    if (pgLinked === postId) await redis.del(pgKey);

    const ppLinked = await redis.get(ppKey);
    if (ppLinked === postId) await redis.del(ppKey);
  }
  await redis.del(`post-game:${postId}`);
  await redis.del(`post-type:${postId}`);

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