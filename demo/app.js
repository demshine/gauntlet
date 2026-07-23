const basePolicy = {
  policy_id: "default-agent-payment-policy",
  version: 1,
  agent_id: "research-agent",
  max_amount_per_payment: 5,
  max_total_budget: 20,
  budget_window: "task",
  currency: "USDC",
  chain: "base",
  allowed_merchants: ["merchant_api_example"],
  blocked_merchants: ["merchant_blocked"],
  requires_review_above: 5,
  expires_at: "2026-06-30T23:59:59Z",
  max_payments_per_task: 2,
  max_quote_drift_percentage: 10,
  required_metadata: ["idempotency_key", "quote_id"]
};

const baseQuote = {
  quote_id: "quote_123",
  merchant_id: "merchant_api_example",
  quoted_amount: 2,
  quoted_currency: "USDC",
  quoted_at: "2026-06-23T10:00:00Z",
  expires_at: "2026-06-23T10:10:00Z",
  item_description: "MCP paid tool access",
  final_amount: 2,
  drift_amount: 0,
  drift_percentage: 0
};

const baseRequest = {
  request_id: "req_123",
  task_id: "task_123",
  session_id: "session_123",
  idempotency_key: "idem_123",
  retry_count: 0,
  quote_id: "quote_123",
  agent_id: "research-agent",
  merchant: {
    merchant_id: "merchant_api_example",
    canonical_merchant_id: "merchant_api_example",
    merchant_type: "mcp_server",
    merchant_display_name: "Example MCP Tool"
  },
  amount: 2,
  currency: "USDC",
  token: "USDC",
  chain: "base",
  purpose: "MCP paid tool access",
  tool_source: "mcp://example",
  provider: "mock",
  created_at: "2026-06-23T10:05:00Z",
  metadata: {
    idempotency_key: "idem_123",
    quote_id: "quote_123"
  }
};

const baseHistory = {
  task_id: "task_123",
  session_id: "session_123",
  prior_requests: [],
  prior_decisions: [],
  prior_receipts: [],
  total_amount_spent: 0,
  payment_count_for_task: 0,
  used_idempotency_keys: []
};

const scenarios = [
  {
    id: "valid-mcp-paid-tool-payment",
    title: "Valid MCP paid tool payment",
    description: "Baseline known-good MCP paid tool payment request.",
    patch: {}
  },
  {
    id: "amount-exceeds-single-payment-limit",
    title: "Amount exceeds single payment limit",
    description: "The agent tries to pay more than policy allows.",
    patch: { request: { amount: 8 } }
  },
  {
    id: "cumulative-budget-exceeded",
    title: "Cumulative budget exceeded",
    description: "One request is small, but the task already spent almost all of its budget.",
    patch: { history: { total_amount_spent: 19 } }
  },
  {
    id: "blocked-merchant",
    title: "Blocked merchant",
    description: "The request targets a merchant that policy explicitly denies.",
    patch: {
      request: {
        merchant: {
          merchant_id: "merchant_blocked",
          canonical_merchant_id: "merchant_blocked",
          merchant_type: "mcp_server",
          merchant_display_name: "Blocked Tool"
        }
      }
    }
  },
  {
    id: "wrong-token-or-currency",
    title: "Wrong token or currency",
    description: "The quote expects USDC, but the request asks for a different unit.",
    patch: { request: { currency: "EUR", token: "EUR" } }
  },
  {
    id: "quote-expired",
    title: "Quote expired",
    description: "The payment request arrives after the quote is no longer valid.",
    patch: { quote: { expires_at: "2026-06-23T10:01:00Z" } }
  },
  {
    id: "amount-drift-above-threshold",
    title: "Amount drift above threshold",
    description: "The final amount changed too much between quote and payment request.",
    patch: {
      quote: { final_amount: 2.5, drift_amount: 0.5, drift_percentage: 25 },
      request: { amount: 2.5 }
    }
  },
  {
    id: "duplicate-idempotency-key",
    title: "Duplicate idempotency key",
    description: "A retry reuses a key that was already observed for this task.",
    patch: { history: { used_idempotency_keys: ["idem_123"] } }
  }
];

let activeFixture = makeFixture(scenarios[0]);

