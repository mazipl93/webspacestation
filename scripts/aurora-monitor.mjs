/**
 * 5-min aurora data monitor — logs consistency, gaps, earth marker stability.
 * Usage: node scripts/aurora-monitor.mjs [minutes]
 */
const MINUTES = Number(process.argv[2] || 5);
const INTERVAL_MS = 30_000;
const TICKS = Math.ceil((MINUTES * 60_000) / INTERVAL_MS);

const MAG_URL = "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json";
const WIND_URL = "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json";
const L1_KM = 1_500_000;
const MIN_SPEED = 100;
const DEFAULT_DELAY = 45;

function minuteKey(t) {
  return t.replace(/:\d{2}$/, "");
}

function normTime(t) {
  if (!t) return "";
  if (t.includes("T")) return t;
  return t.replace(" ", "T").replace(".000", "") + "Z";
}

function parseRtsw(magRaw, windRaw) {
  const windByMinute = new Map();
  for (const row of windRaw) {
    if (!row.active) continue;
    windByMinute.set(minuteKey(row.time_tag), row);
  }
  const activeMag = magRaw.filter((r) => r.active).sort((a, b) => a.time_tag.localeCompare(b.time_tag));
  const sliceMag = activeMag.slice(-360);
  let lastWind = null;
  const points = [];
  for (const row of sliceMag) {
    const key = minuteKey(row.time_tag);
    const wind = windByMinute.get(key) ?? lastWind;
    if (wind) lastWind = wind;
    points.push({
      time_tag: normTime(row.time_tag),
      bz: row.bz_gsm ?? 0,
      speed: wind?.proton_speed ?? lastWind?.proton_speed ?? 0,
    });
  }
  return points;
}

function lastKnownSpeed(data) {
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].speed > MIN_SPEED) return data[i].speed;
  }
  return null;
}

function earthMarker(data) {
  if (data.length === 0) return null;
  const latest = data.at(-1);
  const fb = lastKnownSpeed(data);
  const effective = latest.speed > MIN_SPEED ? latest.speed : fb && fb > MIN_SPEED ? fb : 0;
  const delayMin = effective > MIN_SPEED ? Math.round(L1_KM / effective / 60) : DEFAULT_DELAY;
  const earthIndex = Math.max(0, data.length - 1 - delayMin);
  return { delayMin, earthIndex, earthBz: data[earthIndex].bz, l1Bz: latest.bz, earthKey: data[earthIndex].time_tag, l1Key: latest.time_tag };
}

async function fetchJson(url) {
  const t0 = Date.now();
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12_000) });
  const data = await res.json();
  return { ok: res.ok, ms: Date.now() - t0, data };
}

const history = [];

for (let i = 0; i < TICKS; i++) {
  const ts = new Date().toISOString();
  try {
    const [mag, wind] = await Promise.all([fetchJson(MAG_URL), fetchJson(WIND_URL)]);
    const magActive = (mag.data || []).filter((r) => r.active);
    const windActive = (wind.data || []).filter((r) => r.active);
    const parsed = parseRtsw(mag.data || [], wind.data || []);
    const m = earthMarker(parsed);
    const latest = parsed.at(-1);
    const prev = history.at(-1);

    const issues = [];
    if (!mag.ok || !wind.ok) issues.push("fetch_fail");
    if (parsed.length < 30) issues.push(`low_points=${parsed.length}`);
    if (!m) issues.push("no_earth_marker");
    if (latest?.speed === 0) issues.push("l1_speed_zero");
    if (prev && m && prev.m?.earthKey === m.earthKey && prev.m?.l1Key !== m.l1Key) {
      issues.push("earth_key_stale_while_l1_moved");
    }
    if (prev && latest && prev.latest?.time_tag === latest.time_tag) {
      issues.push("data_static");
    }

    const row = {
      ts,
      magMs: mag.ms,
      windMs: wind.ms,
      points: parsed.length,
      magActive: magActive.length,
      windActive: windActive.length,
      l1Time: latest?.time_tag,
      l1Bz: latest?.bz,
      l1Speed: latest?.speed,
      m,
      issues,
    };
    history.push({ ...row, latest, m });

    const flag = issues.length ? "⚠" : "✓";
    console.log(
      `${flag} [${ts.slice(11, 19)}] pts=${parsed.length} L1 bz=${latest?.bz?.toFixed?.(1)} spd=${latest?.speed} | Earth bz=${m?.earthBz?.toFixed?.(1)} delay=${m?.delayMin}m idx=${m?.earthIndex} | ${issues.join(", ") || "ok"}`,
    );
  } catch (e) {
    console.log(`✗ [${ts.slice(11, 19)}] ERROR ${e.message}`);
  }

  if (i < TICKS - 1) await new Promise((r) => setTimeout(r, INTERVAL_MS));
}

console.log("\n--- SUMMARY ---");
const allIssues = history.flatMap((h) => h.issues);
const counts = {};
for (const iss of allIssues) counts[iss] = (counts[iss] || 0) + 1;
console.log("ticks:", history.length);
console.log("issues:", counts);
console.log("earth delay range:", Math.min(...history.map((h) => h.m?.delayMin ?? 999)), "-", Math.max(...history.map((h) => h.m?.delayMin ?? 0)));
