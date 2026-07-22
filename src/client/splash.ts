// src/client/splash.ts
//
// CHANGES IN THIS REVISION
//   1. Expanded mode  — imports requestExpandedMode/getWebViewMode and injects a
//      full-screen button (setupExpand). Inline web views sit inside Reddit's
//      feed, which captures vertical scroll; expanded mode owns the viewport so
//      native scrolling works with zero touch handlers. Self-contained: no
//      HTML/CSS edits required.
//   2. Polling stops on terminal states (Final / Postponed) — a days-long
//      postgame thread no longer polls the MLB API forever.
//   3. Polling pauses while the post is off-screen (document.hidden) and
//      refreshes the moment it returns to view.
//   4. selectTodaysGame() now resolves "today" in US Eastern (matching the
//      server), not the viewer's local clock.
//
// NOTE: this file now imports from "@devvit/web/client". Make sure your client
// build runs esbuild with platform:"browser" (or conditions:["browser"]) so the
// import resolves to the browser entry rather than the server-panic stub.

import { requestExpandedMode, getWebViewMode } from "@devvit/web/client";

// ── Constants ─────────────────────────────────────────────────────────────

const FINAL_STATES: string[] = [
  "Final", "Game Over", "Final: Tied",
  "Completed Early", "Completed Early: Rain", "Completed Early: Mercy",
  "Cancelled", "Cancelled: Rain"
];
const PRE_GAME_STATES: string[] = ["Pre-Game", "Scheduled", "Warmup"];

const isFinalState = (s: string): boolean => FINAL_STATES.includes(s);
const isPreGameState = (s: string): boolean => PRE_GAME_STATES.includes(s);
const isSuspendedState = (s: string): boolean => s.startsWith("Suspended");
const isLiveState = (s: string): boolean =>
  !isFinalState(s) && !isPreGameState(s) &&
  !["Postponed", "Suspended", "Suspended: Rain", "Cancelled", "Cancelled: Rain", "Delayed"].includes(s);

// A game in one of these states is done changing — nothing left to poll for.
const isTerminalState = (s: string): boolean => isFinalState(s) || s === "Postponed";

// MLB-only team IDs — used by getLogoPath for the dark cap variants
const MLB_TEAM_IDS: Set<number> = new Set([
  108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
  118, 119, 120, 121, 133, 134, 135, 136, 137, 138,
  139, 140, 141, 142, 143, 144, 145, 146, 147, 158
]);

// ── Pitch type catalog ────────────────────────────────────────────────────

type PitchInfo = { label: string; abbr: string; color: string };

const PITCH_MAP: Record<string, PitchInfo> = {
  FF: { label: "4-Seam",    abbr: "FF", color: "#e63946" },
  FA: { label: "4-Seam",    abbr: "FF", color: "#e63946" },
  FT: { label: "2-Seam",    abbr: "FT", color: "#c1121f" },
  SI: { label: "Sinker",    abbr: "SI", color: "#c1121f" },
  FC: { label: "Cutter",    abbr: "FC", color: "#f4a261" },
  SL: { label: "Slider",    abbr: "SL", color: "#2a9d8f" },
  ST: { label: "Sweeper",   abbr: "ST", color: "#fb8500" },
  SV: { label: "Slurve",    abbr: "SV", color: "#3a86ff" },
  CU: { label: "Curve",     abbr: "CU", color: "#457b9d" },
  KC: { label: "Knuck-Cur", abbr: "KC", color: "#457b9d" },
  CS: { label: "Slow Cur",  abbr: "CS", color: "#457b9d" },
  CH: { label: "Change",    abbr: "CH", color: "#8338ec" },
  FS: { label: "Splitter",  abbr: "FS", color: "#06d6a0" },
  FO: { label: "Forkball",  abbr: "FO", color: "#06d6a0" },
  KN: { label: "Knuckle",   abbr: "KN", color: "#adb5bd" },
  EP: { label: "Eephus",    abbr: "EP", color: "#adb5bd" },
  PO: { label: "Pitchout",  abbr: "PO", color: "#6c757d" },
  IN: { label: "Int. Ball", abbr: "IN", color: "#6c757d" },
};

function pitchInfo(code: string | undefined): PitchInfo {
  return PITCH_MAP[code || ""] ||
    { label: code || "?", abbr: code || "?", color: "#94a3b8" };
}

// ── Strike zone geometry ──────────────────────────────────────────────────

const ZONE_W = 120, ZONE_H = 155;
const SZ_LEFT = 22, SZ_RIGHT = 98, SZ_TOP = 24, SZ_BOT = 108;
const SZ_CX: number = (SZ_LEFT + SZ_RIGHT) / 2;
const PX_PER_FT: number = (SZ_RIGHT - SZ_LEFT) / 1.7;
const PZ_TOP_FT = 3.5, PZ_BOT_FT = 1.5;
const DZ_LEFT: number = SZ_LEFT + 6, DZ_RIGHT: number = SZ_RIGHT - 6;
const DZ_TOP: number = SZ_TOP + 5, DZ_BOT: number = SZ_BOT - 12;

function mapPx(pX: number): number { return SZ_CX + pX * PX_PER_FT; }

function mapPz(pZ: number): number {
  return SZ_BOT - ((pZ - PZ_BOT_FT) / (PZ_TOP_FT - PZ_BOT_FT)) * (SZ_BOT - SZ_TOP);
}

// ── Theme-aware SVG palette ────────────────────────────────────────────────
// The DOM flips via CSS tokens, but inline SVG strings bake their colors in, so
// the white-on-dark values here swap to navy-on-light when data-theme="light".
// Reds and the saturated chip colors read fine in both themes and stay put.
type SvgInk = {
  empty: string; faint: string; mid: string; strong: string;
  label: string; grid: string; chartBg: string; dotFill: string; dotRing: string;
};
function svgInk(): SvgInk {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  return light
    ? { empty: "rgba(10,24,40,0.10)", faint: "rgba(10,24,40,0.32)", mid: "rgba(10,24,40,0.30)",
        strong: "rgba(10,24,40,0.62)", label: "rgba(10,24,40,0.50)", grid: "rgba(10,24,40,0.10)",
        chartBg: "rgba(10,24,40,0.05)", dotFill: "#0a1828", dotRing: "rgba(10,24,40,0.6)" }
    : { empty: "rgba(255,255,255,0.08)", faint: "rgba(255,255,255,0.35)", mid: "rgba(255,255,255,0.30)",
        strong: "rgba(255,255,255,0.55)", label: "rgba(255,255,255,0.45)", grid: "rgba(255,255,255,0.08)",
        chartBg: "rgba(255,255,255,0.04)", dotFill: "#fff", dotRing: "rgba(255,255,255,0.6)" };
}