const els = {
  scenarioSelect: document.querySelector("#scenarioSelect"),
  runButton: document.querySelector("#runButton"),
  resetButton: document.querySelector("#resetButton"),
  runStatus: document.querySelector("#runStatus"),
  decisionBand: document.querySelector("#decisionBand"),
  decisionTitle: document.querySelector("#decisionTitle"),
  reasonList: document.querySelector("#reasonList"),
  policyJson: document.querySelector("#policyJson"),
  requestJson: document.querySelector("#requestJson"),
  receiptJson: document.querySelector("#receiptJson"),
  reportText: document.querySelector("#reportText"),
  policySummary: document.querySelector("#policySummary"),
  requestSummary: document.querySelector("#requestSummary"),
  receiptSummary: document.querySelector("#receiptSummary"),
  amountInput: document.querySelector("#amountInput"),
  merchantInput: document.querySelector("#merchantInput"),
  quoteExpiryInput: document.querySelector("#quoteExpiryInput")
};

for (const scenario of scenarios) {
  const option = document.createElement("option");
  option.value = scenario.id;
  option.textContent = scenario.title;
  els.scenarioSelect.append(option);
}

els.scenarioSelect.addEventListener("change", () => {
  activeFixture = makeFixture(getSelectedScenario());
  syncControlsFromFixture();
  render();
});

els.runButton.addEventListener("click", () => {
  els.runStatus.textContent = "Preflight complete";
  render();
});

els.resetButton.addEventListener("click", () => {
  activeFixture = makeFixture(getSelectedScenario());
  syncControlsFromFixture();
  els.runStatus.textContent = "Fixture reset";
  render();
});

els.amountInput.addEventListener("input", () => {
  const amount = Number(els.amountInput.value);
  activeFixture.request.amount = amount;
  activeFixture.quote.final_amount = amount;
  activeFixture.quote.drift_amount = round(amount - activeFixture.quote.quoted_amount);
  activeFixture.quote.drift_percentage = round(
    ((amount - activeFixture.quote.quoted_amount) / activeFixture.quote.quoted_amount) * 100
  );
  render();
});

els.merchantInput.addEventListener("change", () => {
  const merchantId = els.merchantInput.value;
  activeFixture.request.merchant = {
    ...activeFixture.request.merchant,
    merchant_id: merchantId,
    canonical_merchant_id: merchantId,
    merchant_display_name:
      merchantId === "merchant_api_example"
        ? "Example MCP Tool"
        : merchantId === "merchant_blocked"
          ? "Blocked Tool"
          : "Unknown Tool"
  };
  render();
});

els.quoteExpiryInput.addEventListener("change", () => {
  activeFixture.quote.expires_at =
    els.quoteExpiryInput.value === "expired"
      ? "2026-06-23T10:01:00Z"
      : "2026-06-23T10:10:00Z";
  render();
});

syncControlsFromFixture();
render();

function getSelectedScenario() {
  return scenarios.find((scenario) => scenario.id === els.scenarioSelect.value) ?? scenarios[0];
}

function makeFixture(scenario) {
  return {
    scenario,
    policy: clone(basePolicy),
    quote: mergeDeep(baseQuote, scenario.patch.quote ?? {}),
    request: mergeDeep(baseRequest, scenario.patch.request ?? {}),
    history: mergeDeep(baseHistory, scenario.patch.history ?? {})
  };
}

function syncControlsFromFixture() {
  els.amountInput.value = activeFixture.request.amount;
  els.merchantInput.value = activeFixture.request.merchant.merchant_id;
  els.quoteExpiryInput.value =
    new Date(activeFixture.request.created_at) > new Date(activeFixture.quote.expires_at)
      ? "expired"
      : "valid";
}

function render() {
  const evaluation = evaluate(activeFixture);
  const receipt = buildReceipt(activeFixture, evaluation);

  els.policyJson.textContent = pretty(activeFixture.policy);
  els.requestJson.textContent = pretty({
    quote: activeFixture.quote,
    payment_request: activeFixture.request,
    history: activeFixture.history
  });
  els.receiptJson.textContent = pretty(receipt);
  els.reportText.textContent = buildReport(activeFixture, evaluation);

  els.policySummary.textContent = `max ${activeFixture.policy.max_amount_per_payment} ${activeFixture.policy.currency}`;
  els.requestSummary.textContent = `${activeFixture.request.amount} ${activeFixture.request.currency}`;
  els.receiptSummary.textContent = evaluation.decision.replaceAll("_", " ");

  const state = evaluation.decision === "policy_failed" ? "fail" : evaluation.decision === "requires_review" ? "review" : "pass";
  els.decisionBand.className = `decision-band ${state}`;
  els.decisionTitle.textContent = titleCase(evaluation.decision.replaceAll("_", " "));
  els.reasonList.innerHTML = "";

  const reasons = evaluation.reason_codes.length > 0 ? evaluation.reason_codes : ["no_policy_violations"];
  for (const reason of reasons) {
    const pill = document.createElement("span");
    pill.className = `reason-pill ${state}`;
    pill.textContent = reason;
    els.reasonList.append(pill);
  }

  for (const node of document.querySelectorAll(".flow-node")) {
    node.classList.remove("active", "failed");
  }
  document.querySelector('[data-step="policy"]').classList.add("active");
  if (state === "fail") {
    document.querySelector('[data-step="policy"]').classList.add("failed");
  }
}

