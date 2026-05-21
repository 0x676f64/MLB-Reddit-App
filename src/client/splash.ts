// ── Constants ─────────────────────────────────────────────────────────────

const FINAL_STATES: string[] = [
  "Final", "Game Over", "Final: Tied",
  "Completed Early", "Completed Early: Rain", "Completed Early: Mercy",
  "Cancelled", "Cancelled: Rain"
];
const PRE_GAME_STATES: string[] = ["Pre-Game", "Scheduled", "Warmup"];

const isFinalState = (s: string): boolean => FINAL_STATES.includes(s);
const isPreGameState = (s: string): boolean => PRE_GAME_STATES.includes(s);
const isLiveState = (s: string): boolean =>
  !isFinalState(s) && !isPreGameState(s) &&
  !["Postponed", "Suspended", "Suspended: Rain", "Cancelled", "Cancelled: Rain", "Delayed"].includes(s);

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

function mapPx(pX: number): number {
  return SZ_CX + pX * PX_PER_FT;
}

function mapPz(pZ: number): number {
  return SZ_BOT - ((pZ - PZ_BOT_FT) / (PZ_TOP_FT - PZ_BOT_FT)) * (SZ_BOT - SZ_TOP);
}

function buildStrikeZoneSVG(pitches: any[]): string {
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
      fill="${info.color}" stroke="${isLast ? "#fff" : "rgba(255,255,255,0.35)"}"
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
      fill="rgba(255,255,255,0.55)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    ${dots}
  </svg>`;
}

// ── Bases + outs scorebug ─────────────────────────────────────────────────

function buildBasesSVG(outs: number, onBase: any): string {
  const outFill = (n: number): string =>
    outs >= n ? "#bf0d3d" : "rgba(255,255,255,0.06)";
  const baseFill = (b: any): string =>
    b ? "#bf0d3d" : "rgba(255,255,255,0.06)";
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

// ── State ─────────────────────────────────────────────────────────────────

let gamePk: number | null = null;
let pollInterval: ReturnType<typeof setInterval> | null = null;

// ── Helpers ───────────────────────────────────────────────────────────────

const $ = (id: string): HTMLElement | null => document.getElementById(id);

function getLogoPath(teamId: number): string {
  return MLB_TEAM_IDS.has(teamId)
    ? `/teams/dark/${teamId}.svg`
    : `/teams/${teamId}.svg`;
}

function loadLogo(imgEl: HTMLImageElement, teamId: number): void {
  imgEl.src = getLogoPath(teamId);
}

async function loadHeadshot(
  imgEl: HTMLImageElement | null,
  playerId: number | undefined,
): Promise<void> {
  if (!imgEl || !playerId) return;
  try {
    const r = await fetch(`/api/headshot/${playerId}`);
    if (!r.ok) return;
    const data = await r.json();
    if (data?.src) imgEl.src = data.src;
  } catch (e) {
    console.error("loadHeadshot error:", e);
  }
}

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

function hideAllStatePanes(): void {
  ["pregame-content", "live-content", "final-content"].forEach((id) => {
    const el = $(id);
    if (el) el.style.display = "none";
  });
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

  $("pregame-away-pitcher-name")!.textContent = probables.away?.fullName || "TBD";
  $("pregame-home-pitcher-name")!.textContent = probables.home?.fullName || "TBD";
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

  // Which team is at bat. Away always lands in left slot, home in right.
  // Role (BATTER / PITCHER) flips based on inning half.
  const awayBatting = linescore.inningHalf === "Top";
  const awaySlotPlayer = awayBatting ? batter : pitcher;
  const homeSlotPlayer = awayBatting ? pitcher : batter;
  const awaySlotIsBatter = awayBatting;
  const homeSlotIsBatter = !awayBatting;

  // Toggle is-batter / is-pitcher classes for accent border on headshot
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

  // Away slot (always away team's player — either batter or pitcher)
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

  // Home slot
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
  
  // Scorebug
  const onBase = linescore.offense || {};
  $("live-bases")!.innerHTML = buildBasesSVG(count.outs ?? 0, onBase);
  $("live-count")!.textContent = `${count.balls ?? 0}–${count.strikes ?? 0}`;

  // Strike zone + pitch log
  const pitches = (currentPlay.playEvents || []).filter((e: any) => e.isPitch);
  $("live-zone-container")!.innerHTML = buildStrikeZoneSVG(pitches);

  const pitchRows = [...pitches].reverse().map((p: any, idx: number) => {
    const info = pitchInfo(p.details?.type?.code);
    const num = pitches.length - idx;
    const velo = p.pitchData?.startSpeed?.toFixed(1) ?? "—";
    const isInPlay = p.details?.isInPlay;
    const isStrike = p.details?.isStrike;
    const isFoul = (p.details?.description || "").toLowerCase().includes("foul");
    let resCls = "live-pr-ball";
    let resLbl = "BALL";
    if (isInPlay) { resCls = "live-pr-contact"; resLbl = "IN PLAY"; }
    else if (isFoul) { resCls = "live-pr-foul"; resLbl = "FOUL"; }
    else if (isStrike) { resCls = "live-pr-strike"; resLbl = "STR"; }
    return `<div class="live-pitch-row">
      <span class="live-pitch-num">${num}</span>
      <span class="live-pitch-badge" style="background:${info.color}">${info.abbr}</span>
      <span class="live-pitch-type">${info.label}</span>
      <span class="live-pitch-velo">${velo} mph</span>
      <span class="live-pitch-result ${resCls}">${resLbl}</span>
    </div>`;
  }).join("");

  $("live-pitchlog")!.innerHTML = pitchRows ||
    '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);padding:4px 0;">Waiting for first pitch…</div>';

  // Result section
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

// ── Game selection (temporary — pick first game today) ────────────────────

async function selectTodaysGame(): Promise<number | null> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  try {
    const res = await fetch(`/api/schedule?date=${dateStr}`);
    const data = await res.json();
    const games = data?.dates?.[0]?.games || [];
    if (!games.length) return null;
    const live = games.find((g: any) => isLiveState(g.status?.detailedState || ""));
    if (live) return live.gamePk;
    const upcoming = games.find((g: any) => isPreGameState(g.status?.detailedState || ""));
    if (upcoming) return upcoming.gamePk;
    return games[0].gamePk;
  } catch (e) {
    console.error("selectTodaysGame error:", e);
    return null;
  }
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
  const game = data.gameData;
  const linescore = data.liveData.linescore;
  const statusText: string = game.status.detailedState;
  const awayTeam = game.teams.away;
  const homeTeam = game.teams.home;

  document.body.classList.toggle("is-pregame", isPreGameState(statusText));
  document.body.classList.toggle("is-live", isLiveState(statusText));
  document.body.classList.toggle("is-final", isFinalState(statusText));

  const loading = $("loading-state")!;
  const content = $("scorebug-content")!;
  loading.style.display = "none";
  content.style.display = "block";

  const venueName = game.venue?.name || "";
  const dt = new Date(game.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(game.datetime?.dateTime || dt.toISOString());
  $("venue-info")!.textContent = `${venueName.toUpperCase()} · ${dateStr} · ${timeStr}`;

  const broadcasts = game.broadcasts || [];
  const tvBroadcast = broadcasts.find((b: any) => b.type === "TV" && b.isNational);
  $("network-info")!.textContent = tvBroadcast?.name || "";

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
  } else if (isPreGameState(statusText)) {
    badge.textContent = "";
    inning.textContent = timeStr;
    inning.style.color = "rgba(255,255,255,0.7)";
    countBlock.style.display = "none";
    $("dynamic-tab-label")!.textContent = "GAME INFO";
    const preEl = $("pregame-content");
    if (preEl) preEl.style.display = "block";
    renderPregameContent(data, awayTeam, homeTeam);
  } else if (statusText === "Postponed") {
    badge.textContent = "PPD";
    badge.style.background = "rgba(255,255,255,0.15)";
    inning.textContent = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label")!.textContent = "PPD";
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
    renderLiveContent(data);
  } else {
    badge.textContent = statusText.toUpperCase();
    badge.style.background = "rgba(255,255,255,0.15)";
    inning.textContent = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label")!.textContent = statusText.toUpperCase();
  }

  renderLinescore(linescore, awayTeam, homeTeam, isFinalState(statusText));
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
      <img class="ls-team-logo" src="${getLogoPath(team.id)}" alt="${abbr}">
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
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab-active"));
      btn.classList.add("tab-active");
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("tab-content-active"));
      $(`tab-${targetTab}`)?.classList.add("tab-content-active");
    });
  });
}

// ── Polling ───────────────────────────────────────────────────────────────

function startPolling(pk: number): void {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(() => fetchAndRender(pk), 10000);
}

// ── Init ──────────────────────────────────────────────────────────────────

(async (): Promise<void> => {
  setupTabs();
  gamePk = await selectTodaysGame();
  if (!gamePk) {
    $("loading-state")!.textContent = "No games today.";
    return;
  }
  await fetchAndRender(gamePk);
  startPolling(gamePk);
})();