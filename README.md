# Tsuklio – Cancel Subscription prototype

解約フローのプロトタイプ（`index.html` 1枚）。理由アンケートの後、
**TypeSafe の System One モデル（Jev）で引き留めオファーを1つ選んで提示**する。

```
理由（上位3つ / Other自由記述） + 再利用意向
   → POST /api/offer（server.mjs）→ TypeSafe /v1/systemone
   → { offer: どのオファーか, receptive: オファーを出す価値があるか }
   → 表示 or スキップ（decide() の方針）
```

## 動かし方

```bash
npm install
TYPESAFE_API_KEY=... npm start     # http://localhost:3000
npm test                           # 判定ロジックのユニットテスト
TYPESAFE_API_KEY=... node scripts/eval-offers.mjs --out eval/results.json
                                   # eval/cases.json の解約パターンをJevに流して一覧表を出す
```

- キーはサーバー側だけが持つ。ページには渡さない。
- キー無し、または `index.html` を直接開いた場合は、ページ内のルールベース判定に自動で落ちる
  （画面上部のデバッグ行に「ルールベース（API未接続）」と出る）。

## ファイル

| ファイル | 役割 |
| --- | --- |
| `index.html` | UI。オファーカタログ（表示文言）と代替判定を持つ |
| `offer-judgment.mjs` | state の組み立て、Jev への2問（`offer`: choice / `receptive`: noul）、表示方針 `decide()` |
| `server.mjs` | 静的配信 + `/api/offer` プロキシ + `/api/health` |
| `test/` | `node --test` |
| `eval/cases.json`, `scripts/eval-offers.mjs` | 判定精度の確認用。実際の解約パターン14件を流して表にする |

## 判定の設計メモ

- オファーのカタログと「見せる／見せない」の閾値（`RECEPTIVE_THRESHOLD`）はコードが持つ。
  モデルには「どのオファーが最も効くか」「そもそも受け入れそうか」だけを聞く。
- 2問は同じ state に対して1リクエストで並列に聞く（互いの答えは見えない）。
- 閾値はダミー値。実データでの受諾率を見て調整する。