function evaluate({ policy, quote, request, history }) {
  const reasonCodes = [];

  if (request.amount > policy.max_amount_per_payment) {
    reasonCodes.push("amount_exceeds_single_payment_limit");
  }

  if (history.total_amount_spent + request.amount > policy.max_total_budget) {
    reasonCodes.push("cumulative_budget_exceeded");
  }

  if (policy.blocked_merchants.includes(request.merchant.canonical_merchant_id)) {
    reasonCodes.push("blocked_merchant");
  } else if (!policy.allowed_merchants.includes(request.merchant.canonical_merchant_id)) {
    reasonCodes.push("merchant_not_allowed");
  }

  if (request.currency !== policy.currency || quote.quoted_currency !== policy.currency) {
    reasonCodes.push("currency_mismatch");
  }

  if (request.token !== policy.currency) {
    reasonCodes.push("token_mismatch");
  }

  if (request.chain !== policy.chain) {
    reasonCodes.push("chain_mismatch");
  }

  if (new Date(request.created_at) > new Date(policy.expires_at)) {
    reasonCodes.push("policy_expired");
  }

  if (new Date(request.created_at) > new Date(quote.expires_at)) {
    reasonCodes.push("quote_expired");
  }

  if (Math.abs(quote.drift_percentage) > policy.max_quote_drift_percentage) {
    reasonCodes.push("quote_amount_drift_exceeded");
  }

  if (history.used_idempotency_keys.includes(request.idempotency_key)) {
    reasonCodes.push("duplicate_idempotency_key");
  }

  for (const field of policy.required_metadata) {
    if (!request.metadata[field]) {
      reasonCodes.push("missing_required_metadata");
      break;
    }
  }

  if (reasonCodes.length > 0) {
    return { decision: "policy_failed", reason_codes: reasonCodes };
  }

  if (request.amount > policy.requires_review_above) {
    return { decision: "requires_review", reason_codes: ["review_threshold_exceeded"] };
  }

  return { decision: "policy_passed", reason_codes: [] };
}

function buildReceipt({ scenario, policy, quote, request }, evaluation) {
  return {
    receipt_id: `demo_${scenario.id}`,
    decision: evaluation.decision,
    reason_codes: evaluation.reason_codes,
    evaluated_at: "2026-06-23T10:05:02Z",
    scenario_id: scenario.id,
    redaction: {
      mode: "default",
      redacted_fields: ["session_id", "idempotency_key"]
    },
    policy: {
      policy_id: policy.policy_id,
      version: policy.version,
      max_amount_per_payment: policy.max_amount_per_payment,
      max_total_budget: policy.max_total_budget
    },
    payment_request: {
      request_id: request.request_id,
      session_id: "redacted",
      idempotency_key: "redacted",
      merchant_id: request.merchant.canonical_merchant_id,
      amount: request.amount,
      currency: request.currency,
      chain: request.chain
    },
    quote: {
      quote_id: quote.quote_id,
      quoted_amount: quote.quoted_amount,
      final_amount: quote.final_amount,
      drift_percentage: quote.drift_percentage,
      expires_at: quote.expires_at
    }
  };
}

function buildReport({ scenario, request }, evaluation) {
  const reasons =
    evaluation.reason_codes.length > 0
      ? evaluation.reason_codes.map((reason) => `- ${reason}`).join("\n")
      : "- no policy violations";

  return `# Gauntlet Preflight Report

Scenario: ${scenario.title}
Description: ${scenario.description}

Decision: ${evaluation.decision}

Payment:
- Merchant: ${request.merchant.canonical_merchant_id}
- Amount: ${request.amount} ${request.currency}
- Chain: ${request.chain}

Reason codes:
${reasons}

FDE note:
Use this artifact to explain why an agent payment should continue, fail closed, or ask for review before any provider call moves money.`;
}

function mergeDeep(base, patch) {
  const output = clone(base);
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = mergeDeep(output[key] ?? {}, value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}