function buildStrikeZoneSVG(pitches: any[]): string {
  const ink = svgInk();
  const dW = DZ_RIGHT - DZ_LEFT, dH = DZ_BOT - DZ_TOP;
  const d3 = dW / 3, d3h = dH / 3;
  const dots = pitches.map((p: any, i: number) => {
    const px = p.pitchData?.coordinates?.pX;
    const pz = p.pitchData?.coordinates?.pZ;
    if (px == null || pz == null) return "";
    const cx = mapPx(px), cy = mapPz(pz);
    const info = pitchInfo(p.details?.type?.code);
    const isLast = i === pitches.length - 1;
    return `<circle cx="${cx}" cy="${cy}" r="${isLast ? 7 : 5}"
      fill="${info.color}" stroke="${isLast ? "#fff" : ink.faint}"
      stroke-width="${isLast ? 2 : 1}" opacity="${isLast ? 1 : 0.65}"/>
      <text x="${cx}" y="${cy + 0.5}" text-anchor="middle" dominant-baseline="middle"
      font-size="${isLast ? 7 : 6}" font-weight="700" fill="white"
      font-family="monospace" pointer-events="none">${i + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${ZONE_W} ${ZONE_H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">
    <rect x="${DZ_LEFT}" y="${DZ_TOP}" width="${dW}" height="${dH}"
      fill="rgba(191,13,61,0.04)" stroke="rgba(191,13,61,0.75)" stroke-width="1.5" rx="1"/>
    <line x1="${DZ_LEFT + d3}" y1="${DZ_TOP}" x2="${DZ_LEFT + d3}" y2="${DZ_BOT}"
      stroke="rgba(191,13,61,0.22)" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT + d3 * 2}" y1="${DZ_TOP}" x2="${DZ_LEFT + d3 * 2}" y2="${DZ_BOT}"
      stroke="rgba(191,13,61,0.22)" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT}" y1="${DZ_TOP + d3h}" x2="${DZ_RIGHT}" y2="${DZ_TOP + d3h}"
      stroke="rgba(191,13,61,0.22)" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT}" y1="${DZ_TOP + d3h * 2}" x2="${DZ_RIGHT}" y2="${DZ_TOP + d3h * 2}"
      stroke="rgba(191,13,61,0.22)" stroke-width="0.8" stroke-dasharray="3,2"/>
    <polygon points="${DZ_LEFT},${DZ_BOT + 5} ${DZ_RIGHT},${DZ_BOT + 5} ${DZ_RIGHT},${DZ_BOT + 12} ${SZ_CX},${DZ_BOT + 20} ${DZ_LEFT},${DZ_BOT + 12}"
      fill="${ink.strong}" stroke="${ink.mid}" stroke-width="1"/>
    ${dots}
  </svg>`;
}

// ── Bases + outs scorebug ─────────────────────────────────────────────────

function buildBasesSVG(outs: number, onBase: any): string {
  const ink = svgInk();
  const outFill = (n: number): string =>
    outs >= n ? "#bf0d3d" : ink.empty;
  const baseFill = (b: any): string =>
    b ? "#bf0d3d" : ink.empty;
  return `<svg width="60" height="60" viewBox="0 0 58 79" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="61" r="6" fill="${outFill(1)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <circle cx="30" cy="61" r="6" fill="${outFill(2)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <circle cx="47" cy="61" r="6" fill="${outFill(3)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <rect x="17.6" y="29.7" width="14" height="14" transform="rotate(45 17.6 29.7)"
      fill="${baseFill(onBase?.third)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <rect x="29.4" y="17.7" width="14" height="14" transform="rotate(45 29.4 17.7)"
      fill="${baseFill(onBase?.second)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <rect x="41.6" y="29.7" width="14" height="14" transform="rotate(45 41.6 29.7)"
      fill="${baseFill(onBase?.first)}" stroke="#bf0d3d" stroke-width="1.5"/>
  </svg>`;
}

// ── Stat line helpers ─────────────────────────────────────────────────────

function getBatterSeasonStats(teamBox: any, batterId: number | undefined): string {
  if (!teamBox || !batterId) return "—";
  const stats = teamBox.players?.[`ID${batterId}`]?.seasonStats?.batting;
  if (!stats) return "—";
  const avg = stats.avg || "---";
  const hr = stats.homeRuns ?? 0;
  const rbi = stats.rbi ?? 0;
  return `${avg} · ${hr} HR · ${rbi} RBI`;
}

function getPitcherInGameLine(teamBox: any, pitcherId: number | undefined): string {
  if (!teamBox || !pitcherId) return "—";
  const player = teamBox.players?.[`ID${pitcherId}`];
  const game = player?.stats?.pitching;
  const season = player?.seasonStats?.pitching;
  if (!game && !season) return "—";
  const ip = game?.inningsPitched ?? "0.0";
  const k = game?.strikeOuts ?? 0;
  const era = season?.era ?? "—";
  return `${ip} IP · ${k} K · ${era} ERA`;
}

function getPitcherSeasonStats(teamBox: any, pitcherId: number | undefined): string {
  if (!teamBox || !pitcherId) return "—";
  const player = teamBox.players?.[`ID${pitcherId}`];
  const stats = player?.seasonStats?.pitching;
  if (!stats) return "—";
  const w = stats.wins ?? 0;
  const l = stats.losses ?? 0;
  const era = stats.era ?? "—";
  const k = stats.strikeOuts ?? 0;
  return `${w}-${l}  ·  ${era} ERA  ·  ${k} K`;
}

// ── Game-context label (postseason/ST/All-Star + doubleheader) ────────────

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

/**
 * Build a short, all-caps context label for the meta strip. Returns
 * empty string for regular-season single games (most cases), so the
 * pill auto-hides via `:empty { display: none }`.
 */
function getGameContextLabel(gameDataObj: any): string {
  const gameInfo = gameDataObj?.game || {};
  const gameType: string = gameInfo.type || gameInfo.gameType || "R";
  const parts: string[] = [];

  if (["F", "D", "L", "W"].includes(gameType)) {
    const seriesPrefix = abbreviateSeriesDesc(gameInfo.seriesDescription || "");
    const gameNum = gameInfo.seriesGameNumber;
    parts.push(gameNum ? `${seriesPrefix} Game ${gameNum}` : seriesPrefix);
  } else if (gameType === "S") {
    parts.push("Spring Training");
  } else if (gameType === "A") {
    parts.push("All-Star Game");
  } else if (gameType === "E") {
    parts.push("Exhibition");
  }

  const dh: string = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  if (dh !== "N" && dhNum) {
    parts.push(`Game ${dhNum} of 2`);
  }

  return parts.join(" · ").toUpperCase();
}

// ── State ─────────────────────────────────────────────────────────────────

let gamePk: number | null = null;
let pollInterval: ReturnType<typeof setInterval> | null = null;
let lastGameData: any = null;
let postgameNotificationFired = false;
let postType: string | null = null;
let gameIsTerminal = false; // set once the game reaches Final/Postponed

// ── Visible error reporting (Devvit iframe-friendly) ──────────────────────
//
// The red overlay is a debugging aid, not something a normal viewer should ever
// see. reportError still logs to the console unconditionally; the on-screen
// banner only mounts when debug mode is on. Enable it with `?debug=1` in the
// URL (easiest in a browser) or by setting localStorage["mlb-scores-debug"]="1".

function isDebugEnabled(): boolean {
  try {
    const v = (new URLSearchParams(location.search).get("debug") || "").toLowerCase();
    if (v === "1" || v === "true" || v === "yes") return true;
  } catch { /* location unavailable — ignore */ }
  try {
    if (localStorage.getItem("mlb-scores-debug") === "1") return true;
  } catch { /* storage blocked — ignore */ }
  return false;
}

const DEBUG_OVERLAY: boolean = isDebugEnabled();

function reportError(label: string, e: unknown): void {
  console.error(`[${label}]`, e);
  if (!DEBUG_OVERLAY) return; // keep logging, but don't show the banner to viewers
  let overlay = document.getElementById("error-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "error-overlay";
    overlay.style.cssText =
      "position:fixed;top:0;left:0;right:0;background:rgba(180,0,0,0.95);color:#fff;" +
      "padding:8px 12px;font-family:monospace;font-size:10px;z-index:99999;" +
      "max-height:40vh;overflow-y:auto;border-bottom:2px solid #fff;line-height:1.4;" +
      "white-space:pre-wrap;word-break:break-word;";
    overlay.onclick = () => overlay!.remove();
    document.body.appendChild(overlay);
  }
  const msg = e instanceof Error ? `${e.message}\n${e.stack || ""}` : String(e);
  const line = document.createElement("div");
  line.style.cssText = "padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.2);";
  line.textContent = `[${label}] ${msg}`;
  overlay.appendChild(line);
}

window.addEventListener("error", (e) => reportError("window.error", e.error || e.message));
window.addEventListener("unhandledrejection", (e) => reportError("unhandled promise", e.reason));

// ── DOM helpers ───────────────────────────────────────────────────────────

const $ = (id: string): HTMLElement | null => document.getElementById(id);

// Universal fallback: the regular full-color mark exists for every team, so a
// missing dark-mode file degrades to it rather than showing a broken image.
function baseLogoPath(teamId: number): string {
  return `/teams/${teamId}.svg`;
}

function getLogoPath(teamId: number): string {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  // Light card → the regular full-color marks at teams/ (these read well on
  // white). Dark card → the lightened dark-mode variants in teams/dark, which
  // exist only for MLB teams; non-MLB opponents (spring training, etc.) have
  // only the regular mark, so they use it in both themes.
  if (light) return `/teams/${teamId}.svg`;
  return MLB_TEAM_IDS.has(teamId) ? `/teams/dark/${teamId}.svg` : `/teams/${teamId}.svg`;
}

// onerror fallback for inline <img> logos — mirrors loadLogo below.
const logoFallbackAttr = (teamId: number): string =>
  `this.onerror=null;this.src='${baseLogoPath(teamId)}'`;

function loadLogo(imgEl: HTMLImageElement, teamId: number): void {
  imgEl.onerror = (): void => { imgEl.onerror = null; imgEl.src = baseLogoPath(teamId); };
  imgEl.src = getLogoPath(teamId);
}

// Game times render in the VIEWER'S local time zone (each user sees their own),
// which is intentionally different from the bot's Reddit post — the post always
// states the game's start in Eastern. Do not pin these to a fixed zone.
function formatGameTime(gameDate: string): string {
  const d = new Date(gameDate);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getTeamShortName(team: any): string {
  if (!team) return "";
  if (team.teamName) return team.teamName;
  if (team.clubName) return team.clubName;
  const name = team.name || "";
  if (name.includes("Red Sox")) return "Red Sox";
  if (name.includes("White Sox")) return "White Sox";
  if (name.includes("Blue Jays")) return "Blue Jays";
  const parts = name.split(" ");
  return parts[parts.length - 1] || team.abbreviation || "";
}

function formatPitcherName(fullName: string): string {
  const safe = (fullName || "").trim();
  if (!safe) return "TBD";
  const parts = safe.split(/\s+/);
  if (parts.length === 1) {
    return safe;
  }
  const last = parts.pop()!;
  const rest = parts.join(" ");
  return `${rest}<br>${last}`;
}

function hideAllStatePanes(): void {
  ["pregame-content", "live-content", "final-content", "postponed-content", "suspended-content"].forEach((id) => {
    const el = $(id);
    if (el) el.style.display = "none";
  });
}

// ── Expanded mode (the scroll fix) ────────────────────────────────────────
//
// Inline web views are embedded in Reddit's feed, which owns vertical scroll
// gestures — that's why inner scrolling never worked. requestExpandedMode opens
// the post full-screen, where the existing CSS `overflow-y: auto` scrolls
// natively. Must be triggered by a trusted click.
//
// The button ONLY expands. In full-screen, Reddit's own chrome (the X) is the
// single way back — we don't render a collapse control, which avoids the desync
// where exiting via the X left our button stuck in a stale "collapse" state.
// The button is hidden whenever the view is expanded. Mode can change in place
// on desktop without reloading the page, so visibility is reconciled against the
// live mode on resize, and the click handler refuses to expand when already
// expanded as a backstop against any double-expand error.

const EXPAND_ICON =
  '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';

function isExpandedMode(): boolean {
  try { return getWebViewMode() === "expanded"; } catch { return false; }
}

// ── Inline pager ────────────────────────────────────────────────────────────
// Reddit forbids scroll-trapping in the in-feed (inline) view. So inline we lock
// the body (no native scroll → the feed scrolls past untouched), bound the active
// panel to the visible area, and let people move through long panels (box score,
// plays) with up/down buttons that scroll the panel PROGRAMMATICALLY. A panel set
// to `overflow: hidden` won't capture a drag/wheel gesture (no trap), but its
// scrollBy()/scrollTop still work from a button click. Expanded mode is unchanged
// (native scroll). body.is-inline is toggled in setupExpand's sync().

const pagerScrollWired = new WeakSet<HTMLElement>();
let pagerRaf = 0;

function scheduleInlinePagerSync(): void {
  if (pagerRaf) return;
  pagerRaf = requestAnimationFrame(() => { pagerRaf = 0; updateInlinePager(); });
}

// The element the buttons scroll. For the box tab that's the inner panel wrap so
// the away/home toggle stays pinned; for every other tab, the active pane itself.
function inlinePagerRegion(): HTMLElement | null {
  const active = document.querySelector(".tab-content.tab-content-active") as HTMLElement | null;
  if (!active) return null;
  return (active.querySelector(".bs-panel-wrap") as HTMLElement | null) || active;
}

function updateInlinePager(): void {
  const pager = document.getElementById("inline-pager");
  if (!pager) return;
  const inline = document.body.classList.contains("is-inline");
  const region = inline ? inlinePagerRegion() : null;
  const needed = !!region && region.scrollHeight > region.clientHeight + 2;
  pager.classList.toggle("pager-active", inline && needed);
  if (!needed || !region) return;

  // Float just above the sticky tab-bar.
  const bar = document.querySelector(".tab-bar") as HTMLElement | null;
  pager.style.bottom = (bar ? bar.offsetHeight : 56) + 10 + "px";

  const up = document.getElementById("inline-pager-up") as HTMLButtonElement | null;
  const down = document.getElementById("inline-pager-down") as HTMLButtonElement | null;
  if (up) up.disabled = region.scrollTop <= 1;
  if (down) down.disabled = region.scrollTop >= region.scrollHeight - region.clientHeight - 1;

  if (!pagerScrollWired.has(region)) {
    region.addEventListener("scroll", scheduleInlinePagerSync, { passive: true });
    pagerScrollWired.add(region);
  }
}

function setupInlinePager(): void {
  const host = $("scorebug-content");
  if (!host || document.getElementById("inline-pager")) return;

  const chev = (d: string): string =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';

  const pager = document.createElement("div");
  pager.id = "inline-pager";

  const mk = (id: string, label: string, path: string, dir: number): HTMLButtonElement => {
    const b = document.createElement("button");
    b.id = id;
    b.type = "button";
    b.className = "inline-pager-btn";
    b.setAttribute("aria-label", label);
    b.innerHTML = chev(path);
    b.addEventListener("click", () => {
      const region = inlinePagerRegion();
      if (!region) return;
      region.scrollBy({ top: dir * Math.round(region.clientHeight * 0.8), behavior: "smooth" });
    });
    return b;
  };

  pager.appendChild(mk("inline-pager-up", "Scroll up", "M18 15l-6-6-6 6", -1));
  pager.appendChild(mk("inline-pager-down", "Scroll down", "M6 9l6 6 6-6", 1));
  host.appendChild(pager);

  // One observer catches both tab switches (class changes) and the 10s poll's
  // innerHTML rewrites (which grow the plays list), so the buttons re-sync
  // without touching setupTabs or render.
  const obs = new MutationObserver(scheduleInlinePagerSync);
  obs.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
  window.addEventListener("resize", scheduleInlinePagerSync);

  updateInlinePager();
}

function setupExpand(): void {
  if (document.getElementById("expand-btn")) return;
  const host = $("scorebug-content") || document.body;

  const btn = document.createElement("button");
  btn.id = "expand-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Open full screen");
  btn.innerHTML = EXPAND_ICON;
  btn.style.cssText =
    "position:absolute;top:10px;right:12px;z-index:40;width:32px;height:32px;" +
    "display:flex;align-items:center;justify-content:center;padding:0;" +
    "background:var(--bg-elev-2);color:var(--text-primary);border:1px solid var(--border-medium);" +
    "border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;" +
    "backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);";

  // Visible only while inline; hidden in full-screen so the X is the way back.
  // Exiting expanded mode via Reddit's X doesn't reliably fire a resize event
  // (especially on desktop), so while hidden in expanded mode we poll the mode
  // and re-show the button the instant we're back inline, then stop polling.
  let modePoll = 0;
  const sync = (): void => {
    const expanded = isExpandedMode();
    btn.style.display = expanded ? "none" : "flex";
    // Inline (in-feed) views must not trap scroll: inline uses a bounded,
    // button-paged layout; expanded keeps native scroll. See setupInlinePager.
    document.body.classList.toggle("is-inline", !expanded);
    scheduleInlinePagerSync();
    if (expanded && !modePoll) {
      modePoll = window.setInterval(sync, 400);
    } else if (!expanded && modePoll) {
      window.clearInterval(modePoll);
      modePoll = 0;
    }
  };
  sync();
  window.addEventListener("resize", sync);
  document.addEventListener("visibilitychange", sync);

  btn.addEventListener("click", (event: MouseEvent) => {
    // Backstop: if we're somehow already expanded, just hide and bail rather
    // than calling requestExpandedMode twice (which throws "already expanded").
    if (isExpandedMode()) { sync(); return; }
    try {
      // "default" is this app's devvit.json post entrypoint (splash.html).
      requestExpandedMode(event, "default");
    } catch (e) {
      reportError("requestExpandedMode", e);
    }
    sync();
  });

  host.appendChild(btn);
}

// ── Light / dark theme toggle ──────────────────────────────────────────────
// The DOM recolors instantly from the CSS tokens under [data-theme="light"];
// the SVGs are rebuilt with the matching palette on toggle. By default the theme
// follows Reddit's color scheme (prefers-color-scheme); the in-app button
// overrides that, and the override persists in localStorage when available.

const SUN_ICON =
  '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="12" cy="12" r="4"/>' +
  '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON_ICON =
  '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

const THEME_KEY = "mlb-scores-theme";

function applyTheme(theme: string): void {
  if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
}

// Reddit drives the web view's color scheme through prefers-color-scheme — its
// native light/dark toggle (and the preview toggle) flips that media feature.
// We follow it by default; a tap on the in-app button overrides and is saved.
function systemTheme(): string {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch { return "dark"; }
}

function savedTheme(): string | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch { return null; }
}

function resolveTheme(): string {
  // Manual override wins; otherwise follow Reddit's / the OS color scheme.
  return savedTheme() ?? systemTheme();
}

function setupThemeToggle(): void {
  if (document.getElementById("theme-btn")) return;
  const host = $("scorebug-content") || document.body;

  // Seed the attribute before the first render so the initial SVG ink is right.
  let theme = resolveTheme();
  applyTheme(theme);

  const btn = document.createElement("button");
  btn.id = "theme-btn";
  btn.type = "button";
  btn.style.cssText =
    "position:absolute;top:10px;left:12px;z-index:40;width:32px;height:32px;" +
    "display:flex;align-items:center;justify-content:center;padding:0;" +
    "background:var(--bg-elev-2);color:var(--text-primary);border:1px solid var(--border-medium);" +
    "border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;" +
    "backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);";

  const paint = (): void => {
    // Show the icon for the mode you'll switch TO.
    btn.innerHTML = theme === "light" ? MOON_ICON : SUN_ICON;
    btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  };
  paint();

  btn.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage unavailable — session only */ }
    paint();
    // CSS DOM has already flipped; rebuild the SVGs with the new palette.
    try { if (lastGameData) render(lastGameData); } catch (e) { reportError("theme re-render", e); }
  });

  // Follow Reddit's native color-scheme toggle live: when the user (or the
  // preview toggle) flips the scheme, match it and drop any manual override so
  // the native control stays in charge.
  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = (e: MediaQueryListEvent): void => {
      try { localStorage.removeItem(THEME_KEY); } catch { /* ignore */ }
      theme = e.matches ? "dark" : "light";
      applyTheme(theme);
      paint();
      try { if (lastGameData) render(lastGameData); } catch (err) { reportError("scheme re-render", err); }
    };
    if (mq.addEventListener) mq.addEventListener("change", onSchemeChange);
    else if ((mq as any).addListener) (mq as any).addListener(onSchemeChange); // legacy WebKit
  } catch { /* matchMedia unsupported */ }

  host.appendChild(btn);
}

