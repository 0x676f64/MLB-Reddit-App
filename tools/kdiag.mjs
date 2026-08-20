



















/**
 * kdiag.mjs — replay a FINISHED game and measure how long MLB took to publish
 * the resolution of each inning-ending strikeout.
 *
 *   node kdiag.mjs <gamePk>
 *
 * Why this exists: when an inning ends on a K, the app sometimes holds on
 * "2 outs, 3 strikes, no description" until the next half-inning. Two possible
 * causes, and they need opposite fixes:
 *
 *   A) MLB publishes the resolution promptly and our delayed cursor is stuck
 *      -> our bug, fixable in serveDelayedGame
 *   B) MLB publishes the 3rd strike, then goes quiet and doesn't publish the
 *      resolved out until the next half-inning starts
 *      -> their feed; nothing we can do server-side
 *
 * This measures the gap directly. Run it on any completed game.
 */

const pk = process.argv[2];
if (!pk || !/^\d+$/.test(pk)) {
  console.error("usage: node kdiag.mjs <gamePk>   e.g. node kdiag.mjs 776543");
  process.exit(1);
}

const BASE = `https://statsapi.mlb.com/api/v1.1/game/${pk}/feed/live`;
const MAX_PROBES = 18; // how many snapshots forward to check per strikeout

const tcToEpoch = (tc) => {
  const m = /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/.exec(tc);
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
};

const getJSON = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

const main = async () => {
  console.log(`\nGame ${pk} — inning-ending strikeout publish timing\n`);

  const timestamps = await getJSON(`${BASE}/timestamps`);
  const tcs = (Array.isArray(timestamps) ? timestamps : [])
    .map((tc) => ({ tc, t: tcToEpoch(tc) }))
    .filter((x) => !Number.isNaN(x.t))
    .sort((a, b) => a.t - b.t);
  if (!tcs.length) {
    console.error("no timestamps returned — is that gamePk right?");
    process.exit(1);
  }
  console.log(`${tcs.length} published snapshots, ` +
    `${tcs[0].tc} .. ${tcs[tcs.length - 1].tc}\n`);

  const final = await getJSON(BASE);
  const allPlays = final?.liveData?.plays?.allPlays || [];

  // inning-ending strikeouts: a K that produced the 3rd out
  const targets = allPlays.filter((p) => {
    const ev = String(p?.result?.eventType || "").toLowerCase();
    return ev.includes("strikeout") && (p?.count?.outs === 3);
  });

  if (!targets.length) {
    console.log("no inning-ending strikeouts in this game.");
    return;
  }
  console.log(`${targets.length} inning-ending strikeout(s) found.\n`);

  for (const play of targets) {
    const idx = play.about?.atBatIndex;
    const half = `${play.about?.halfInning ?? "?"} ${play.about?.inning ?? "?"}`;
    const desc = play.result?.description || play.result?.event || "(no description)";

    // last pitch of the at-bat = the 3rd strike
    const evs = (play.playEvents || []).filter((e) => e.isPitch);
    const lastPitch = evs[evs.length - 1];
    const pitchAt = lastPitch?.endTime ? Date.parse(lastPitch.endTime) : NaN;
    if (Number.isNaN(pitchAt)) {
      console.log(`- ${half}: no pitch timestamp, skipping`);
      continue;
    }

    // walk forward through published snapshots from the 3rd strike and find the
    // first one that actually contains the resolved play
    let start = tcs.findIndex((x) => x.t >= pitchAt - 2000);
    if (start < 0) start = 0;

    let resolvedAt = null;
    let probes = 0;
    for (let i = start; i < tcs.length && probes < MAX_PROBES; i++, probes++) {
      const snap = await getJSON(`${BASE}?timecode=${tcs[i].tc}`);
      const plays = snap?.liveData?.plays?.allPlays || [];
      const match = plays.find((p) => p?.about?.atBatIndex === idx);
      if (match?.result?.description && match?.about?.isComplete) {
        resolvedAt = tcs[i];
        break;
      }
    }

    console.log(`${half}`);
    console.log(`  ${desc}`);
    console.log(`  3rd strike thrown : ${new Date(pitchAt).toISOString()}`);
    if (resolvedAt) {
      const gap = Math.round((resolvedAt.t - pitchAt) / 1000);
      console.log(`  resolution published: ${resolvedAt.tc}  (+${gap}s after the pitch)`);
      console.log(`  ${gap <= 15
        ? ">> MLB published promptly. A hold here would be OUR cursor."
        : ">> MLB was slow to publish. The hold is THEIR feed, not ours."}`);
    } else {
      console.log(`  resolution NOT found within ${MAX_PROBES} snapshots`);
      console.log(`  >> MLB went quiet after the strike — the hold is THEIR feed.`);
    }
    console.log("");
  }

  console.log("Rule of thumb: gaps under ~15s mean the data was there and our");
  console.log("delayed cursor was the holdup. Gaps of 30s+ mean MLB simply");
  console.log("hadn't published the out yet, and no server change fixes that.\n");
};

main().catch((e) => {
  console.error("failed:", e.message);
  process.exit(1);
});
