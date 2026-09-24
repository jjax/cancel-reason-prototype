# Eval run status

Date: 2026-09-24
Result: NOT RUN

Check 1 (TYPESAFE_API_KEY present): OK (1 match, value not printed)
Check 2 (network reachability to api.typesafe.ai): FAILED

api.typesafe.ai is blocked from this environment. The outbound proxy refused the tunnel:

    $ curl -sS -o /dev/null -w "%{http_code}\n" https://api.typesafe.ai/v1/models
    curl: (56) CONNECT tunnel failed, response 403
    000

No npm install or eval script was run. Allow api.typesafe.ai in the environment's
network policy and re-run scripts/eval-offers.mjs.
