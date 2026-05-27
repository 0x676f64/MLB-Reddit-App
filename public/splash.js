// src/client/splash.ts
var FINAL_STATES = [
  "Final",
  "Game Over",
  "Final: Tied",
  "Completed Early",
  "Completed Early: Rain",
  "Completed Early: Mercy",
  "Cancelled",
  "Cancelled: Rain"
];
var PRE_GAME_STATES = ["Pre-Game", "Scheduled", "Warmup"];
var isFinalState = (s) => FINAL_STATES.includes(s);
var isPreGameState = (s) => PRE_GAME_STATES.includes(s);
var isLiveState = (s) => !isFinalState(s) && !isPreGameState(s) && !["Postponed", "Suspended", "Suspended: Rain", "Cancelled", "Cancelled: Rain", "Delayed"].includes(s);
var MLB_TEAM_IDS = /* @__PURE__ */ new Set([
  108,
  109,
  110,
  111,
  112,
  113,
  114,
  115,
  116,
  117,
  118,
  119,
  120,
  121,
  133,
  134,
  135,
  136,
  137,
  138,
  139,
  140,
  141,
  142,
  143,
  144,
  145,
  146,
  147,
  158
]);
var PITCH_MAP = {
  FF: { label: "4-Seam", abbr: "FF", color: "#e63946" },
  FA: { label: "4-Seam", abbr: "FF", color: "#e63946" },
  FT: { label: "2-Seam", abbr: "FT", color: "#c1121f" },
  SI: { label: "Sinker", abbr: "SI", color: "#c1121f" },
  FC: { label: "Cutter", abbr: "FC", color: "#f4a261" },
  SL: { label: "Slider", abbr: "SL", color: "#2a9d8f" },
  ST: { label: "Sweeper", abbr: "ST", color: "#fb8500" },
  SV: { label: "Slurve", abbr: "SV", color: "#3a86ff" },
  CU: { label: "Curve", abbr: "CU", color: "#457b9d" },
  KC: { label: "Knuck-Cur", abbr: "KC", color: "#457b9d" },
  CS: { label: "Slow Cur", abbr: "CS", color: "#457b9d" },
  CH: { label: "Change", abbr: "CH", color: "#8338ec" },
  FS: { label: "Splitter", abbr: "FS", color: "#06d6a0" },
  FO: { label: "Forkball", abbr: "FO", color: "#06d6a0" },
  KN: { label: "Knuckle", abbr: "KN", color: "#adb5bd" },
  EP: { label: "Eephus", abbr: "EP", color: "#adb5bd" },
  PO: { label: "Pitchout", abbr: "PO", color: "#6c757d" },
  IN: { label: "Int. Ball", abbr: "IN", color: "#6c757d" }
};
function pitchInfo(code) {
  return PITCH_MAP[code || ""] || { label: code || "?", abbr: code || "?", color: "#94a3b8" };
}
var ZONE_W = 120;
var ZONE_H = 155;
var SZ_LEFT = 22;
var SZ_RIGHT = 98;
var SZ_TOP = 24;
var SZ_BOT = 108;
var SZ_CX = (SZ_LEFT + SZ_RIGHT) / 2;
var PX_PER_FT = (SZ_RIGHT - SZ_LEFT) / 1.7;
var PZ_TOP_FT = 3.5;
var PZ_BOT_FT = 1.5;
var DZ_LEFT = SZ_LEFT + 6;
var DZ_RIGHT = SZ_RIGHT - 6;
var DZ_TOP = SZ_TOP + 5;
var DZ_BOT = SZ_BOT - 12;
function mapPx(pX) {
  return SZ_CX + pX * PX_PER_FT;
}
function mapPz(pZ) {
  return SZ_BOT - (pZ - PZ_BOT_FT) / (PZ_TOP_FT - PZ_BOT_FT) * (SZ_BOT - SZ_TOP);
}
function buildStrikeZoneSVG(pitches) {
  const dW = DZ_RIGHT - DZ_LEFT, dH = DZ_BOT - DZ_TOP;
  const d3 = dW / 3, d3h = dH / 3;
  const dots = pitches.map((p, i) => {
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
function buildBasesSVG(outs, onBase) {
  const outFill = (n) => outs >= n ? "#bf0d3d" : "rgba(255,255,255,0.06)";
  const baseFill = (b) => b ? "#bf0d3d" : "rgba(255,255,255,0.06)";
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
function getBatterSeasonStats(teamBox, batterId) {
  if (!teamBox || !batterId) return "\u2014";
  const stats = teamBox.players?.[`ID${batterId}`]?.seasonStats?.batting;
  if (!stats) return "\u2014";
  const avg = stats.avg || "---";
  const hr = stats.homeRuns ?? 0;
  const rbi = stats.rbi ?? 0;
  return `${avg} \xB7 ${hr} HR \xB7 ${rbi} RBI`;
}
function getPitcherInGameLine(teamBox, pitcherId) {
  if (!teamBox || !pitcherId) return "\u2014";
  const player = teamBox.players?.[`ID${pitcherId}`];
  const game = player?.stats?.pitching;
  const season = player?.seasonStats?.pitching;
  if (!game && !season) return "\u2014";
  const ip = game?.inningsPitched ?? "0.0";
  const k = game?.strikeOuts ?? 0;
  const era = season?.era ?? "\u2014";
  return `${ip} IP \xB7 ${k} K \xB7 ${era} ERA`;
}
function getPitcherSeasonStats(teamBox, pitcherId) {
  if (!teamBox || !pitcherId) return "\u2014";
  const player = teamBox.players?.[`ID${pitcherId}`];
  const stats = player?.seasonStats?.pitching;
  if (!stats) return "\u2014";
  const w = stats.wins ?? 0;
  const l = stats.losses ?? 0;
  const era = stats.era ?? "\u2014";
  const k = stats.strikeOuts ?? 0;
  return `${w}-${l}  \xB7  ${era} ERA  \xB7  ${k} K`;
}
var gamePk = null;
var pollInterval = null;
var lastGameData = null;
var postgameNotificationFired = false;
function reportError(label, e) {
  console.error(`[${label}]`, e);
  let overlay = document.getElementById("error-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "error-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;background:rgba(180,0,0,0.95);color:#fff;padding:8px 12px;font-family:monospace;font-size:10px;z-index:99999;max-height:40vh;overflow-y:auto;border-bottom:2px solid #fff;line-height:1.4;white-space:pre-wrap;word-break:break-word;";
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  }
  const msg = e instanceof Error ? `${e.message}
${e.stack || ""}` : String(e);
  const line = document.createElement("div");
  line.style.cssText = "padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.2);";
  line.textContent = `[${label}] ${msg}`;
  overlay.appendChild(line);
}
window.addEventListener("error", (e) => reportError("window.error", e.error || e.message));
window.addEventListener("unhandledrejection", (e) => reportError("unhandled promise", e.reason));
var $ = (id) => document.getElementById(id);
function getLogoPath(teamId) {
  return MLB_TEAM_IDS.has(teamId) ? `/teams/dark/${teamId}.svg` : `/teams/${teamId}.svg`;
}
function loadLogo(imgEl, teamId) {
  imgEl.src = getLogoPath(teamId);
}
function formatGameTime(gameDate) {
  const d = new Date(gameDate);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
function getTeamShortName(team) {
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
function hideAllStatePanes() {
  ["pregame-content", "live-content", "final-content"].forEach((id) => {
    const el = $(id);
    if (el) el.style.display = "none";
  });
}
function renderPregameContent(data, awayTeam, homeTeam) {
  const teamsBox = data.liveData?.boxscore?.teams || {};
  const probables = data.gameData?.probablePitchers || {};
  const awayPid = probables.away?.id;
  const homePid = probables.home?.id;
  const awayLabel = $("pregame-away-pitcher-label");
  const homeLabel = $("pregame-home-pitcher-label");
  if (awayLabel) awayLabel.textContent = `${getTeamShortName(awayTeam).toUpperCase()} STARTER`;
  if (homeLabel) homeLabel.textContent = `${getTeamShortName(homeTeam).toUpperCase()} STARTER`;
  $("pregame-away-pitcher-name").textContent = probables.away?.fullName || "TBD";
  $("pregame-home-pitcher-name").textContent = probables.home?.fullName || "TBD";
  $("pregame-away-pitcher-stats").textContent = getPitcherSeasonStats(teamsBox.away, awayPid);
  $("pregame-home-pitcher-stats").textContent = getPitcherSeasonStats(teamsBox.home, homePid);
  const dt = new Date(data.gameData.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(data.gameData.datetime?.dateTime || dt.toISOString());
  $("pregame-first-pitch").textContent = `${dateStr}  \xB7  ${timeStr}`;
}
function renderLiveContent(data) {
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
  const getPlayerPos = (teamBox, playerId) => {
    if (!teamBox || !playerId) return "";
    return teamBox.players?.[`ID${playerId}`]?.position?.abbreviation || "";
  };
  $("live-away-role").textContent = awaySlotIsBatter ? "BATTER" : "PITCHER";
  $("live-away-pos").textContent = awaySlotIsBatter ? getPlayerPos(teamsBox.away, awaySlotPlayer?.id) : "";
  $("live-away-name").textContent = awaySlotPlayer?.fullName || "\u2014";
  $("live-away-stats").textContent = awaySlotIsBatter ? getBatterSeasonStats(teamsBox.away, awaySlotPlayer?.id) : getPitcherInGameLine(teamsBox.away, awaySlotPlayer?.id);
  const awayLogoEl = $("live-away-team-logo");
  if (awayLogoEl && awayTeamId) loadLogo(awayLogoEl, awayTeamId);
  $("live-home-role").textContent = homeSlotIsBatter ? "BATTER" : "PITCHER";
  $("live-home-pos").textContent = homeSlotIsBatter ? getPlayerPos(teamsBox.home, homeSlotPlayer?.id) : "";
  $("live-home-name").textContent = homeSlotPlayer?.fullName || "\u2014";
  $("live-home-stats").textContent = homeSlotIsBatter ? getBatterSeasonStats(teamsBox.home, homeSlotPlayer?.id) : getPitcherInGameLine(teamsBox.home, homeSlotPlayer?.id);
  const homeLogoEl = $("live-home-team-logo");
  if (homeLogoEl && homeTeamId) loadLogo(homeLogoEl, homeTeamId);
  const onBase = linescore.offense || {};
  $("live-bases").innerHTML = buildBasesSVG(count.outs ?? 0, onBase);
  $("live-count").textContent = `${count.balls ?? 0}\u2013${count.strikes ?? 0}`;
  const pitches = (currentPlay.playEvents || []).filter((e) => e.isPitch);
  $("live-zone-container").innerHTML = buildStrikeZoneSVG(pitches);
  const lastPitch = pitches[pitches.length - 1];
  const pitchEl = $("live-pitch-latest");
  if (lastPitch) {
    const info = pitchInfo(lastPitch.details?.type?.code);
    const velo = lastPitch.pitchData?.startSpeed?.toFixed(1) ?? "\u2014";
    const isInPlay = lastPitch.details?.isInPlay;
    const isStrike = lastPitch.details?.isStrike;
    const isFoul = (lastPitch.details?.description || "").toLowerCase().includes("foul");
    let resCls = "live-pr-ball";
    let resLbl = "BALL";
    if (isInPlay) {
      resCls = "live-pr-contact";
      resLbl = "IN PLAY";
    } else if (isFoul) {
      resCls = "live-pr-foul";
      resLbl = "FOUL";
    } else if (isStrike) {
      resCls = "live-pr-strike";
      resLbl = "STR";
    }
    pitchEl.innerHTML = `
      <span class="live-pitch-num">PITCH ${pitches.length}</span>
      <span class="live-pitch-badge" style="background:${info.color}">${info.abbr}</span>
      <span class="live-pitch-type">${info.label}</span>
      <span class="live-pitch-velo">${velo} mph</span>
      <span class="live-pitch-result ${resCls}">${resLbl}</span>
    `;
  } else {
    pitchEl.innerHTML = '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">Waiting for first pitch\u2026</span>';
  }
  const resultEvent = currentPlay.result?.event || "";
  const resultDesc = currentPlay.result?.description || "";
  const resultEl = $("live-result");
  if (resultEvent || resultDesc) {
    resultEl.innerHTML = `
      ${resultEvent ? `<div class="live-event">${resultEvent}</div>` : ""}
      ${resultDesc ? `<div class="live-desc">${resultDesc}</div>` : ""}
    `;
  } else {
    resultEl.innerHTML = "";
  }
}
function shortName(name) {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0] ?? "";
  const SUFFIX = ["Jr.", "Jr", "Sr.", "Sr", "II", "III", "IV", "V"];
  const lastPart = parts[parts.length - 1] ?? "";
  const useSecondToLast = SUFFIX.includes(lastPart) && parts.length > 2;
  const surname = useSecondToLast ? parts[parts.length - 2] ?? "" : lastPart;
  const firstInitial = parts[0]?.[0] ?? "";
  return `${firstInitial}. ${surname}`;
}
function fmtAvg(v) {
  if (!v || v === ".000" || v === "0.000") return ".000";
  const f = parseFloat(v);
  if (isNaN(f)) return ".000";
  return f < 1 ? "." + String(Math.round(f * 1e3)).padStart(3, "0") : String(v);
}
function buildBattingRow(player, displayNum, s) {
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
function buildPitchingRow(player, s) {
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
function buildBoxPanel(teamStats) {
  if (!teamStats?.players) {
    return '<div class="bs-empty">Lineups not yet available</div>';
  }
  const rawBatters = teamStats.batters || [];
  const pitchers = teamStats.pitchers || [];
  const batters = rawBatters.filter((id) => {
    const pos = teamStats.players?.[`ID${id}`]?.position?.abbreviation;
    return pos && pos !== "P" && pos !== "Pitcher";
  });
  if (!batters.length && !pitchers.length) {
    return '<div class="bs-empty">Lineups not yet available</div>';
  }
  const battingRows = batters.map((id, i) => {
    const player = teamStats.players?.[`ID${id}`];
    if (!player) return "";
    const s = player.seasonStats?.batting;
    return buildBattingRow(player, i + 1, s);
  }).filter(Boolean).join("");
  const pitchingRows = pitchers.map((id) => {
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
function renderBoxScore(data) {
  const awayTeam = data.gameData?.teams?.away;
  const homeTeam = data.gameData?.teams?.home;
  const boxscore = data.liveData?.boxscore;
  if (!awayTeam || !homeTeam || !boxscore) return;
  const awayAbbrEl = $("bs-away-tab-abbr");
  const homeAbbrEl = $("bs-home-tab-abbr");
  if (awayAbbrEl) awayAbbrEl.textContent = awayTeam.abbreviation || "?";
  if (homeAbbrEl) homeAbbrEl.textContent = homeTeam.abbreviation || "?";
  const awayLogoEl = $("bs-away-tab-logo");
  const homeLogoEl = $("bs-home-tab-logo");
  if (awayLogoEl && awayTeam.id) loadLogo(awayLogoEl, awayTeam.id);
  if (homeLogoEl && homeTeam.id) loadLogo(homeLogoEl, homeTeam.id);
  const wrap = document.querySelector(".bs-panel-wrap");
  const savedScroll = wrap?.scrollTop ?? 0;
  const awayPanel = $("bs-away-panel");
  const homePanel = $("bs-home-panel");
  if (awayPanel) awayPanel.innerHTML = buildBoxPanel(boxscore.teams?.away);
  if (homePanel) homePanel.innerHTML = buildBoxPanel(boxscore.teams?.home);
  if (wrap) wrap.scrollTop = savedScroll;
}
function setupBoxScoreTeamTabs() {
  document.querySelectorAll(".bs-team-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const team = btn.dataset.bsTeam;
      if (!team) return;
      document.querySelectorAll(".bs-team-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".bs-panel").forEach((p) => p.classList.remove("active"));
      $(`bs-${team}-panel`)?.classList.add("active");
      const wrap = document.querySelector(".bs-panel-wrap");
      if (wrap) wrap.scrollTop = 0;
    });
  });
}
function getEventBadge(eventType) {
  if (!eventType) return "?";
  const exact = {
    "Single": "1B",
    "Double": "2B",
    "Triple": "3B",
    "Home Run": "HR",
    "Strikeout": "K",
    "Walk": "BB",
    "Intent Walk": "IBB",
    "Hit By Pitch": "HBP",
    "Grounded Into DP": "DP",
    "Field Error": "E",
    "Fielders Choice": "FC",
    "Fielders Choice Out": "FC",
    "Double Play": "DP",
    "Catcher Interference": "CI",
    "Caught Stealing 2B": "CS",
    "Caught Stealing 3B": "CS",
    "Pickoff Caught Stealing 2B": "CS",
    "Pickoff Caught Stealing 3B": "CS",
    "Stolen Base 2B": "SB",
    "Stolen Base 3B": "SB",
    "Stolen Base Home": "SB",
    "Sac Fly": "SAC",
    "Sac Bunt": "SAC",
    "Wild Pitch": "WP",
    "Passed Ball": "PB"
  };
  if (exact[eventType]) return exact[eventType];
  if (eventType.includes("Substitution") || eventType.includes("Switch")) return "\u2194";
  if (/error/i.test(eventType)) return "E";
  if (/out/i.test(eventType)) return "OUT";
  return eventType.slice(0, 3).toUpperCase();
}
function buildPlayScorebug(play) {
  const count = play.count || {};
  const outs = count.outs ?? 0;
  const balls = count.balls ?? 0;
  const strikes = count.strikes ?? 0;
  const onBase = {
    first: !!play.matchup?.postOnFirst,
    second: !!play.matchup?.postOnSecond,
    third: !!play.matchup?.postOnThird
  };
  const outFill = (n) => outs >= n ? "#bf0d3d" : "rgba(255,255,255,0.08)";
  const baseFill = (b) => b ? "#bf0d3d" : "rgba(255,255,255,0.08)";
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
function buildPlayCard(play, awayAbbr, homeAbbr, showScore) {
  const inning = play.about?.inning ?? 1;
  const isTop = play.about?.isTopInning;
  const inningTxt = `${isTop ? "\u25B2" : "\u25BC"} ${inning}`;
  const event = play.result?.event || "\u2014";
  const eventBadge = getEventBadge(event);
  const desc = play.result?.description || "";
  const hitData = play.playEvents?.find((e) => e?.hitData)?.hitData || {};
  const exitVelo = hitData.launchSpeed ? `${Math.round(hitData.launchSpeed)} mph` : "";
  const launchAngle = hitData.launchAngle != null ? `${Math.round(hitData.launchAngle)}\xB0` : "";
  const distance = hitData.totalDistance ? `${Math.round(hitData.totalDistance)} ft` : "";
  const hasStatcast = exitVelo || launchAngle || distance;
  let scoreHtml = "";
  if (showScore && play.result?.awayScore != null && play.result?.homeScore != null) {
    const rbiHtml = play.result.rbi > 0 ? `<span class="play-rbi">+${play.result.rbi} RBI</span>` : "";
    scoreHtml = `<div class="play-score-line">
      <span class="play-score">${awayAbbr} ${play.result.awayScore} \u2014 ${homeAbbr} ${play.result.homeScore}</span>
      ${rbiHtml}
    </div>`;
  }
  let statcastHtml = "";
  if (hasStatcast) {
    const chips = [];
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
function renderScoringPlays(data) {
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
  const cards = [...scoringIdx].reverse().map((idx) => {
    const play = allPlays[idx];
    if (!play) return "";
    return buildPlayCard(play, awayAbbr, homeAbbr, true);
  }).filter(Boolean).join("");
  container.innerHTML = cards;
  if (tabEl) tabEl.scrollTop = savedScroll;
}
function renderAllPlays(data) {
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
  const completed = allPlays.filter((p) => p.result?.event);
  if (!completed.length) {
    container.innerHTML = '<div class="plays-empty">Awaiting first play</div>';
    return;
  }
  const cards = [...completed].reverse().map(
    (play) => buildPlayCard(play, awayAbbr, homeAbbr, false)
  ).join("");
  container.innerHTML = cards;
  if (tabEl) tabEl.scrollTop = savedScroll;
}
function renderFinalContent(data) {
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
  const awayLogoEl = $("final-away-team-logo");
  const homeLogoEl = $("final-home-team-logo");
  if (awayLogoEl && awayTeamId) loadLogo(awayLogoEl, awayTeamId);
  if (homeLogoEl && homeTeamId) loadLogo(homeLogoEl, homeTeamId);
  let awayPitcher = null;
  let homePitcher = null;
  let awayDecision = "";
  let homeDecision = "";
  if (awayWon) {
    awayPitcher = winner;
    homePitcher = loser;
    awayDecision = "W";
    homeDecision = "L";
  } else if (homeWon) {
    awayPitcher = loser;
    homePitcher = winner;
    awayDecision = "L";
    homeDecision = "W";
  }
  const getFinalPitcherLine = (teamBox, pitcherId) => {
    if (!teamBox || !pitcherId) return "\u2014";
    const game = teamBox.players?.[`ID${pitcherId}`]?.stats?.pitching;
    if (!game) return "\u2014";
    const ip = game.inningsPitched ?? "0.0";
    const h = game.hits ?? 0;
    const er = game.earnedRuns ?? 0;
    const k = game.strikeOuts ?? 0;
    return `${ip} IP \xB7 ${h} H \xB7 ${er} ER \xB7 ${k} K`;
  };
  $("final-away-pitcher-name").textContent = awayPitcher?.fullName || "\u2014";
  $("final-away-pitcher-stats").textContent = getFinalPitcherLine(teamsBox.away, awayPitcher?.id);
  const awayDecEl = $("final-away-decision");
  awayDecEl.textContent = awayDecision || "\u2014";
  awayDecEl.classList.remove("win", "loss");
  if (awayDecision === "W") awayDecEl.classList.add("win");
  else if (awayDecision === "L") awayDecEl.classList.add("loss");
  $("final-home-pitcher-name").textContent = homePitcher?.fullName || "\u2014";
  $("final-home-pitcher-stats").textContent = getFinalPitcherLine(teamsBox.home, homePitcher?.id);
  const homeDecEl = $("final-home-decision");
  homeDecEl.textContent = homeDecision || "\u2014";
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
    const name = performer.player.person?.fullName || "\u2014";
    const type = performer.type;
    const isPitcher = type === "pitcher" || type === "starter";
    let stats = "\u2014";
    if (isPitcher) {
      const p = performer.player.stats?.pitching;
      if (p?.summary) stats = p.summary;
      else if (p) stats = `${p.inningsPitched || "0"} IP \xB7 ${p.earnedRuns ?? 0} ER \xB7 ${p.strikeOuts ?? 0} K`;
    } else {
      const b = performer.player.stats?.batting;
      if (b?.summary) stats = b.summary;
      else if (b) stats = `${b.hits ?? 0}-${b.atBats ?? 0} \xB7 ${b.runs ?? 0} R \xB7 ${b.rbi ?? 0} RBI`;
    }
    const nameEl = slot.querySelector(".final-performer-name");
    const statsEl = slot.querySelector(".final-performer-stats");
    if (nameEl) nameEl.textContent = name;
    if (statsEl) statsEl.textContent = stats;
  }
}
var MLB_TEAM_COLORS = {
  108: "#BA0021",
  109: "#A71930",
  110: "#DF4601",
  111: "#BD3039",
  112: "#0E3386",
  113: "#C6011F",
  114: "#E50022",
  115: "#7C6BAF",
  116: "#FA4616",
  117: "#EB6E1F",
  118: "#004687",
  119: "#005A9C",
  120: "#AB0003",
  121: "#FF5910",
  133: "#003831",
  134: "#FDB827",
  135: "#FFC72C",
  136: "#005C5C",
  137: "#FD5A1E",
  138: "#C41E3A",
  139: "#8FBCE6",
  140: "#003278",
  141: "#134A8E",
  142: "#D31145",
  143: "#E81828",
  144: "#CE1141",
  145: "#C4CED4",
  146: "#00A3E0",
  147: "#C4CED3",
  158: "#ffc52f"
};
var WBC_COLORS = {
  "Japan": "#BC002D",
  "USA": "#BF0A30",
  "Korea": "#CD2E3A",
  "Venezuela": "#CF0921",
  "Mexico": "#006847",
  "Puerto Rico": "#ED0000",
  "Dominican Republic": "#002D62",
  "Canada": "#FF0000",
  "Cuba": "#002A8F",
  "Italy": "#009246"
};
function getTeamColor(id, name = "") {
  if (id && MLB_TEAM_COLORS[id]) return MLB_TEAM_COLORS[id];
  if (name && WBC_COLORS[name]) return WBC_COLORS[name];
  return "#535557";
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var winProbCache = null;
var winProbCacheGamePk = null;
async function fetchWinProb() {
  if (!gamePk) return null;
  try {
    const res = await fetch(`/api/winprob/${gamePk}`);
    if (!res.ok) return winProbCache;
    const data = await res.json();
    if (Array.isArray(data)) {
      winProbCache = data;
      winProbCacheGamePk = gamePk;
      return data;
    }
    return winProbCache;
  } catch (e) {
    console.error("fetchWinProb error:", e);
    return winProbCache;
  }
}
async function renderWinProb() {
  const container = $("tab-winprob");
  if (!container) return;
  if (!lastGameData) {
    container.innerHTML = '<div class="placeholder">Waiting for game data\u2026</div>';
    return;
  }
  const awayTeam = lastGameData.gameData?.teams?.away;
  const homeTeam = lastGameData.gameData?.teams?.home;
  if (!awayTeam || !homeTeam) {
    container.innerHTML = '<div class="placeholder">Waiting for game data\u2026</div>';
    return;
  }
  if (!container.querySelector(".wp-summary")) {
    container.innerHTML = '<div class="placeholder">Loading win probability\u2026</div>';
  }
  const wpData = await fetchWinProb();
  if (!wpData || !wpData.length) {
    container.innerHTML = '<div class="placeholder">Win probability not available</div>';
    return;
  }
  const awayId = awayTeam.id;
  const homeId = homeTeam.id;
  const awayName = awayTeam.name || "";
  const homeName = homeTeam.name || "";
  const awayAbbr = awayTeam.abbreviation || awayTeam.teamName || "AWY";
  const homeAbbr = homeTeam.abbreviation || homeTeam.teamName || "HOM";
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
  const pts = wpData.map((d, i) => ({
    x: PL + i * stepX,
    y: PT + CH / 2 + ((d.homeTeamWinProbability ?? 50) - 50) / 50 * (CH / 2),
    homeProb: d.homeTeamWinProbability ?? 50,
    awayProb: d.awayTeamWinProbability ?? 50,
    added: d.homeTeamWinProbabilityAdded,
    event: d.result?.event || "",
    desc: d.result?.description || "",
    inning: d.about?.inning || 0,
    isTop: !!d.about?.isTopInning
  }));
  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const polyPts = [`${PL},${midY}`, ...pts.map((p) => `${p.x},${p.y}`), `${PL + CW},${midY}`].join(" ");
  let inningLines = "";
  let lastInn = 0;
  pts.forEach((p) => {
    if (p.inning && p.inning !== lastInn && p.isTop) {
      lastInn = p.inning;
      inningLines += `
        <line x1="${p.x}" y1="${PT}" x2="${p.x}" y2="${PT + CH}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${p.x}" y1="${PT + CH}" x2="${p.x}" y2="${PT + CH + 5}" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <text x="${p.x}" y="${PT + CH + 15}" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.55)" font-family="DM Mono, monospace">${p.inning}</text>`;
    }
  });
  const zones = pts.map((p, i) => {
    const prev = pts[i - 1];
    const next = pts[i + 1];
    const x = i === 0 ? PL : prev ? prev.x + (p.x - prev.x) / 2 : PL;
    const nx = i === pts.length - 1 ? PL + CW : next ? p.x + (next.x - p.x) / 2 : PL + CW;
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
        <img class="wp-team-logo" src="${getLogoPath(awayId)}" alt="${awayAbbr}">
        <span class="wp-team-pct" style="color:${awayColor}">${awayProb}%</span>
      </div>
      <div class="wp-title">WIN PROBABILITY</div>
      <div class="wp-team wp-team-home">
        <span class="wp-team-pct" style="color:${homeColor}">${homeProb}%</span>
        <img class="wp-team-logo" src="${getLogoPath(homeId)}" alt="${homeAbbr}">
      </div>
    </div>

    <div class="wp-prob-bar">
      <div class="wp-prob-bar-fill" style="width:${awayProb}%;background:${awayColor};"></div>
      <div class="wp-prob-bar-fill" style="width:${homeProb}%;background:${homeColor};"></div>
    </div>

    <div class="wp-chart-wrap">
      <div class="wp-tooltip" id="wp-tooltip"></div>
      <svg class="wp-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <rect x="${PL}" y="${PT}" width="${CW}" height="${CH}" fill="rgba(255,255,255,0.04)" rx="2"/>
        <defs>
          <clipPath id="wp-clip-top"><rect x="${PL}" y="${PT}" width="${CW}" height="${CH / 2}"/></clipPath>
          <clipPath id="wp-clip-bot"><rect x="${PL}" y="${PT + CH / 2}" width="${CW}" height="${CH / 2}"/></clipPath>
        </defs>
        <polygon points="${polyPts}" fill="${awayColor}" opacity="0.9" clip-path="url(#wp-clip-top)"/>
        <polygon points="${polyPts}" fill="${homeColor}" opacity="0.9" clip-path="url(#wp-clip-bot)"/>
        <line x1="${PL}" y1="${midY}" x2="${PL + CW}" y2="${midY}" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="4,3"/>
        <text x="${PL - 4}" y="${midY + 3}" text-anchor="end" font-size="8" fill="rgba(255,255,255,0.55)" font-family="DM Mono, monospace">50%</text>
        <text x="${PL - 4}" y="${PT + 6}" text-anchor="end" font-size="8" fill="${awayColor}" font-family="DM Mono, monospace">${awayAbbr}</text>
        <text x="${PL - 4}" y="${PT + CH + 2}" text-anchor="end" font-size="8" fill="${homeColor}" font-family="DM Mono, monospace">${homeAbbr}</text>
        ${inningLines}
        <polyline points="${linePoints}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.2" stroke-linejoin="round"/>
        ${zones}
        <circle id="wp-dot" cx="0" cy="0" r="4" fill="#fff" stroke="rgba(255,255,255,0.6)" stroke-width="2" style="display:none;pointer-events:none;"/>
        <text x="${PL + CW / 2}" y="${H - 2}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.45)" font-family="DM Mono, monospace">INNING</text>
      </svg>
    </div>

    <div class="wp-legend">
      <div class="wp-legend-item"><span class="wp-legend-swatch" style="background:${awayColor}"></span>${awayName}</div>
      <div class="wp-legend-item"><span class="wp-legend-swatch" style="background:${homeColor}"></span>${homeName}</div>
    </div>
  `;
  wireWinProbHover(awayAbbr, homeAbbr, awayColor, homeColor);
}
function wireWinProbHover(awayAbbr, homeAbbr, awayColor, homeColor) {
  const chart = document.querySelector(".wp-chart");
  const tooltip = $("wp-tooltip");
  const dot = document.getElementById("wp-dot");
  if (!chart || !tooltip || !dot) return;
  const showFor = (z) => {
    const ds = z.dataset;
    dot.setAttribute("cx", ds.x || "0");
    dot.setAttribute("cy", ds.y || "0");
    dot.style.display = "block";
    const addedLine = ds.added !== "N/A" ? `<div class="${ds.acls}">${ds.sign}${ds.added}% WP shift</div>` : "";
    tooltip.innerHTML = `
      ${ds.inn ? `<div class="wp-tt-inn">${ds.inn}</div>` : ""}
      ${ds.event ? `<div class="wp-tt-event">${ds.event}</div>` : ""}
      ${ds.desc ? `<div class="wp-tt-desc">${ds.desc}</div>` : ""}
      ${addedLine}
      <div class="wp-tt-probs"><span style="color:${awayColor}">${awayAbbr} ${ds.away}%</span><span style="color:${homeColor}">${homeAbbr} ${ds.home}%</span></div>`;
    tooltip.style.display = "block";
  };
  const hide = () => {
    tooltip.style.display = "none";
    dot.style.display = "none";
  };
  chart.querySelectorAll(".wp-zone").forEach((zone) => {
    const z = zone;
    z.addEventListener("mouseenter", () => showFor(z));
    z.addEventListener("mouseleave", hide);
    z.addEventListener("click", (e) => {
      e.stopPropagation();
      showFor(z);
    });
  });
}
function setupWinProbDismiss() {
  document.addEventListener("click", (e) => {
    const tip = document.getElementById("wp-tooltip");
    if (!tip || tip.style.display === "none") return;
    const target = e.target;
    if (target?.closest(".wp-chart")) return;
    tip.style.display = "none";
    const dotEl = document.getElementById("wp-dot");
    if (dotEl) dotEl.style.display = "none";
  });
}
async function selectGameForThisPost() {
  try {
    const res = await fetch("/api/post-game");
    if (res.ok) {
      const data = await res.json();
      if (data?.gamePk) return Number(data.gamePk);
    }
  } catch (e) {
  }
  return selectTodaysGame();
}
async function selectTodaysGame() {
  const today = /* @__PURE__ */ new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  try {
    const res = await fetch(`/api/schedule?date=${dateStr}`);
    const data = await res.json();
    const games = data?.dates?.[0]?.games || [];
    if (!games.length) return null;
    const live = games.find((g) => isLiveState(g.status?.detailedState || ""));
    if (live) return live.gamePk;
    const upcoming = games.find((g) => isPreGameState(g.status?.detailedState || ""));
    if (upcoming) return upcoming.gamePk;
    return games[0].gamePk;
  } catch (e) {
    console.error("selectTodaysGame error:", e);
    return null;
  }
}
async function fetchAndRender(pk) {
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
function render(data) {
  lastGameData = data;
  const game = data.gameData;
  const linescore = data.liveData.linescore;
  const statusText = game.status.detailedState;
  const awayTeam = game.teams.away;
  const homeTeam = game.teams.home;
  document.body.classList.toggle("is-pregame", isPreGameState(statusText));
  document.body.classList.toggle("is-live", isLiveState(statusText));
  document.body.classList.toggle("is-final", isFinalState(statusText));
  void maybeNotifyPostgame(statusText);
  const loading = $("loading-state");
  const content = $("scorebug-content");
  loading.style.display = "none";
  content.style.display = "";
  const venueName = game.venue?.name || "";
  const dt = new Date(game.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(game.datetime?.dateTime || dt.toISOString());
  $("venue-info").textContent = `${venueName.toUpperCase()} \xB7 ${dateStr} \xB7 ${timeStr}`;
  const broadcasts = game.broadcasts || [];
  const tvBroadcast = broadcasts.find((b) => b.type === "TV" && b.isNational);
  $("network-info").textContent = tvBroadcast?.name || "";
  $("away-logo").alt = awayTeam.name;
  $("home-logo").alt = homeTeam.name;
  loadLogo($("away-logo"), awayTeam.id);
  loadLogo($("home-logo"), homeTeam.id);
  $("away-name").textContent = getTeamShortName(awayTeam);
  $("home-name").textContent = getTeamShortName(homeTeam);
  const awayRec = awayTeam.record;
  const homeRec = homeTeam.record;
  $("away-record").textContent = awayRec ? `${awayRec.wins}-${awayRec.losses}` : "";
  $("home-record").textContent = homeRec ? `${homeRec.wins}-${homeRec.losses}` : "";
  $("away-score").textContent = String(linescore?.teams?.away?.runs ?? 0);
  $("home-score").textContent = String(linescore?.teams?.home?.runs ?? 0);
  const badge = $("status-badge");
  const inning = $("inning-info");
  const countBlock = $("status-count");
  hideAllStatePanes();
  if (isFinalState(statusText)) {
    badge.textContent = "FINAL";
    badge.style.background = "#bf0d3d";
    const n = linescore?.currentInning || 9;
    inning.textContent = n !== 9 ? `F/${n}` : "";
    inning.style.color = "#bf0d3d";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "WRAP";
    const finEl = $("final-content");
    if (finEl) finEl.style.display = "block";
    try {
      renderFinalContent(data);
    } catch (e) {
      reportError("renderFinalContent", e);
    }
  } else if (isPreGameState(statusText)) {
    badge.textContent = "";
    inning.textContent = timeStr;
    inning.style.color = "rgba(255,255,255,0.7)";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "GAME INFO";
    const preEl = $("pregame-content");
    if (preEl) preEl.style.display = "block";
    try {
      renderPregameContent(data, awayTeam, homeTeam);
    } catch (e) {
      reportError("renderPregameContent", e);
    }
  } else if (statusText === "Postponed") {
    badge.textContent = "PPD";
    badge.style.background = "rgba(255,255,255,0.15)";
    inning.textContent = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "PPD";
  } else if (isLiveState(statusText)) {
    badge.textContent = "LIVE";
    badge.style.background = "#bf0d3d";
    const half = linescore?.inningHalf === "Top" ? "\u25B2" : "\u25BC";
    inning.textContent = `${half} ${linescore?.currentInning || ""}`;
    inning.style.color = "#bf0d3d";
    const cp = data.liveData?.plays?.currentPlay;
    const count = cp?.count;
    if (count) {
      $("balls").textContent = String(count.balls ?? 0);
      $("strikes").textContent = String(count.strikes ?? 0);
      $("outs").textContent = String(count.outs ?? 0);
      countBlock.style.display = "flex";
    } else {
      countBlock.style.display = "none";
    }
    $("dynamic-tab-label").textContent = "LIVE";
    const liveEl = $("live-content");
    if (liveEl) liveEl.style.display = "block";
    try {
      renderLiveContent(data);
    } catch (e) {
      reportError("renderLiveContent", e);
    }
  } else {
    badge.textContent = statusText.toUpperCase();
    badge.style.background = "rgba(255,255,255,0.15)";
    inning.textContent = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = statusText.toUpperCase();
  }
  try {
    renderLinescore(linescore, awayTeam, homeTeam, isFinalState(statusText));
  } catch (e) {
    reportError("renderLinescore", e);
  }
  try {
    renderBoxScore(data);
  } catch (e) {
    reportError("renderBoxScore", e);
  }
  try {
    renderScoringPlays(data);
  } catch (e) {
    reportError("renderScoringPlays", e);
  }
  try {
    renderAllPlays(data);
  } catch (e) {
    reportError("renderAllPlays", e);
  }
  if ($("tab-winprob")?.classList.contains("tab-content-active")) {
    void renderWinProb();
  }
}
function renderLinescore(linescore, awayTeam, homeTeam, isFinal) {
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
    headerCells += `<th class="ls-inning-h${i === currentInning ? " ls-current" : ""}">${i}</th>`;
  }
  headerCells += '<th class="ls-total ls-r-header">R</th><th class="ls-total ls-h-header">H</th><th class="ls-total ls-e-header">E</th>';
  const buildRow = (teamKey, team) => {
    const abbr = team.abbreviation || team.teamName?.slice(0, 3).toUpperCase() || "\u2014";
    let cells = `<td class="ls-team-col">
      <img class="ls-team-logo" src="${getLogoPath(team.id)}" alt="${abbr}">
      <span class="ls-team-abbr">${abbr}</span>
    </td>`;
    for (let i = 1; i <= maxInnings; i++) {
      const inn = innings.find((x) => x.num === i);
      const runs = inn?.[teamKey]?.runs;
      const isCurrent = i === currentInning;
      let cls = "ls-inning";
      if (runs == null) cls += " ls-empty";
      else if (runs === 0) cls += " ls-zero";
      else cls += " ls-nonzero";
      if (isCurrent) cls += " ls-current";
      cells += `<td class="${cls}">${runs == null ? "\u2013" : runs}</td>`;
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
  $("linescore-container").innerHTML = `
    <table class="linescore-compact">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>
        <tr class="ls-row-away ${awayRowClass}">${buildRow("away", awayTeam)}</tr>
        <tr class="ls-row-home ${homeRowClass}">${buildRow("home", homeTeam)}</tr>
      </tbody>
    </table>`;
}
function setupTabs() {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      if (!targetTab) return;
      document.body.classList.toggle("on-box-tab", targetTab === "box");
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab-active"));
      btn.classList.add("tab-active");
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("tab-content-active"));
      $(`tab-${targetTab}`)?.classList.add("tab-content-active");
      if (targetTab === "winprob") {
        void renderWinProb();
      }
    });
  });
}
function startPolling(pk) {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(() => fetchAndRender(pk), 1e4);
}
async function maybeNotifyPostgame(statusText) {
  if (postgameNotificationFired) return;
  if (!isFinalState(statusText)) return;
  postgameNotificationFired = true;
  try {
    await fetch("/api/postgame-check", { method: "POST" });
  } catch (e) {
    console.error("postgame notify failed:", e);
  }
}
(async () => {
  setupTabs();
  setupBoxScoreTeamTabs();
  setupWinProbDismiss();
  gamePk = await selectGameForThisPost();
  if (!gamePk) {
    $("loading-state").textContent = "No games today.";
    return;
  }
  await fetchAndRender(gamePk);
  startPolling(gamePk);
})();
//# sourceMappingURL=splash.js.map
