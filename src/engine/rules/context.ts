import type { History, PaymentRequest, Policy, Quote } from "../../domain/types.js";

export interface RuleContext {
  policy: Policy;
  quote: Quote;
  request: PaymentRequest;
  history?: History;
}

