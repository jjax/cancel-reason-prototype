import { test } from "node:test";
import assert from "node:assert/strict";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import { buildState, buildQuestions, decide, judgeOffer, OFFER_IDS, RECEPTIVE_THRESHOLD } from "../offer-judgment.mjs";

const PAYLOAD = {
  mode: "first",
  reasons: ["Price: It's a bit too pricey for me.", "Lack of Variety: I got bored with the menu options."],
  otherText: "",
  intent: "Yes, if the service improves.",
  customer: { plan: "Weekly", weekly_charge: "SGD 211.00" },
};

test("buildState normalises the survey payload", () => {
  const s = buildState(PAYLOAD);
  assert.equal(s.customer.cancellation_history, "first cancellation");
  assert.equal(s.customer.plan, "Weekly");
  assert.equal(s.customer.delivery_fee, null);
  assert.deepEqual(s.survey.cancellation_reasons_in_priority_order, PAYLOAD.reasons);
  assert.equal(s.survey.other_reason_text, null);
  assert.equal(buildState({ ...PAYLOAD, mode: "repeat", otherText: "  no halal option  " }).survey.other_reason_text, "no halal option");
});

test("buildState rejects malformed input", () => {
  assert.throws(() => buildState({ ...PAYLOAD, reasons: [] }), TypeError);
  assert.throws(() => buildState({ ...PAYLOAD, reasons: ["a", "b", "c", "d"] }), TypeError);
  assert.throws(() => buildState({ ...PAYLOAD, intent: "" }), TypeError);
  assert.throws(() => buildState(null), TypeError);
});

test("questions cover every catalog offer", () => {
  const q = buildQuestions();
  assert.equal(q.offer.type, "choice");
  assert.deepEqual(Object.keys(q.offer.criteria), OFFER_IDS);
  assert.equal(q.receptive.type, "noul");
});

test("decide applies the show policy", () => {
  const probs = { discount: 0.6, menu_refresh: 0.25, pause: 0.05, delivery_flex: 0.04, plan_resize: 0.03, no_offer: 0.03 };
  const base = { offer: { type: "choice", choice: "discount", confidence: 0.6, probabilities: probs } };

  const shown = decide({ ...base, receptive: { type: "noul", noul: 0.8 } });
  assert.equal(shown.show, true);
  assert.equal(shown.offer, "discount");
  assert.equal(shown.runnerUp, "menu_refresh");

  const notReceptive = decide({ ...base, receptive: { type: "noul", noul: RECEPTIVE_THRESHOLD - 0.01 } });
  assert.equal(notReceptive.show, false);

  const none = decide({
    offer: { type: "choice", choice: "no_offer", confidence: 0.9, probabilities: { ...probs, no_offer: 0.9 } },
    receptive: { type: "noul", noul: 0.9 },
  });
  assert.equal(none.show, false);
  assert.equal(none.offer, "no_offer");
});

test("judgeOffer sends state + questions to /v1/systemone and returns a decision", async () => {
  let captured;
  const fetch = async (input, init) => {
    captured = { url: input, body: JSON.parse(init.body), auth: init.headers.Authorization ?? init.headers.authorization };
    const body = {
      model: "jev-latest",
      answers: {
        offer: {
          type: "choice",
          choice: "discount",
          confidence: 0.71,
          probabilities: { discount: 0.71, menu_refresh: 0.2, pause: 0.03, delivery_flex: 0.02, plan_resize: 0.02, no_offer: 0.02 },
        },
        receptive: { type: "noul", noul: 0.77 },
      },
      usage: { input_tokens: 300, output_tokens: 2 },
    };
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json", "x-typesafe-request-id": "req_test" } });
  };
  const client = new TypeSafeClient({ apiKey: "test-key", baseURL: "https://example.invalid", fetch, logLevel: "off" });

  const d = await judgeOffer(PAYLOAD, { client });
  assert.equal(captured.url, "https://example.invalid/v1/systemone");
  assert.equal(captured.auth, "Bearer test-key");
  assert.equal(captured.body.model, "jev-latest");
  assert.equal(captured.body.state.survey.reactivation_intent, PAYLOAD.intent);
  assert.deepEqual(Object.keys(captured.body.questions), ["offer", "receptive"]);
  assert.equal(d.source, "jev");
  assert.equal(d.show, true);
  assert.equal(d.offer, "discount");
  assert.equal(d.receptive, 0.77);
});