// ── Pregame content ───────────────────────────────────────────────────────

function renderPregameContent(data: any, awayTeam: any, homeTeam: any): void {
  const teamsBox = data.liveData?.boxscore?.teams || {};
  const probables = data.gameData?.probablePitchers || {};
  const awayPid = probables.away?.id;
  const homePid = probables.home?.id;

  const awayLabel = $("pregame-away-pitcher-label");
  const homeLabel = $("pregame-home-pitcher-label");
  if (awayLabel) awayLabel.textContent = `${getTeamShortName(awayTeam).toUpperCase()} STARTER`;
  if (homeLabel) homeLabel.textContent = `${getTeamShortName(homeTeam).toUpperCase()} STARTER`;

  $("pregame-away-pitcher-name")!.innerHTML = formatPitcherName(probables.away?.fullName || "TBD");
  $("pregame-home-pitcher-name")!.innerHTML = formatPitcherName(probables.home?.fullName || "TBD");
  $("pregame-away-pitcher-stats")!.textContent = getPitcherSeasonStats(teamsBox.away, awayPid);
  $("pregame-home-pitcher-stats")!.textContent = getPitcherSeasonStats(teamsBox.home, homePid);

  const dt = new Date(data.gameData.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(data.gameData.datetime?.dateTime || dt.toISOString());
  $("pregame-first-pitch")!.textContent = `${dateStr}  ·  ${timeStr}`;
}

// ── Live content ──────────────────────────────────────────────────────────

function renderLiveContent(data: any): void {
  const linescore = data.liveData?.linescore;
  const currentPlay = data.liveData?.plays?.currentPlay;
  if (!linescore || !currentPlay) return;

  const teamsBox = data.liveData.boxscore?.teams || {};
  const matchup = currentPlay.matchup || {};
  const batter = matchup.batter;
  const pitcher = matchup.pitcher;
  const count = currentPlay.count || { balls: 0, strikes: 0, outs: 0 };

  const awayBatting = linescore.inningHalf === "Top";
  const awaySlotPlayer = awayBatting ? batter : pitcher;
  const homeSlotPlayer = awayBatting ? pitcher : batter;
  const awaySlotIsBatter = awayBatting;
  const homeSlotIsBatter = !awayBatting;

  const awaySlotEl = $("live-player-away");
  const homeSlotEl = $("live-player-home");
  if (awaySlotEl) {
    awaySlotEl.classList.toggle("is-batter", awaySlotIsBatter);
    awaySlotEl.classList.toggle("is-pitcher", !awaySlotIsBatter);
  }
  if (homeSlotEl) {
    homeSlotEl.classList.toggle("is-batter", homeSlotIsBatter);
    homeSlotEl.classList.toggle("is-pitcher", !homeSlotIsBatter);
  }

  const awayTeamId = data.gameData?.teams?.away?.id;
  const homeTeamId = data.gameData?.teams?.home?.id;

  const getPlayerPos = (teamBox: any, playerId: number | undefined): string => {
    if (!teamBox || !playerId) return "";
    return teamBox.players?.[`ID${playerId}`]?.position?.abbreviation || "";
  };

  $("live-away-role")!.textContent = awaySlotIsBatter ? "BATTER" : "PITCHER";
  $("live-away-pos")!.textContent = awaySlotIsBatter
    ? getPlayerPos(teamsBox.away, awaySlotPlayer?.id)
    : "";
  $("live-away-name")!.textContent = awaySlotPlayer?.fullName || "—";
  $("live-away-stats")!.textContent = awaySlotIsBatter
    ? getBatterSeasonStats(teamsBox.away, awaySlotPlayer?.id)
    : getPitcherInGameLine(teamsBox.away, awaySlotPlayer?.id);
  const awayLogoEl = $("live-away-team-logo") as HTMLImageElement | null;
  if (awayLogoEl && awayTeamId) loadLogo(awayLogoEl, awayTeamId);

  $("live-home-role")!.textContent = homeSlotIsBatter ? "BATTER" : "PITCHER";
  $("live-home-pos")!.textContent = homeSlotIsBatter
    ? getPlayerPos(teamsBox.home, homeSlotPlayer?.id)
    : "";
  $("live-home-name")!.textContent = homeSlotPlayer?.fullName || "—";
  $("live-home-stats")!.textContent = homeSlotIsBatter
    ? getBatterSeasonStats(teamsBox.home, homeSlotPlayer?.id)
    : getPitcherInGameLine(teamsBox.home, homeSlotPlayer?.id);
  const homeLogoEl = $("live-home-team-logo") as HTMLImageElement | null;
  if (homeLogoEl && homeTeamId) loadLogo(homeLogoEl, homeTeamId);

  const onBase = linescore.offense || {};
  $("live-bases")!.innerHTML = buildBasesSVG(count.outs ?? 0, onBase);
  $("live-count")!.textContent = `${count.balls ?? 0}–${count.strikes ?? 0}`;

  const pitches = (currentPlay.playEvents || []).filter((e: any) => e.isPitch);
  $("live-zone-container")!.innerHTML = buildStrikeZoneSVG(pitches);

  const lastPitch = pitches[pitches.length - 1];
  const pitchEl = $("live-pitch-latest")!;
  if (lastPitch) {
    const info = pitchInfo(lastPitch.details?.type?.code);
    const velo = lastPitch.pitchData?.startSpeed?.toFixed(1) ?? "—";
    const isInPlay = lastPitch.details?.isInPlay;
    const isStrike = lastPitch.details?.isStrike;
    const isFoul = (lastPitch.details?.description || "").toLowerCase().includes("foul");
    let resCls = "live-pr-ball";
    let resLbl = "BALL";
    if (isInPlay) { resCls = "live-pr-contact"; resLbl = "IN PLAY"; }
    else if (isFoul) { resCls = "live-pr-foul"; resLbl = "FOUL"; }
    else if (isStrike) { resCls = "live-pr-strike"; resLbl = "STR"; }
    pitchEl.innerHTML = `
      <span class="live-pitch-num">PITCH ${pitches.length}</span>
      <span class="live-pitch-badge" style="background:${info.color}">${info.abbr}</span>
      <span class="live-pitch-type">${info.label}</span>
      <span class="live-pitch-velo">${velo} mph</span>
      <span class="live-pitch-result ${resCls}">${resLbl}</span>
    `;
  } else {
    pitchEl.innerHTML = '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">Waiting for first pitch…</span>';
  }

  const resultEvent = currentPlay.result?.event || "";
  const resultDesc = currentPlay.result?.description || "";
  const resultEl = $("live-result")!;
  if (resultEvent || resultDesc) {
    resultEl.innerHTML = `
      ${resultEvent ? `<div class="live-event">${resultEvent}</div>` : ""}
      ${resultDesc ? `<div class="live-desc">${resultDesc}</div>` : ""}
    `;
  } else {
    resultEl.innerHTML = "";
  }
}

// ── Box score ─────────────────────────────────────────────────────────────

function shortName(name: string): string {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0] ?? "";

  const SUFFIX = ["Jr.", "Jr", "Sr.", "Sr", "II", "III", "IV", "V"];
  const lastPart = parts[parts.length - 1] ?? "";
  const useSecondToLast = SUFFIX.includes(lastPart) && parts.length > 2;
  const surname = useSecondToLast ? (parts[parts.length - 2] ?? "") : lastPart;
  const firstInitial = parts[0]?.[0] ?? "";
  return `${firstInitial}. ${surname}`;
}

