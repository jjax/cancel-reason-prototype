// Build the shareable artifact page from index.html, optionally embedding
// eval/results.json as a "判定結果一覧" section under the team note.
//
//   node scripts/build-share-page.mjs [--results eval/results.json] --out /path/page.html

import { readFile, writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const resultsPath = opt("--results", null);
const outPath = opt("--out", null);
if (!outPath) { console.error("usage: --out <file> [--results eval/results.json]"); process.exit(2); }

let html = await readFile("index.html", "utf8");

// The artifact host supplies the outer skeleton; keep <title>, <link>, <style>, body content.
for (const tag of ['<!DOCTYPE html>\n', '<html lang="en">\n', '<head>\n', '<meta charset="UTF-8">\n',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">\n',
  '</head>\n', '<body>\n', '</body>\n', '</html>\n']) {
  if (!html.includes(tag)) throw new Error(`expected ${JSON.stringify(tag)} in index.html`);
  html = html.replace(tag, '');
}
html = html.replace('<title>Tsuklio – Cancel Subscription</title>', '<title>Tsuklio Cancel Flow</title>');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LABEL = { discount: '割引', delivery_flex: '配送変更', menu_refresh: 'メニュー調整', plan_resize: 'プラン変更', pause: '一時停止', no_offer: 'オファーなし' };
const pct = (v) => (v == null ? '-' : Math.round(v * 100) + '%');

if (resultsPath) {
  const data = JSON.parse(await readFile(resultsPath, 'utf8'));
  const rows = data.rows.filter((r) => !r.error);
  const errors = data.rows.filter((r) => r.error);
  const date = data.generatedAt ? data.generatedAt.slice(0, 10) : '';
  const tokens = rows.reduce((s, r) => s + (r.usage?.input_tokens ?? 0) + (r.usage?.output_tokens ?? 0), 0);
  const avgMs = Math.round(rows.reduce((s, r) => s + (r.ms ?? 0), 0) / Math.max(rows.length, 1));

  const cards = rows.map((r) => {
    const reasons = r.reasons.map((x) => `<span class="ev-chip">${esc(x.split(':')[0])}</span>`).join('');
    const other = r.otherText ? `<div class="ev-other">“${esc(r.otherText)}”</div>` : '';
    const probs = Object.entries(r.probabilities ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([k, v]) => `<span>${esc(LABEL[k] ?? k)} <b>${pct(v)}</b></span>`).join('');
    return `<div class="ev-card">
      <div class="ev-head"><span class="ev-id">${esc(r.id)}</span><span class="ev-note">${esc(r.note)}</span></div>
      <div class="ev-reasons">${reasons}</div>${other}
      <div class="ev-intent">意向: ${esc(r.intent)}</div>
      <div class="ev-result ${r.show ? 'show' : 'skip'}">
        <span class="ev-offer">${esc(LABEL[r.offer] ?? r.offer)}</span>
        <span class="ev-flag">${r.show ? '表示' : '非表示'}</span>
        <span class="ev-meta">確信 ${pct(r.confidence)} ／ 受容 ${pct(r.receptive)}${r.runnerUp ? ' ／ 次点 ' + esc(LABEL[r.runnerUp] ?? r.runnerUp) : ''}</span>
      </div>
      <div class="ev-probs">${probs}</div>
    </div>`;
  }).join('\n');

  const errNote = errors.length ? `<p class="ev-err">${errors.length}件はエラー: ${esc(errors.map((e) => e.id + ' ' + e.error).join(' / '))}</p>` : '';

  const section = `
  <details class="share-note ev" id="eval-results" open>
    <summary>Jev 判定結果一覧（${rows.length}件）</summary>
    <div class="share-note-body">
      <div class="ev-summary">実行日 ${esc(date)} ／ モデル ${esc(data.model ?? '-')} ／ 平均 ${avgMs} ms／件 ／ 合計 ${tokens} トークン。
      「表示」はオファー画面に出るケース、「非表示」は確定画面に直行するケース。受容は「オファーを受け入れそうか」の確率で、35%未満なら非表示にしています。</div>
      ${errNote}
      <div class="ev-list">${cards}</div>
    </div>
  </details>
`;
  const css = `
/* Eval results */
.ev-summary { font-size: 12px; color: var(--text-sub); }
.ev-err { font-size: 12px; color: var(--danger); }
.ev-list { display: grid; gap: 10px; }
.ev-card { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; background: var(--bg); display: grid; gap: 6px; }
.ev-head { display: flex; gap: 8px; align-items: baseline; }
.ev-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: var(--text-hint); }
.ev-note { font-size: 13px; font-weight: 600; color: var(--text); }
.ev-reasons { display: flex; flex-wrap: wrap; gap: 4px; }
.ev-chip { font-size: 11px; padding: 2px 8px; border-radius: 99px; border: 1px solid var(--border-strong); color: var(--text-sub); background: var(--surface); }
.ev-other { font-size: 12px; color: var(--text); font-style: italic; line-height: 1.5; }
.ev-intent { font-size: 11px; color: var(--text-hint); }
.ev-result { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 6px; border-top: 1px dashed var(--border); }
.ev-offer { font-size: 13px; font-weight: 700; color: var(--brand-dark); }
.ev-flag { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 99px; }
.ev-result.show .ev-flag { background: var(--brand-light); color: var(--brand-dark); border: 1px solid var(--brand-mid); }
.ev-result.skip .ev-flag { background: var(--surface); color: var(--text-hint); border: 1px solid var(--border-strong); }
.ev-result.skip .ev-offer { color: var(--text-sub); }
.ev-meta { font-size: 11px; color: var(--text-sub); font-variant-numeric: tabular-nums; }
.ev-probs { display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; color: var(--text-hint); font-variant-numeric: tabular-nums; }
.ev-probs b { color: var(--text-sub); font-weight: 600; }
`;
  html = html.replace('.debug-offer { font-size: 11px;', css + '\n.debug-offer { font-size: 11px;');
  const anchor = '  <div class="debug-toggle">';
  if (!html.includes(anchor)) throw new Error('anchor not found');
  html = html.replace(anchor, section + anchor);
  // The engine pill: results came from Jev even though this page decides rule-based
  html = html.replace('<span class="engine-pill" id="engine-pill">この共有版：ルールベース</span>',
    '<span class="engine-pill" id="engine-pill">この共有版：ルールベース</span> <span class="engine-pill">下の一覧：Jev の実判定</span>');
}

await writeFile(outPath, html);
console.log(`wrote ${outPath} (${html.length} bytes)${resultsPath ? ', with results' : ''}`);
