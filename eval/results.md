# Jev evaluation results — 2026-09-24 — model jev-1.13.0

```
id   | offer          | show | conf | recv | runner-up      |   ms | note
-----+----------------+------+------+------+----------------+------+------
C01  | discount       | yes  | 100% |  77% | delivery_flex  |  450 | 価格が1位、味が2位
C02  | delivery_flex  | yes  | 100% |  79% | pause          |  438 | 配送日が合わない
C03  | no_offer       | no   |  99% |  13% | plan_resize    |  160 | 他社へ乗り換え、戻る気なし
C04  | plan_resize    | yes  | 100% |  77% | discount       |  167 | 量が少ない + 世帯に合わない
C05  | menu_refresh   | yes  | 100% |  79% | discount       |  143 | 飽きた + カスタマイズしたい
C06  | no_offer       | no   |  94% |   4% | pause          |  428 | Other: 東京へ引っ越し（一時的でない）
C07  | pause          | yes  |  96% |  66% | plan_resize    |  114 | Other: 3か月の海外滞在（一時的）
C08  | delivery_flex  | yes  |  89% |  76% | discount       |  155 | Other: 配送品質の問題（Delivery Issuesではなく自由記述）
C09  | menu_refresh   | yes  |  53% |  74% | pause          |  191 | Other: ハラール対応が無い
C10  | menu_refresh   | yes  | 100% |  75% | discount       |  170 | 家族が不満 + 価格
C11  | no_offer       | no   |  62% |  13% | pause          |  176 | お試しのつもりだった、戻る気なし
C12  | pause          | yes  |  99% |  67% | menu_refresh   |  278 | 生活変化 + 価格、状況次第で復帰
C13  | discount       | no   |  67% |  29% | plan_resize    |  197 | 価格だが戻る気なし（割引で翻意するか）
C14  | discount       | yes  |  99% |  78% | pause          |  582 | Other: 値上げへの不満（Priceを選ばず自由記述）

14/14 judged, model jev-1.13.0, 14420 tokens total, avg 261 ms/request
saved eval/results.json
```