function fmtAvg(v: any): string {
  if (!v || v === ".000" || v === "0.000") return ".000";
  const f = parseFloat(v);
  if (isNaN(f)) return ".000";
  return f < 1 ? "." + String(Math.round(f * 1000)).padStart(3, "0") : String(v);
}

function buildBattingRow(player: any, displayNum: number, s: any): string {
  const g = player.stats?.batting || {};
  const name = shortName(player.person?.fullName || "Unknown");
  const pos = player.position?.abbreviation || "";
  const ab = g.atBats ?? 0;
  const h = g.hits ?? 0;
  const r = g.runs ?? 0;
  const rbi = g.rbi ?? 0;
  const hr = g.homeRuns ?? 0;
  const bb = g.baseOnBalls ?? 0;
  const so = g.strikeOuts ?? 0;
  const avg = fmtAvg(s?.avg);
  return `<tr class="bs-row">
    <td class="bs-num">${displayNum}</td>
    <td class="bs-pos-cell"><span class="bs-pos">${pos}</span></td>
    <td class="bs-player"><div class="bs-pname">${name}</div></td>
    <td>${ab}</td>
    <td class="${h > 0 ? "bs-hit" : ""}">${h}</td>
    <td>${r}</td>
    <td>${rbi}</td>
    <td class="${hr > 0 ? "bs-hr" : ""}">${hr}</td>
    <td>${bb}</td>
    <td>${so}</td>
    <td class="bs-avg">${avg}</td>
  </tr>`;
}

function buildPitchingRow(player: any, s: any): string {
  const g = player.stats?.pitching || {};
  const name = shortName(player.person?.fullName || "Unknown");
  const ip = g.inningsPitched ?? "0.0";
  const h = g.hits ?? 0;
  const r = g.runs ?? 0;
  const er = g.earnedRuns ?? 0;
  const bb = g.baseOnBalls ?? 0;
  const so = g.strikeOuts ?? 0;
  const era = s?.era ?? "-.--";
  const erHasRuns = er > 0;
  return `<tr class="bs-row">
    <td class="bs-num"></td>
    <td class="bs-pos-cell"><span class="bs-pos p">P</span></td>
    <td class="bs-player"><div class="bs-pname">${name}</div></td>
    <td>${ip}</td>
    <td>${h}</td>
    <td class="${erHasRuns ? "bs-er" : ""}">${r}</td>
    <td class="${erHasRuns ? "bs-er" : ""}">${er}</td>
    <td>${bb}</td>
    <td>${so}</td>
    <td colspan="2" class="bs-avg">${era}</td>
  </tr>`;
}

function buildBoxPanel(teamStats: any): string {
  if (!teamStats?.players) {
    return '<div class="bs-empty">Lineups not yet available</div>';
  }
  const rawBatters: number[] = teamStats.batters || [];
  const pitchers: number[] = teamStats.pitchers || [];

  const batters: number[] = rawBatters.filter((id: number) => {
    const pos = teamStats.players?.[`ID${id}`]?.position?.abbreviation;
    return pos && pos !== "P" && pos !== "Pitcher";
  });

  if (!batters.length && !pitchers.length) {
    return '<div class="bs-empty">Lineups not yet available</div>';
  }

  const battingRows = batters.map((id: number, i: number) => {
    const player = teamStats.players?.[`ID${id}`];
    if (!player) return "";
    const s = player.seasonStats?.batting;
    return buildBattingRow(player, i + 1, s);
  }).filter(Boolean).join("");

  const pitchingRows = pitchers.map((id: number) => {
    const player = teamStats.players?.[`ID${id}`];
    if (!player) return "";
    const s = player.seasonStats?.pitching;
    return buildPitchingRow(player, s);
  }).filter(Boolean).join("");

  return `
    <div class="bs-section-hdr"><span class="bs-dot"></span>Batting</div>
    <table class="bs-table bs-table-batting">
      <thead>
        <tr>
          <th class="bs-th-num">#</th>
          <th class="bs-th-pos"></th>
          <th class="bs-th-player">Player</th>
          <th>AB</th><th>H</th><th>R</th><th>RBI</th><th>HR</th><th>BB</th><th>K</th><th>AVG</th>
        </tr>
      </thead>
      <tbody>${battingRows || `<tr><td colspan="11" class="bs-empty">Awaiting first AB</td></tr>`}</tbody>
    </table>
    <div class="bs-section-hdr pitching"><span class="bs-dot"></span>Pitching</div>
    <table class="bs-table bs-table-pitching">
      <thead>
        <tr>
          <th class="bs-th-num"></th>
          <th class="bs-th-pos"></th>
          <th class="bs-th-player">Pitcher</th>
          <th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>K</th><th colspan="2">ERA</th>
        </tr>
      </thead>
      <tbody>${pitchingRows || `<tr><td colspan="11" class="bs-empty">No pitching data yet</td></tr>`}</tbody>
    </table>
  `;
}

function renderBoxScore(data: any): void {
  const awayTeam = data.gameData?.teams?.away;
  const homeTeam = data.gameData?.teams?.home;
  const boxscore = data.liveData?.boxscore;
  if (!awayTeam || !homeTeam || !boxscore) return;

  const awayAbbrEl = $("bs-away-tab-abbr");
  const homeAbbrEl = $("bs-home-tab-abbr");
  if (awayAbbrEl) awayAbbrEl.textContent = awayTeam.abbreviation || "?";
  if (homeAbbrEl) homeAbbrEl.textContent = homeTeam.abbreviation || "?";

  const awayLogoEl = $("bs-away-tab-logo") as HTMLImageElement | null;
  const homeLogoEl = $("bs-home-tab-logo") as HTMLImageElement | null;
  if (awayLogoEl && awayTeam.id) loadLogo(awayLogoEl, awayTeam.id);
  if (homeLogoEl && homeTeam.id) loadLogo(homeLogoEl, homeTeam.id);

  const wrap = document.querySelector(".bs-panel-wrap") as HTMLElement | null;
  const savedScroll = wrap?.scrollTop ?? 0;

  const awayPanel = $("bs-away-panel");
  const homePanel = $("bs-home-panel");
  if (awayPanel) awayPanel.innerHTML = buildBoxPanel(boxscore.teams?.away);
  if (homePanel) homePanel.innerHTML = buildBoxPanel(boxscore.teams?.home);

  if (wrap) wrap.scrollTop = savedScroll;
}

function setupBoxScoreTeamTabs(): void {
  document.querySelectorAll(".bs-team-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const team = (btn as HTMLElement).dataset.bsTeam;
      if (!team) return;
      document.querySelectorAll(".bs-team-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".bs-panel").forEach((p) => p.classList.remove("active"));
      $(`bs-${team}-panel`)?.classList.add("active");

      // Start the newly selected team's box score at the top, not wherever the
      // previous team was scrolled. Two scrollers to cover: the <body> in
      // expanded mode, and .bs-panel-wrap in inline mode (where the body doesn't
      // scroll — the panel wrap is the scroll region). Fires only on a team tap.
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const wrap = document.querySelector(".bs-panel-wrap") as HTMLElement | null;
      if (wrap) wrap.scrollTop = 0;
    });
  });
}

