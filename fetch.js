// Runs every hour in GitHub Actions: reads the current carbon intensity
// for zone GE and appends it to history.json (one reading per hour).
// The API key comes from the repository secret ELECTRICITYMAPS_TOKEN.

const fs = require("fs");

const ZONE = "GE";
const FILE = "history.json";
const KEEP_HOURS = 60 * 24; // 60 days: enough for "typical day" stats

function hourKey(date) {
  const d = new Date(date);
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString();
}

async function main() {
  const token = process.env.ELECTRICITYMAPS_TOKEN;
  if (!token) throw new Error("Secret ELECTRICITYMAPS_TOKEN is not set");

  const res = await fetch(`https://api.electricitymaps.com/v3/home-assistant?zone=${ZONE}`, {
    headers: { "auth-token": token },
  });
  const json = await res.json();
  if (!res.ok || json.status !== "ok" || typeof json.data?.carbonIntensity !== "number") {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(json).slice(0, 200)}`);
  }

  const fossil = json.data.fossilFuelPercentage;
  const reading = {
    time: hourKey(new Date()),
    intensity: json.data.carbonIntensity,
    carbonFree: typeof fossil === "number" ? Math.round((100 - fossil) * 10) / 10 : null,
  };

  let history = [];
  try {
    history = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {}

  const cutoff = Date.now() - KEEP_HOURS * 60 * 60 * 1000;
  history = history
    .filter(p => p.time !== reading.time && new Date(p.time).getTime() >= cutoff)
    .concat(reading)
    .sort((a, b) => a.time.localeCompare(b.time));

  fs.writeFileSync(FILE, JSON.stringify(history, null, 1) + "\n");
  console.log(`${reading.time}: ${reading.intensity} g/kWh, ${reading.carbonFree}% carbon-free (${history.length} hours)`);
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
