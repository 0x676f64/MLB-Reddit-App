/**
 * ktrace.mjs — dump what MLB actually published, snapshot by snapshot, across
 * an inning-ending strikeout.
 *
 *   node ktrace.mjs <gamePk> [howManyStrikeouts]
 *
 * kdiag proved the RESOLUTION (result.description + about.isComplete) publishes
 * at +0s. But the app reads its count AND its outs circles from ONE object:
 * currentPlay.count. So this prints that object directly, plus the linescore,
 * for every snapshot spanning the strikeout.
 *
 * What we're looking for: does a published snapshot ever show
 * strikes=3 with outs=2? If yes, that state is real and we render it faithfully
 * (and the fix is to prefer a more reliable field). If no, we're building that
 * state ourselves and the bug is in our render path.
 */

const pk = process.argv[2];
const limit = Number(process.argv[3] || 2);
if (!pk || !/^\d+$/.test(pk)) {
  console.error("usage: node ktrace.mjs <gamePk> [howManyStrikeouts]");
  process.exit(1);
}

const BASE = `https://statsapi.mlb.com/api/v1.1/game/${pk}/feed/live`;
const WINDOW_BEFORE_MS = 20000;
const WINDOW_AFTER_MS = 45000;

const tcToEpoch = (tc) => {
  const m = /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/.exec(tc);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : NaN;
};
const getJSON = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};
const pad = (s, n) => String(s).padEnd(n);

const main = async () => {
  const tcs = (await getJSON(`${BASE}/timestamps`))
    .map((tc) => ({ tc, t: tcToEpoch(tc) }))
    .filter((x) => !Number.isNaN(x.t))
    .sort((a, b) => a.t - b.t);

  const final = await getJSON(BASE);
  const targets = (final?.liveData?.plays?.allPlays || [])
    .filter((p) => String(p?.result?.eventType || "").toLowerCase().includes("strikeout")
      && p?.count?.outs === 3)
    .slice(0, limit);

  if (!targets.length) {
    console.log("no inning-ending strikeouts found.");
    return;
  }

  for (const play of targets) {
    const idx = play.about?.atBatIndex;
    const evs = (play.playEvents || []).filter((e) => e.isPitch);
    const pitchAt = Date.parse(evs[evs.length - 1]?.endTime || "");
    if (Number.isNaN(pitchAt)) continue;

    console.log(`\n${"=".repeat(78)}`);
    console.log(`${play.about?.halfInning} ${play.about?.inning} — ${play.result?.description}`);
    console.log(`atBatIndex ${idx}  |  3rd strike at ${new Date(pitchAt).toISOString()}`);
    console.log(`${"=".repeat(78)}`);
    console.log(pad("timecode", 17) + pad("t", 7) + pad("curPlay", 9) +
      pad("count", 8) + pad("outs", 6) + pad("done", 6) + pad("desc", 6) +
      pad("ls.outs", 9) + "inningState");
    console.log("-".repeat(78));

    const window = tcs.filter((x) =>
      x.t >= pitchAt - WINDOW_BEFORE_MS && x.t <= pitchAt + WINDOW_AFTER_MS);

    for (const { tc, t } of window) {
      const snap = await getJSON(`${BASE}?timecode=${tc}`);
      const cp = snap?.liveData?.plays?.currentPlay;
      const ls = snap?.liveData?.linescore;
      const c = cp?.count || {};
      const rel = ((t - pitchAt) / 1000).toFixed(0);
      console.log(
        pad(tc, 17) +
        pad((rel >= 0 ? "+" : "") + rel + "s", 7) +
        pad(cp?.about?.atBatIndex ?? "-", 9) +
        pad(`${c.balls ?? "-"}-${c.strikes ?? "-"}`, 8) +
        pad(c.outs ?? "-", 6) +
        pad(cp?.about?.isComplete ? "yes" : "no", 6) +
        pad(cp?.result?.description ? "yes" : "no", 6) +
        pad(ls?.outs ?? "-", 9) +
        (ls?.inningState ?? "-"),
      );
    }
  }

  console.log(`\nRead the "count" and "outs" columns together. If you never see`);
  console.log(`strikes=3 alongside outs=2, then that state is ours, not MLB's.\n`);
};

main().catch((e) => { console.error("failed:", e.message); process.exit(1); });