// ── Plays (Scoring + All) ─────────────────────────────────────────────────

function getEventBadge(eventType: string): string {
  if (!eventType) return "?";
  const exact: Record<string, string> = {
    "Single": "1B", "Double": "2B", "Triple": "3B", "Home Run": "HR",
    "Strikeout": "K", "Walk": "BB", "Intent Walk": "IBB",
    "Hit By Pitch": "HBP", "Grounded Into DP": "DP", "Field Error": "E",
    "Fielders Choice": "FC", "Fielders Choice Out": "FC", "Double Play": "DP",
    "Catcher Interference": "CI",
    "Caught Stealing 2B": "CS", "Caught Stealing 3B": "CS",
    "Pickoff Caught Stealing 2B": "CS", "Pickoff Caught Stealing 3B": "CS",
    "Stolen Base 2B": "SB", "Stolen Base 3B": "SB", "Stolen Base Home": "SB",
    "Sac Fly": "SAC", "Sac Bunt": "SAC", "Wild Pitch": "WP", "Passed Ball": "PB",
  };
  if (exact[eventType]) return exact[eventType];
  if (eventType.includes("Substitution") || eventType.includes("Switch")) return "↔";
  if (/error/i.test(eventType)) return "E";
  if (/out/i.test(eventType)) return "OUT";
  return eventType.slice(0, 3).toUpperCase();
}

function buildPlayScorebug(play: any): string {
  const count = play.count || {};
  const outs: number = count.outs ?? 0;
  const balls: number = count.balls ?? 0;
  const strikes: number = count.strikes ?? 0;
  const onBase = {
    first:  !!play.matchup?.postOnFirst,
    second: !!play.matchup?.postOnSecond,
    third:  !!play.matchup?.postOnThird,
  };
  const ink = svgInk();
  const outFill  = (n: number): string => outs >= n ? "#bf0d3d" : ink.empty;
  const baseFill = (b: boolean): string => b ? "#bf0d3d" : ink.empty;

  return `<div class="play-scorebug">
    <div class="play-count-mini">${balls}-${strikes}</div>
    <svg width="48" height="48" viewBox="0 0 58 79" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="61" r="5" fill="${outFill(1)}" stroke="#bf0d3d" stroke-width="1"/>
      <circle cx="30" cy="61" r="5" fill="${outFill(2)}" stroke="#bf0d3d" stroke-width="1"/>
      <circle cx="47" cy="61" r="5" fill="${outFill(3)}" stroke="#bf0d3d" stroke-width="1"/>
      <rect x="17.6" y="29.7" width="14" height="14" transform="rotate(45 17.6 29.7)"
        fill="${baseFill(onBase.third)}"  stroke="#bf0d3d" stroke-width="1"/>
      <rect x="29.4" y="17.7" width="14" height="14" transform="rotate(45 29.4 17.7)"
        fill="${baseFill(onBase.second)}" stroke="#bf0d3d" stroke-width="1"/>
      <rect x="41.6" y="29.7" width="14" height="14" transform="rotate(45 41.6 29.7)"
        fill="${baseFill(onBase.first)}"  stroke="#bf0d3d" stroke-width="1"/>
    </svg>
  </div>`;
}

function buildPlayCard(play: any, awayAbbr: string, homeAbbr: string, showScore: boolean): string {
  const inning = play.about?.inning ?? 1;
  const isTop = play.about?.isTopInning;
  const inningTxt = `${isTop ? "▲" : "▼"} ${inning}`;
  const event = play.result?.event || "—";
  const eventBadge = getEventBadge(event);
  const desc = play.result?.description || "";

  const hitData = play.playEvents?.find((e: any) => e?.hitData)?.hitData || {};
  const exitVelo = hitData.launchSpeed ? `${Math.round(hitData.launchSpeed)} mph` : "";
  const launchAngle = hitData.launchAngle != null ? `${Math.round(hitData.launchAngle)}°` : "";
  const distance = hitData.totalDistance ? `${Math.round(hitData.totalDistance)} ft` : "";
  const hasStatcast = exitVelo || launchAngle || distance;

  let scoreHtml = "";
  if (showScore && play.result?.awayScore != null && play.result?.homeScore != null) {
    const rbiHtml = play.result.rbi > 0 ? `<span class="play-rbi">+${play.result.rbi} RBI</span>` : "";
    scoreHtml = `<div class="play-score-line">
      <span class="play-score">${awayAbbr} ${play.result.awayScore} — ${homeAbbr} ${play.result.homeScore}</span>
      ${rbiHtml}
    </div>`;
  }

  let statcastHtml = "";
  if (hasStatcast) {
    const chips: string[] = [];
    if (exitVelo) chips.push(`<div class="play-chip"><span class="play-chip-l">EV</span><span class="play-chip-v">${exitVelo}</span></div>`);
    if (launchAngle) chips.push(`<div class="play-chip"><span class="play-chip-l">LA</span><span class="play-chip-v">${launchAngle}</span></div>`);
    if (distance) chips.push(`<div class="play-chip"><span class="play-chip-l">DIST</span><span class="play-chip-v">${distance}</span></div>`);
    statcastHtml = `<div class="play-statcast">${chips.join("")}</div>`;
  }

  return `<div class="play-card">
    <div class="play-main">
      <div class="play-header">
        <span class="play-inning">${inningTxt}</span>
        <span class="play-event-badge">${eventBadge}</span>
        <span class="play-event-text">${event}</span>
      </div>
      <div class="play-desc">${desc}</div>
      ${scoreHtml}
      ${statcastHtml}
    </div>
    ${buildPlayScorebug(play)}
  </div>`;
}

function renderScoringPlays(data: any): void {
  const container = $("scoring-plays-list");
  if (!container) return;

  const tabEl = $("tab-scoring");
  const savedScroll = tabEl?.scrollTop ?? 0;

  const allPlays = data.liveData?.plays?.allPlays || [];
  const scoringIdx = data.liveData?.plays?.scoringPlays || [];
  const awayAbbr = data.gameData?.teams?.away?.abbreviation || "AWAY";
  const homeAbbr = data.gameData?.teams?.home?.abbreviation || "HOME";

  if (!scoringIdx.length) {
    container.innerHTML = '<div class="plays-empty">No scoring plays yet</div>';
    return;
  }

  const cards = [...scoringIdx].reverse().map((idx: number) => {
    const play = allPlays[idx];
    if (!play) return "";
    return buildPlayCard(play, awayAbbr, homeAbbr, true);
  }).filter(Boolean).join("");

  container.innerHTML = cards;
  if (tabEl) tabEl.scrollTop = savedScroll;
}

function renderAllPlays(data: any): void {
  const container = $("all-plays-list");
  if (!container) return;

  const tabEl = $("tab-plays");
  const savedScroll = tabEl?.scrollTop ?? 0;

  const allPlays = data.liveData?.plays?.allPlays || [];
  const awayAbbr = data.gameData?.teams?.away?.abbreviation || "AWAY";
  const homeAbbr = data.gameData?.teams?.home?.abbreviation || "HOME";

  if (!allPlays.length) {
    container.innerHTML = '<div class="plays-empty">Awaiting first play</div>';
    return;
  }

  const completed = allPlays.filter((p: any) => p.result?.event);
  if (!completed.length) {
    container.innerHTML = '<div class="plays-empty">Awaiting first play</div>';
    return;
  }

  const cards = [...completed].reverse().map((play: any) =>
    buildPlayCard(play, awayAbbr, homeAbbr, false)
  ).join("");

  container.innerHTML = cards;
  if (tabEl) tabEl.scrollTop = savedScroll;
}

// ── Final / wrap content ──────────────────────────────────────────────────

function renderFinalContent(data: any): void {
  const awayTeamId = data.gameData?.teams?.away?.id;
  const homeTeamId = data.gameData?.teams?.home?.id;
  const linescore = data.liveData?.linescore;
  const decisions = data.liveData?.decisions || {};
  const winner = decisions.winner;
  const loser = decisions.loser;
  const teamsBox = data.liveData?.boxscore?.teams || {};

  const awayRuns = linescore?.teams?.away?.runs ?? 0;
  const homeRuns = linescore?.teams?.home?.runs ?? 0;
  const awayWon = awayRuns > homeRuns;
  const homeWon = homeRuns > awayRuns;

  const awayLogoEl = $("final-away-team-logo") as HTMLImageElement | null;
  const homeLogoEl = $("final-home-team-logo") as HTMLImageElement | null;
  if (awayLogoEl && awayTeamId) loadLogo(awayLogoEl, awayTeamId);
  if (homeLogoEl && homeTeamId) loadLogo(homeLogoEl, homeTeamId);

  let awayPitcher: any = null;
  let homePitcher: any = null;
  let awayDecision = "";
  let homeDecision = "";

  if (awayWon) {
    awayPitcher = winner; homePitcher = loser;
    awayDecision = "W"; homeDecision = "L";
  } else if (homeWon) {
    awayPitcher = loser; homePitcher = winner;
    awayDecision = "L"; homeDecision = "W";
  }

  const getFinalPitcherLine = (teamBox: any, pitcherId: number | undefined): string => {
    if (!teamBox || !pitcherId) return "—";
    const game = teamBox.players?.[`ID${pitcherId}`]?.stats?.pitching;
    if (!game) return "—";
    const ip = game.inningsPitched ?? "0.0";
    const h = game.hits ?? 0;
    const er = game.earnedRuns ?? 0;
    const k = game.strikeOuts ?? 0;
    return `${ip} IP · ${h} H · ${er} ER · ${k} K`;
  };

  $("final-away-pitcher-name")!.textContent = awayPitcher?.fullName || "—";
  $("final-away-pitcher-stats")!.textContent = getFinalPitcherLine(teamsBox.away, awayPitcher?.id);
  const awayDecEl = $("final-away-decision")!;
  awayDecEl.textContent = awayDecision || "—";
  awayDecEl.classList.remove("win", "loss");
  if (awayDecision === "W") awayDecEl.classList.add("win");
  else if (awayDecision === "L") awayDecEl.classList.add("loss");

  $("final-home-pitcher-name")!.textContent = homePitcher?.fullName || "—";
  $("final-home-pitcher-stats")!.textContent = getFinalPitcherLine(teamsBox.home, homePitcher?.id);
  const homeDecEl = $("final-home-decision")!;
  homeDecEl.textContent = homeDecision || "—";
  homeDecEl.classList.remove("win", "loss");
  if (homeDecision === "W") homeDecEl.classList.add("win");
  else if (homeDecision === "L") homeDecEl.classList.add("loss");

  const performers = data.liveData?.boxscore?.topPerformers || [];
  for (let i = 0; i < 3; i++) {
    const slot = $(`final-performer-${i + 1}`);
    if (!slot) continue;
    const performer = performers[i];
    if (!performer?.player) {
      slot.style.display = "none";
      continue;
    }
    slot.style.display = "";
    const name = performer.player.person?.fullName || "—";
    const type = performer.type;
    const isPitcher = type === "pitcher" || type === "starter";
    let stats = "—";
    if (isPitcher) {
      const p = performer.player.stats?.pitching;
      if (p?.summary) stats = p.summary;
      else if (p) stats = `${p.inningsPitched || "0"} IP · ${p.earnedRuns ?? 0} ER · ${p.strikeOuts ?? 0} K`;
    } else {
      const b = performer.player.stats?.batting;
      if (b?.summary) stats = b.summary;
      else if (b) stats = `${b.hits ?? 0}-${b.atBats ?? 0} · ${b.runs ?? 0} R · ${b.rbi ?? 0} RBI`;
    }
    const nameEl = slot.querySelector(".final-performer-name") as HTMLElement | null;
    const statsEl = slot.querySelector(".final-performer-stats") as HTMLElement | null;
    if (nameEl) nameEl.textContent = name;
    if (statsEl) statsEl.textContent = stats;
  }
}

