import type { RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";
import { chainRule } from "./chain-network.js";
import { cumulativeBudgetRule } from "./cumulative-budget.js";
import { currencyRule } from "./currency-token.js";
import { idempotencyRule } from "./idempotency.js";
import { maxAmountRule } from "./max-amount.js";
import { merchantMatchRules } from "./merchant-match.js";
import { policyExpiryRule } from "./policy-expiry.js";
import { quoteDriftRule } from "./quote-drift.js";
import { quoteExpiryRule } from "./quote-expiry.js";
import { requiredMetadataRule } from "./required-fields.js";
import { reviewThresholdRule } from "./review-threshold.js";

export function evaluateRules(context: RuleContext): RuleResult[] {
  return [
    requiredMetadataRule(context),
    maxAmountRule(context),
    cumulativeBudgetRule(context),
    ...merchantMatchRules(context),
    currencyRule(context),
    chainRule(context),
    policyExpiryRule(context),
    quoteExpiryRule(context),
    quoteDriftRule(context),
    idempotencyRule(context),
    reviewThresholdRule(context)
  ];
}

