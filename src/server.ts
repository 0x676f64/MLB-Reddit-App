import type { IncomingMessage, ServerResponse } from "node:http";
import { context, reddit, redis, settings } from "@devvit/web/server";
import type { PartialJsonValue, UiResponse } from "@devvit/web/shared";

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
  if (pathname.startsWith("/api/logo/")) {
    const teamId = pathname.slice("/api/logo/".length).replace(/\.svg$/, "");
    await onLogo(teamId, rsp);
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
  if (pathname === "/internal/menu/clear-today-dedup") {
    const result = await onMenuClearTodayDedup();
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

async function onLogo(teamId: string, rsp: ServerResponse): Promise<void> {
  if (!/^\d+$/.test(teamId)) {
    writeJSON<ErrorResponse>(400, { error: "Invalid team ID", status: 400 }, rsp);
    return;
  }
  try {
    const r = await fetch(
      `https://www.mlbstatic.com/team-logos/${teamId}.svg`,
    );
    if (!r.ok) {
      console.error(`Logo upstream ${teamId}: ${r.status} ${r.statusText}`);
      writeJSON<ErrorResponse>(404, { error: `Upstream ${r.status}`, status: 404 }, rsp);
      return;
    }
    const svg = await r.text();
    writeJSON<PartialJsonValue>(200, { svg } as PartialJsonValue, rsp);
  } catch (e) {
    console.error(`onLogo error for ${teamId}:`, e);
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
 * Handles both the array shape (select with multi-select default) and the
 * plain string shape, since Devvit's schema can return either depending on
 * the field type.
 */
async function getTeamIdFilter(): Promise<string | null> {
  try {
    const raw = await settings.get<string | string[]>("teamId");

    // Devvit's select setting returns an array at runtime even though the
    // schema's defaultValue is typed as a plain string. Handle both shapes.
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
    const dedupKey = `posted:${subredditId}:${pk}`;
    const linkedPostId = await redis.get(dedupKey);
    if (linkedPostId) {
      await redis.del(dedupKey);
      await redis.del(`post-game:${linkedPostId}`);
      cleared++;
    }
  }

  return {
    showToast: {
      text: `Cleared ${cleared} dedup key(s).`,
      appearance: cleared > 0 ? "success" : "neutral",
    },
  };
}