// ── Postponed content ─────────────────────────────────────────────────────

function renderPostponedContent(data: any): void {
  const game = data.gameData;

  // Reason for postponement
  const reason = game?.status?.reason || "";
  const reasonEl = $("postponed-reason");
  if (reasonEl) {
    reasonEl.textContent = reason
      ? `Due to ${reason.toLowerCase()}`
      : "Postponed by Major League Baseball";
  }

  // Doubleheader note — only if the postponed game has been rescheduled
  // as part of a DH on its new date.
  const gameInfo = game?.game || {};
  const dh = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  const dhEl = $("postponed-dh-note");
  if (dhEl) {
    if (dh !== "N" && dhNum) {
      dhEl.textContent = `Now scheduled as Game ${dhNum} of a doubleheader`;
      dhEl.style.display = "block";
    } else {
      dhEl.style.display = "none";
    }
  }

  // Teams (for the "between" line)
  const away = game?.teams?.away?.name || "";
  const home = game?.teams?.home?.name || "";
  const teamsEl = $("postponed-teams");
  if (teamsEl) {
    teamsEl.textContent = away && home ? `${away} at ${home}` : "";
  }
}

// ── Suspended content ─────────────────────────────────────────────────────

function renderSuspendedContent(data: any): void {
  const game = data.gameData;
  const linescore = data.liveData?.linescore;

  // Inning info ("BOTTOM 2ND", "TOP 5TH", etc.)
  const inningEl = $("suspended-inning");
  if (inningEl) {
    const half = linescore?.inningHalf;
    const inning = linescore?.currentInning;
    if (half && inning) {
      const halfTxt = half === "Top" ? "TOP" : "BOTTOM";
      inningEl.textContent = `${halfTxt} ${ordinalInning(inning)}`;
    } else {
      inningEl.textContent = "";
    }
  }

  // Teams ("Tigers at Pirates")
  const away = game?.teams?.away?.name || "";
  const home = game?.teams?.home?.name || "";
  const teamsEl = $("suspended-teams");
  if (teamsEl) {
    teamsEl.textContent = away && home ? `${away} at ${home}` : "";
  }

  // Reason for suspension
  const reason = game?.status?.reason || "";
  const reasonEl = $("suspended-reason");
  if (reasonEl) {
    reasonEl.textContent = reason
      ? `Due to ${reason.toLowerCase()}`
      : "Game has been suspended";
  }

  // Makeup date — when game will resume. Check multiple potential field
  // locations defensively since MLB's API surfaces this inconsistently.
  const reschedRaw =
    game?.rescheduleDate ||
    game?.rescheduleGameDate ||
    game?.rescheduledTo ||
    game?.datetime?.rescheduleDate ||
    game?.game?.rescheduleDate ||
    null;
  const makeupEl = $("suspended-makeup-note");
  if (makeupEl) {
    if (reschedRaw) {
      const dt = new Date(reschedRaw);
      const dateStr = dt.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric"
      });
      const timeStr = formatGameTime(reschedRaw);
      makeupEl.textContent = `Resumes ${dateStr} at ${timeStr}`;
      makeupEl.style.display = "block";
    } else {
      makeupEl.style.display = "none";
    }
  }

  // Doubleheader note — if the resumption is scheduled as part of a DH.
  const gameInfo = game?.game || {};
  const dh = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  const dhEl = $("suspended-dh-note");
  if (dhEl) {
    if (dh !== "N" && dhNum) {
      dhEl.textContent = `Continues as Game ${dhNum} of a doubleheader`;
      dhEl.style.display = "block";
    } else {
      dhEl.style.display = "none";
    }
  }
}

function ordinalInning(n: number): string {
  if (n === 1) return "1ST";
  if (n === 2) return "2ND";
  if (n === 3) return "3RD";
  if (n >= 21) {
    const last = n % 10;
    if (last === 1) return `${n}ST`;
    if (last === 2) return `${n}ND`;
    if (last === 3) return `${n}RD`;
  }
  return `${n}TH`;
}

// ── Win Probability ───────────────────────────────────────────────────────

const MLB_TEAM_COLORS: Record<number, string> = {
  108: "#BA0021", 109: "#A71930", 110: "#DF4601", 111: "#BD3039",
  112: "#0E3386", 113: "#C6011F", 114: "#E50022", 115: "#7C6BAF",
  116: "#FA4616", 117: "#EB6E1F", 118: "#004687", 119: "#005A9C",
  120: "#AB0003", 121: "#FF5910", 133: "#003831", 134: "#FDB827",
  135: "#FFC72C", 136: "#005C5C", 137: "#FD5A1E", 138: "#C41E3A",
  139: "#8FBCE6", 140: "#003278", 141: "#134A8E", 142: "#D31145",
  143: "#E81828", 144: "#CE1141", 145: "#C4CED4", 146: "#00A3E0",
  147: "#C4CED3", 158: "#ffc52f", 159: "#000088", 160: "#cc0000",
};

const WBC_COLORS: Record<string, string> = {
  "Japan": "#BC002D", "USA": "#BF0A30", "Korea": "#CD2E3A",
  "Venezuela": "#CF0921", "Mexico": "#006847", "Puerto Rico": "#ED0000",
  "Dominican Republic": "#002D62", "Canada": "#FF0000",
  "Cuba": "#002A8F", "Italy": "#009246",
};

