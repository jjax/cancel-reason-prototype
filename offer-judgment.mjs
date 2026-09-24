// Retention-offer judgment built on TypeSafe's System One model (Jev).
//
// Code owns the workflow and the offer catalog. The model supplies two
// narrow judgments over the same state, asked together in one request:
//   offer     (choice) - which catalog entry best addresses the reasons given
//   receptive (noul)   - whether an offer is worth presenting at all
// The decision policy that turns those answers into "show / skip" lives in
// decide() below, so thresholds can change without re-running inference.

import { TypeSafeClient, choice, noul } from "@typesafe-ai/sdk";

/** Offer catalog: ids are stable keys the page uses to render copy. */
export const OFFERS = {
  discount: {
    criteria:
      "20% off the next two weekly deliveries. Fits a customer whose main objection is price or value for money.",
  },
  delivery_flex: {
    criteria:
      "Change the delivery day or time window, and skip any week free of charge. Fits delivery-day, timing, or schedule problems.",
  },
  menu_refresh: {
    criteria:
      "Set a taste profile (dislikes, spice level, family preferences) and get early access to new seasonal menus. Fits taste, family feedback, boredom with the menu, wanting more customization, or lack of dish information.",
  },
  plan_resize: {
    criteria:
      "Switch the portion size or the number of servings per delivery at no charge. Fits portions that are too small or too large, or a plan size that does not match the household.",
  },
  pause: {
    criteria:
      "Pause the subscription for up to 8 weeks and resume with one tap. Fits temporary life changes, travel, or a customer who only meant to try once but may come back later.",
  },
  no_offer: {
    criteria:
      "Present no offer; thank the customer and confirm the cancellation. Fits a customer who moved to a competitor, has no plan to return, or whose reasons no listed offer addresses.",
  },
};

export const OFFER_IDS = Object.keys(OFFERS);

/** Minimum P(yes) on `receptive` before an offer is shown. Tune on real outcomes. */
export const RECEPTIVE_THRESHOLD = 0.35;

const MAX_TEXT = 500;

/**
 * Normalise the survey payload sent by the page into the state the model sees.
 * Throws on malformed input so the HTTP layer can answer 400.
 */
export function buildState(payload) {
  if (!payload || typeof payload !== "object") throw new TypeError("payload must be an object");
  const mode = payload.mode === "repeat" ? "repeat" : "first";
  const reasons = Array.isArray(payload.reasons) ? payload.reasons : [];
  if (reasons.length === 0 || reasons.length > 3 || !reasons.every((r) => typeof r === "string" && r.length <= MAX_TEXT)) {
    throw new TypeError("reasons must be 1-3 strings");
  }
  if (typeof payload.intent !== "string" || payload.intent.length === 0 || payload.intent.length > MAX_TEXT) {
    throw new TypeError("intent must be a non-empty string");
  }
  const otherText =
    typeof payload.otherText === "string" && payload.otherText.trim() ? payload.otherText.trim().slice(0, MAX_TEXT) : null;
  const customer = payload.customer && typeof payload.customer === "object" ? payload.customer : {};

  return {
    business:
      "Tsuklio is a weekly subscription in Singapore delivering ready-to-eat Japanese home-style meals for families.",
    customer: {
      plan: str(customer.plan),
      weekly_charge: str(customer.weekly_charge),
      delivery_fee: str(customer.delivery_fee),
      next_delivery: str(customer.next_delivery),
      cancellation_history: mode === "repeat" ? "has cancelled before and re-subscribed" : "first cancellation",
    },
    survey: {
      cancellation_reasons_in_priority_order: reasons,
      other_reason_text: otherText,
      reactivation_intent: payload.intent,
    },
  };
}

const str = (v) => (typeof v === "string" && v ? v : null);

/** The two questions, asked together over the same state. */
export function buildQuestions() {
  return {
    offer: choice(
      {
        task:
          "Select the single retention offer most likely to keep this customer subscribed, based on `survey` and `customer`.",
        guidance: [
          "Weight `survey.cancellation_reasons_in_priority_order[0]` most heavily; later entries break ties.",
          "If `survey.other_reason_text` describes a specific problem, prefer the offer that fixes that problem over the listed category labels.",
          "Choose no_offer when the customer has already moved to a competitor, when the reasons are outside Tsuklio's control, or when no listed offer addresses the top reason.",
        ],
      },
      Object.fromEntries(OFFER_IDS.map((id) => [id, OFFERS[id].criteria])),
    ),
    receptive: noul(
      "Would this customer plausibly accept a well-matched retention offer instead of cancelling right now? Consider `survey.reactivation_intent` together with the reasons.",
      {
        true: "The reasons point to a problem Tsuklio can fix and the reactivation intent leaves the door open.",
        false: "The customer has firmly decided to leave, chose a competitor, or the reasons are outside Tsuklio's control.",
      },
    ),
  };
}

/**
 * Policy: turn raw answers into a UI decision. Kept separate so it can be
 * tuned or unit-tested without calling the model.
 */
export function decide(answers) {
  const { offer, receptive } = answers;
  const ranked = Object.entries(offer.probabilities).sort((a, b) => b[1] - a[1]);
  const runnerUp = ranked.map(([id]) => id).find((id) => id !== offer.choice && id !== "no_offer") ?? null;
  const show = offer.choice !== "no_offer" && receptive.noul >= RECEPTIVE_THRESHOLD;
  return {
    show,
    offer: offer.choice,
    runnerUp,
    confidence: offer.confidence,
    probabilities: offer.probabilities,
    receptive: receptive.noul,
  };
}

/**
 * Full judgment: state -> Jev -> decision. `client` is injectable for tests.
 */
export async function judgeOffer(payload, { client = new TypeSafeClient() } = {}) {
  const state = buildState(payload);
  const result = await client.systemOne({ state, questions: buildQuestions() });
  return { source: "jev", model: result.model, usage: result.usage, ...decide(result.answers) };
}
