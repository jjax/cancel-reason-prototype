// Run the retention-offer judgment over eval/cases.json and print a table.
//
//   TYPESAFE_API_KEY=... node scripts/eval-offers.mjs            # real Jev
//   node scripts/eval-offers.mjs --out eval/results.json         # also save results
//
// Requires TYPESAFE_API_KEY (and TYPESAFE_BASE_URL for a mock/staging endpoint).

import { readFile, writeFile } from "node:fs/promises";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import { judgeOffer } from "../offer-judgment.mjs";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
const casesPath = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out") ?? "eval/cases.json";

if (!process.env.TYPESAFE_API_KEY?.trim()) {
  console.error("TYPESAFE_API_KEY is not set. Add it to the environment (never paste it into chat) and run again.");
  process.exit(2);
}

const cases = JSON.parse(await readFile(casesPath, "utf8"));
const client = new TypeSafeClient();
const customer = { plan: "Weekly", weekly_charge: "SGD 211.00", delivery_fee: "Free", next_delivery: "Sun, 22 Mar" };

const rows = [];
for (const c of cases) {
  const t0 = performance.now();
  try {
    const d = await judgeOffer({ mode: c.mode, reasons: c.reasons, otherText: c.otherText ?? "", intent: c.intent, customer }, { client });
    rows.push({
      id: c.id, note: c.note, mode: c.mode, reasons: c.reasons, otherText: c.otherText ?? null, intent: c.intent,
      offer: d.offer, show: d.show, confidence: d.confidence, receptive: d.receptive, runnerUp: d.runnerUp,
      probabilities: d.probabilities, model: d.model, usage: d.usage, ms: Math.round(performance.now() - t0),
    });
  } catch (e) {
    rows.push({ id: c.id, note: c.note, error: e.message, ms: Math.round(performance.now() - t0) });
  }
}

const pct = (v) => (v == null ? "  -" : String(Math.round(v * 100)).padStart(3) + "%");
console.log("\nid   | offer          | show | conf | recv | runner-up      |   ms | note");
console.log("-----+----------------+------+------+------+----------------+------+------");
for (const r of rows) {
  if (r.error) { console.log(`${r.id}  | ERROR ${r.error}`); continue; }
  console.log(`${r.id}  | ${r.offer.padEnd(14)} | ${r.show ? "yes " : "no  "} | ${pct(r.confidence)} | ${pct(r.receptive)} | ${(r.runnerUp ?? "-").padEnd(14)} | ${String(r.ms).padStart(4)} | ${r.note}`);
}
const ok = rows.filter((r) => !r.error);
const tokens = ok.reduce((s, r) => s + (r.usage?.input_tokens ?? 0) + (r.usage?.output_tokens ?? 0), 0);
console.log(`\n${ok.length}/${rows.length} judged, model ${ok[0]?.model ?? "-"}, ${tokens} tokens total, avg ${Math.round(ok.reduce((s, r) => s + r.ms, 0) / Math.max(ok.length, 1))} ms/request`);

if (outPath) {
  await writeFile(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), model: ok[0]?.model ?? null, rows }, null, 2));
  console.log(`saved ${outPath}`);
}