function getTeamColor(id: number | undefined, name: string = ""): string {
  if (id && MLB_TEAM_COLORS[id]) return MLB_TEAM_COLORS[id]!;
  if (name && WBC_COLORS[name]) return WBC_COLORS[name]!;
  return "#535557";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

let winProbCache: any[] | null = null;

async function fetchWinProb(): Promise<any[] | null> {
  if (!gamePk) return null;
  try {
    const res = await fetch(`/api/winprob/${gamePk}`);
    if (!res.ok) return winProbCache;
    const data = await res.json();
    if (Array.isArray(data)) {
      winProbCache = data;
      return data;
    }
    return winProbCache;
  } catch (e) {
    console.error("fetchWinProb error:", e);
    return winProbCache;
  }
}

async function renderWinProb(): Promise<void> {
  const container = $("tab-winprob");
  if (!container) return;

  if (!lastGameData) {
    container.innerHTML = '<div class="placeholder">Waiting for game data…</div>';
    return;
  }

  const awayTeam = lastGameData.gameData?.teams?.away;
  const homeTeam = lastGameData.gameData?.teams?.home;
  if (!awayTeam || !homeTeam) {
    container.innerHTML = '<div class="placeholder">Waiting for game data…</div>';
    return;
  }

  if (!container.querySelector(".wp-summary")) {
    container.innerHTML = '<div class="placeholder">Loading win probability…</div>';
  }

  const wpData = await fetchWinProb();
  if (!wpData || !wpData.length) {
    container.innerHTML = '<div class="placeholder">Win probability not available</div>';
    return;
  }

  const awayId: number = awayTeam.id;
  const homeId: number = homeTeam.id;
  const awayName: string = awayTeam.name || "";
  const homeName: string = homeTeam.name || "";
  const awayAbbr: string = awayTeam.abbreviation || awayTeam.teamName || "AWY";
  const homeAbbr: string = homeTeam.abbreviation || homeTeam.teamName || "HOM";
  const awayColor = getTeamColor(awayId, awayName);
  const homeColor = getTeamColor(homeId, homeName);

  const latest = wpData[wpData.length - 1];
  const homeProb = Math.round(latest.homeTeamWinProbability ?? 50);
  const awayProb = Math.round(latest.awayTeamWinProbability ?? 50);

  const W = 520, H = 125;
  const PL = 36, PR = 16, PT = 10, PB = 22;
  const CW = W - PL - PR;
  const CH = H - PT - PB;
  const stepX = CW / Math.max(1, wpData.length - 1);
  const midY = PT + CH / 2;

  const pts = wpData.map((d: any, i: number) => ({
    x: PL + i * stepX,
    y: PT + CH / 2 + (((d.homeTeamWinProbability ?? 50) - 50) / 50) * (CH / 2),
    homeProb: d.homeTeamWinProbability ?? 50,
    awayProb: d.awayTeamWinProbability ?? 50,
    added: d.homeTeamWinProbabilityAdded,
    event: d.result?.event || "",
    desc: d.result?.description || "",
    inning: d.about?.inning || 0,
    isTop: !!d.about?.isTopInning,
  }));

  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const polyPts = [`${PL},${midY}`, ...pts.map((p) => `${p.x},${p.y}`), `${PL + CW},${midY}`].join(" ");

  const ink = svgInk();
  let inningLines = "";
  let lastInn = 0;
  pts.forEach((p) => {
    if (p.inning && p.inning !== lastInn && p.isTop) {
      lastInn = p.inning;
      inningLines += `
        <line x1="${p.x}" y1="${PT}" x2="${p.x}" y2="${PT + CH}" stroke="${ink.grid}" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${p.x}" y1="${PT + CH}" x2="${p.x}" y2="${PT + CH + 5}" stroke="${ink.mid}" stroke-width="1"/>
        <text x="${p.x}" y="${PT + CH + 15}" text-anchor="middle" font-size="8" fill="${ink.strong}" font-family="DM Mono, monospace">${p.inning}</text>`;
    }
  });

  const zones = pts.map((p, i) => {
    const prev = pts[i - 1];
    const next = pts[i + 1];
    const x = i === 0 ? PL : (prev ? prev.x + (p.x - prev.x) / 2 : PL);
    const nx = i === pts.length - 1 ? PL + CW : (next ? p.x + (next.x - p.x) / 2 : PL + CW);
    const added = p.added != null ? p.added.toFixed(1) : "N/A";
    const sign = (p.added ?? 0) >= 0 ? "+" : "";
    const acls = (p.added ?? 0) >= 0 ? "wp-pos" : "wp-neg";
    const inn = p.inning ? `${p.isTop ? "Top" : "Bot"} ${p.inning}` : "";
    return `<rect x="${x}" y="${PT}" width="${nx - x}" height="${CH}" class="wp-zone"
      data-x="${p.x}" data-y="${p.y}"
      data-home="${p.homeProb.toFixed(1)}" data-away="${p.awayProb.toFixed(1)}"
      data-added="${added}" data-acls="${acls}" data-sign="${sign}"
      data-event="${escapeHtml(p.event)}" data-desc="${escapeHtml(p.desc)}" data-inn="${inn}"/>`;
  }).join("");

  container.innerHTML = `
    <div class="wp-summary">
      <div class="wp-team wp-team-away">
        <img class="wp-team-logo" src="${getLogoPath(awayId)}" onerror="${logoFallbackAttr(awayId)}" alt="${awayAbbr}">
        <span class="wp-team-pct" style="color:${awayColor}">${awayProb}%</span>
      </div>
      <div class="wp-title">WIN PROBABILITY</div>
      <div class="wp-team wp-team-home">
        <span class="wp-team-pct" style="color:${homeColor}">${homeProb}%</span>
        <img class="wp-team-logo" src="${getLogoPath(homeId)}" onerror="${logoFallbackAttr(homeId)}" alt="${homeAbbr}">
      </div>
    </div>

    <div class="wp-prob-bar">
      <div class="wp-prob-bar-fill" style="width:${awayProb}%;background:${awayColor};"></div>
      <div class="wp-prob-bar-fill" style="width:${homeProb}%;background:${homeColor};"></div>
    </div>

    <div class="wp-chart-wrap">
      <div class="wp-tooltip" id="wp-tooltip"></div>
      <svg class="wp-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <rect x="${PL}" y="${PT}" width="${CW}" height="${CH}" fill="${ink.chartBg}" rx="2"/>
        <defs>
          <clipPath id="wp-clip-top"><rect x="${PL}" y="${PT}" width="${CW}" height="${CH / 2}"/></clipPath>
          <clipPath id="wp-clip-bot"><rect x="${PL}" y="${PT + CH / 2}" width="${CW}" height="${CH / 2}"/></clipPath>
        </defs>
        <polygon points="${polyPts}" fill="${awayColor}" opacity="0.9" clip-path="url(#wp-clip-top)"/>
        <polygon points="${polyPts}" fill="${homeColor}" opacity="0.9" clip-path="url(#wp-clip-bot)"/>
        <line x1="${PL}" y1="${midY}" x2="${PL + CW}" y2="${midY}" stroke="${ink.mid}" stroke-width="1" stroke-dasharray="4,3"/>
        <text x="${PL - 4}" y="${midY + 3}" text-anchor="end" font-size="8" fill="${ink.strong}" font-family="DM Mono, monospace">50%</text>
        <text x="${PL - 4}" y="${PT + 6}" text-anchor="end" font-size="8" fill="${awayColor}" font-family="DM Mono, monospace">${awayAbbr}</text>
        <text x="${PL - 4}" y="${PT + CH + 2}" text-anchor="end" font-size="8" fill="${homeColor}" font-family="DM Mono, monospace">${homeAbbr}</text>
        ${inningLines}
        <polyline points="${linePoints}" fill="none" stroke="${ink.strong}" stroke-width="1.2" stroke-linejoin="round"/>
        ${zones}
        <circle id="wp-dot" cx="0" cy="0" r="4" fill="${ink.dotFill}" stroke="${ink.dotRing}" stroke-width="2" style="display:none;pointer-events:none;"/>
        <text x="${PL + CW / 2}" y="${H - 2}" text-anchor="middle" font-size="9" fill="${ink.label}" font-family="DM Mono, monospace">INNING</text>
      </svg>
    </div>

    <div class="wp-legend">
      <div class="wp-legend-item"><span class="wp-legend-swatch" style="background:${awayColor}"></span>${awayName}</div>
      <div class="wp-legend-item"><span class="wp-legend-swatch" style="background:${homeColor}"></span>${homeName}</div>
    </div>
  `;

  wireWinProbHover(awayAbbr, homeAbbr, awayColor, homeColor);
}

function wireWinProbHover(awayAbbr: string, homeAbbr: string, awayColor: string, homeColor: string): void {
  const chart = document.querySelector(".wp-chart") as SVGElement | null;
  const tooltip = $("wp-tooltip");
  const dot = document.getElementById("wp-dot");
  if (!chart || !tooltip || !dot) return;

  const showFor = (z: SVGElement): void => {
    const ds = (z as unknown as HTMLElement).dataset;
    dot.setAttribute("cx", ds.x || "0");
    dot.setAttribute("cy", ds.y || "0");
    (dot as unknown as HTMLElement).style.display = "block";
    const addedLine = ds.added !== "N/A"
      ? `<div class="${ds.acls}">${ds.sign}${ds.added}% WP shift</div>`
      : "";
    tooltip.innerHTML = `
      ${ds.inn ? `<div class="wp-tt-inn">${ds.inn}</div>` : ""}
      ${ds.event ? `<div class="wp-tt-event">${ds.event}</div>` : ""}
      ${ds.desc ? `<div class="wp-tt-desc">${ds.desc}</div>` : ""}
      ${addedLine}
      <div class="wp-tt-probs"><span style="color:${awayColor}">${awayAbbr} ${ds.away}%</span><span style="color:${homeColor}">${homeAbbr} ${ds.home}%</span></div>`;
    tooltip.style.display = "block";
  };

  const hide = (): void => {
    tooltip.style.display = "none";
    (dot as unknown as HTMLElement).style.display = "none";
  };

  chart.querySelectorAll(".wp-zone").forEach((zone) => {
    const z = zone as SVGElement;
    z.addEventListener("mouseenter", () => showFor(z));
    z.addEventListener("mouseleave", hide);
    z.addEventListener("click", (e: Event) => {
      e.stopPropagation();
      showFor(z);
    });
  });
}

function setupWinProbDismiss(): void {
  document.addEventListener("click", (e: MouseEvent) => {
    const tip = document.getElementById("wp-tooltip");
    if (!tip || tip.style.display === "none") return;
    const target = e.target as Element | null;
    if (target?.closest(".wp-chart")) return;
    tip.style.display = "none";
    const dotEl = document.getElementById("wp-dot");
    if (dotEl) (dotEl as unknown as HTMLElement).style.display = "none";
  });
}

// ── Game selection ────────────────────────────────────────────────────────

async function selectGameForThisPost(): Promise<number | null> {
  try {
    const res = await fetch("/api/post-game");
    if (res.ok) {
      const data = await res.json();
      if (data?.postType) postType = data.postType;
      if (data?.gamePk) return Number(data.gamePk);
    }
  } catch (e) {
    /* no bound game resolvable → ended bookend */
  }
  // No game is bound to this post: its render mapping has expired (threads older
  // than ~180 days) or was never written. We deliberately DON'T fall back to
  // today's game here — that made an archived thread display whatever was on the
  // current schedule. Returning null lets init() show a neutral "thread ended"
  // bookend.
  return null;
}

// Terminal "ended" bookend, shown when no game is bound to this post (render
// mapping expired past ~180 days, or was never written). Replaces the old
// fall-back-to-today's-game behavior so an archived thread never displays an
// unrelated current game. Paints into the loading overlay and leaves the
// scoreboard hidden with polling never started, so it's a final state.
function renderEndedState(): void {
  const host = $("loading-state");
  if (!host) return;
  host.innerHTML = `
    <div class="ended-display">
      <div class="ended-headline">Thread Ended</div>
      <div class="ended-divider"></div>
      <div class="ended-text">This game thread is no longer live. Live scoreboards appear here only while a game is in progress.</div>
    </div>`;
}

// ── Fetch and render ──────────────────────────────────────────────────────

async function fetchAndRender(pk: number): Promise<void> {
  try {
    const res = await fetch(`/api/game/${pk}`);
    const data = await res.json();
    if (!data?.gameData || !data?.liveData) {
      console.error("Game data unavailable");
      return;
    }
    render(data);
  } catch (e) {
    console.error("fetchAndRender error:", e);
  }
}

function render(data: any): void {
  lastGameData = data;
  const game = data.gameData;
  const linescore = data.liveData.linescore;
  // For postponement posts, force "Postponed" status regardless of what
  // /feed/live reports — that endpoint can lag the actual postponement
  // by hours, but we know definitively from post-type that this is a
  // postponement notice.
  const statusText: string = postType === "postponed"
    ? "Postponed"
    : game.status.detailedState;
  const awayTeam = game.teams.away;
  const homeTeam = game.teams.home;

  document.body.classList.toggle("is-pregame", isPreGameState(statusText));
  document.body.classList.toggle("is-live", isLiveState(statusText));
  document.body.classList.toggle("is-final", isFinalState(statusText));
  document.body.classList.toggle("is-postponed", statusText === "Postponed");
  document.body.classList.toggle("is-suspended", isSuspendedState(statusText));

  void maybeNotifyPostgame(statusText);

  const loading = $("loading-state")!;
  const content = $("scorebug-content")!;
  loading.style.display = "none";
  content.style.display = "";

  const venueName = game.venue?.name || "";
  const dt = new Date(game.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(game.datetime?.dateTime || dt.toISOString());
  $("venue-info")!.textContent = `${venueName.toUpperCase()} · ${dateStr} · ${timeStr}`;

  const broadcasts = game.broadcasts || [];
  const tvBroadcast = broadcasts.find((b: any) => b.type === "TV" && b.isNational);
  $("network-info")!.textContent = tvBroadcast?.name || "";

  // Postseason / Spring Training / Doubleheader context pill
  const contextEl = $("game-context");
  if (contextEl) {
    contextEl.textContent = getGameContextLabel(game);
  }

  (($("away-logo")) as HTMLImageElement).alt = awayTeam.name;
  (($("home-logo")) as HTMLImageElement).alt = homeTeam.name;
  loadLogo($("away-logo") as HTMLImageElement, awayTeam.id);
  loadLogo($("home-logo") as HTMLImageElement, homeTeam.id);

  $("away-name")!.textContent = getTeamShortName(awayTeam);
  $("home-name")!.textContent = getTeamShortName(homeTeam);

  const awayRec = awayTeam.record;
  const homeRec = homeTeam.record;
  $("away-record")!.textContent = awayRec ? `${awayRec.wins}-${awayRec.losses}` : "";
  $("home-record")!.textContent = homeRec ? `${homeRec.wins}-${homeRec.losses}` : "";

  $("away-score")!.textContent = String(linescore?.teams?.away?.runs ?? 0);
  $("home-score")!.textContent = String(linescore?.teams?.home?.runs ?? 0);

  const badge = $("status-badge")!;
  const inning = $("inning-info")!;
  const countBlock = $("status-count")!;

  hideAllStatePanes();

  if (isFinalState(statusText)) {
    badge.textContent = "FINAL";
    badge.style.background = "#bf0d3d";
    const n = linescore?.currentInning || 9;
    inning.textContent = n !== 9 ? `F/${n}` : "";
    inning.style.color = "#bf0d3d";
    countBlock.style.display = "none";
    $("dynamic-tab-label")!.textContent = "WRAP";
    const finEl = $("final-content");
    if (finEl) finEl.style.display = "block";
    try { renderFinalContent(data); } catch (e) { reportError("renderFinalContent", e); }
  } else if (isPreGameState(statusText)) {
    badge.textContent = "";
    inning.textContent = timeStr;
    inning.style.color = "var(--text-secondary)";
    countBlock.style.display = "none";
    $("dynamic-tab-label")!.textContent = "GAME INFO";
    const preEl = $("pregame-content");
    if (preEl) preEl.style.display = "block";
    try { renderPregameContent(data, awayTeam, homeTeam); } catch (e) { reportError("renderPregameContent", e); }
  } else if (statusText === "Postponed") {
    badge.textContent = "POSTPONED";
    badge.style.background = "#bf0d3d";
    const reason = game?.status?.reason || "";
    inning.textContent = reason ? reason.toUpperCase() : "";
    inning.style.color = "var(--text-secondary)";
    countBlock.style.display = "none";
    $("dynamic-tab-label")!.textContent = "POSTPONED";
    const ppdEl = $("postponed-content");
    if (ppdEl) ppdEl.style.display = "block";
    try { renderPostponedContent(data); } catch (e) { reportError("renderPostponedContent", e); }
  } else if (isSuspendedState(statusText)) {
    badge.textContent = "SUSPENDED";
    badge.style.background = "#bf0d3d";
    const half = linescore?.inningHalf === "Top" ? "▲" : "▼";
    inning.textContent = linescore?.currentInning
      ? `${half} ${linescore.currentInning}`
      : "";
    inning.style.color = "#bf0d3d";
    countBlock.style.display = "none";
    $("dynamic-tab-label")!.textContent = "SUSPENDED";
    const susEl = $("suspended-content");
    if (susEl) susEl.style.display = "block";
    try { renderSuspendedContent(data); } catch (e) { reportError("renderSuspendedContent", e); }
  } else if (isLiveState(statusText)) {
    badge.textContent = "LIVE";
    badge.style.background = "#bf0d3d";
    const half = linescore?.inningHalf === "Top" ? "▲" : "▼";
    inning.textContent = `${half} ${linescore?.currentInning || ""}`;
    inning.style.color = "#bf0d3d";

    const cp = data.liveData?.plays?.currentPlay;
    const count = cp?.count;
    if (count) {
      $("balls")!.textContent = String(count.balls ?? 0);
      $("strikes")!.textContent = String(count.strikes ?? 0);
      $("outs")!.textContent = String(count.outs ?? 0);
      countBlock.style.display = "flex";
    } else {
      countBlock.style.display = "none";
    }
    $("dynamic-tab-label")!.textContent = "LIVE";
    const liveEl = $("live-content");
    if (liveEl) liveEl.style.display = "block";
    try { renderLiveContent(data); } catch (e) { reportError("renderLiveContent", e); }
  } else {
    badge.textContent = statusText.toUpperCase();
    badge.style.background = "var(--text-muted)";
    inning.textContent = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label")!.textContent = statusText.toUpperCase();
  }

  try { renderLinescore(linescore, awayTeam, homeTeam, isFinalState(statusText)); }
  catch (e) { reportError("renderLinescore", e); }

  try { renderBoxScore(data); }
  catch (e) { reportError("renderBoxScore", e); }

  try { renderScoringPlays(data); }
  catch (e) { reportError("renderScoringPlays", e); }

  try { renderAllPlays(data); }
  catch (e) { reportError("renderAllPlays", e); }

  if ($("tab-winprob")?.classList.contains("tab-content-active")) {
    void renderWinProb();
  }

  // Once the game is final or postponed there's nothing more to fetch — stop
  // the loop so a multi-day postgame thread isn't polling the MLB API forever.
  if (isTerminalState(statusText)) {
    gameIsTerminal = true;
    stopPolling();
  }
}

// ── Linescore ─────────────────────────────────────────────────────────────

function renderLinescore(linescore: any, awayTeam: any, homeTeam: any, isFinal: boolean): void {
  if (!linescore) return;
  const innings = linescore.innings || [];
  const currentInning = linescore.currentInning;
  const maxInnings = Math.max(9, innings.length);

  const awayRuns = linescore.teams?.away?.runs ?? 0;
  const homeRuns = linescore.teams?.home?.runs ?? 0;
  const awayIsLoser = isFinal && homeRuns > awayRuns;
  const homeIsLoser = isFinal && awayRuns > homeRuns;

  let headerCells = '<th class="ls-team-col"></th>';
  for (let i = 1; i <= maxInnings; i++) {
    headerCells += `<th class="ls-inning-h${i === currentInning ? ' ls-current' : ""}">${i}</th>`;
  }
  headerCells += '<th class="ls-total ls-r-header">R</th><th class="ls-total ls-h-header">H</th><th class="ls-total ls-e-header">E</th>';

  const buildRow = (teamKey: "away" | "home", team: any): string => {
    const abbr = team.abbreviation || team.teamName?.slice(0, 3).toUpperCase() || "—";
    let cells = `<td class="ls-team-col">
      <img class="ls-team-logo" src="${getLogoPath(team.id)}" onerror="${logoFallbackAttr(team.id)}" alt="${abbr}">
      <span class="ls-team-abbr">${abbr}</span>
    </td>`;
    for (let i = 1; i <= maxInnings; i++) {
      const inn = innings.find((x: any) => x.num === i);
      const runs = inn?.[teamKey]?.runs;
      const isCurrent = i === currentInning;
      let cls = "ls-inning";
      if (runs == null) cls += " ls-empty";
      else if (runs === 0) cls += " ls-zero";
      else cls += " ls-nonzero";
      if (isCurrent) cls += " ls-current";
      cells += `<td class="${cls}">${runs == null ? "–" : runs}</td>`;
    }
    const t = linescore.teams[teamKey];
    const r = t?.runs ?? 0;
    const h = t?.hits ?? 0;
    const e = t?.errors ?? 0;
    cells += `<td class="ls-total ls-r-value ${r === 0 ? "ls-zero" : "ls-nonzero"}">${r}</td>`;
    cells += `<td class="ls-total ls-h-value ${h === 0 ? "ls-zero" : "ls-nonzero"}">${h}</td>`;
    cells += `<td class="ls-total ls-e-value">${e}</td>`;
    return cells;
  };

  const awayRowClass = awayIsLoser ? "ls-row-loser" : "";
  const homeRowClass = homeIsLoser ? "ls-row-loser" : "";

  $("linescore-container")!.innerHTML = `
    <table class="linescore-compact">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>
        <tr class="ls-row-away ${awayRowClass}">${buildRow("away", awayTeam)}</tr>
        <tr class="ls-row-home ${homeRowClass}">${buildRow("home", homeTeam)}</tr>
      </tbody>
    </table>`;
}

// ── Tab switching ─────────────────────────────────────────────────────────

function setupTabs(): void {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = (btn as HTMLElement).dataset.tab;
      if (!targetTab) return;
      document.body.classList.toggle("on-box-tab", targetTab === "box");
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab-active"));
      btn.classList.add("tab-active");
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("tab-content-active"));
      $(`tab-${targetTab}`)?.classList.add("tab-content-active");

      // A newly selected tab always starts at the top. Two scrollers to reset:
      // the <body> in expanded mode, and the newly-active panel itself in inline
      // mode (where the body doesn't scroll — the panel is the scroll region).
      // Without the panel reset, a tab paged down inline would reopen mid-page.
      // (Fires only on an explicit tab tap, never on the 10s poll.)
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const region = inlinePagerRegion();
      if (region) region.scrollTop = 0;

      if (targetTab === "winprob") {
        void renderWinProb();
      }
    });
  });
}

// ── Polling ───────────────────────────────────────────────────────────────

function startPolling(): void {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(() => {
    // Skip the fetch while the post is scrolled off-screen / backgrounded.
    if (document.hidden || gamePk == null) return;
    void fetchAndRender(gamePk);
  }, 10000);
}

function stopPolling(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// ── Postgame notification ──────────────────────────────────────────────────

async function maybeNotifyPostgame(statusText: string): Promise<void> {
  if (postgameNotificationFired) return;
  if (!isFinalState(statusText)) return;
  postgameNotificationFired = true;
  try {
    await fetch("/api/postgame-check", { method: "POST" });
  } catch (e) {
    console.error("postgame notify failed:", e);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────

(async (): Promise<void> => {
  setupTabs();
  setupBoxScoreTeamTabs();
  setupWinProbDismiss();
  setupThemeToggle();
  setupExpand();
  setupInlinePager();

  // When the post returns to view, refresh immediately (only while the poll is
  // still alive — i.e. not after a terminal-state stop).
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && pollInterval !== null && gamePk != null) {
      void fetchAndRender(gamePk);
    }
  });

  gamePk = await selectGameForThisPost();
  if (!gamePk) {
    renderEndedState();
    return;
  }
  await fetchAndRender(gamePk);

  // Don't start the loop at all if the game was already over on load.
  if (!gameIsTerminal) startPolling();
})();