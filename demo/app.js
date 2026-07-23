const basePolicy = {
  policy_id: "agent-pay-v1",
  version: 1,
  agent_id: "research-agent",
  max_amount_per_payment: 5,
  max_total_budget: 20,
  budget_window: "task",
  currency: "USDC",
  chain: "base",
  allowed_merchants: ["merchant_api_example"],
  blocked_merchants: ["merchant_blocked"],
  requires_review_above: 3,
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
    merchant_display_name: "Example MCP 工具服务"
  },
  amount: 2,
  currency: "USDC",
  token: "USDC",
  chain: "base",
  purpose: "购买 MCP 工具调用权限",
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
    title: "正常工具支付",
    short: "基线场景",
    description: "一笔符合当前策略的 MCP 工具调用付款。",
    patch: {}
  },
  {
    id: "manual-review-threshold",
    title: "触发人工复核",
    short: "三态演示",
    description: "金额未超过硬性上限，但已超过 Agent 的自主支付阈值。",
    patch: {
      quote: { quoted_amount: 4, final_amount: 4, drift_amount: 0, drift_percentage: 0 },
      request: { amount: 4 }
    }
  },
  {
    id: "amount-exceeds-single-payment-limit",
    title: "单笔金额超限",
    short: "金额风险",
    description: "Agent 尝试支付超过单笔策略上限的金额。",
    patch: { request: { amount: 8 } }
  },
  {
    id: "cumulative-budget-exceeded",
    title: "任务预算不足",
    short: "累计风险",
    description: "单笔金额不高，但任务累计支出将超过预算。",
    patch: { history: { total_amount_spent: 19 } }
  },
  {
    id: "blocked-merchant",
    title: "命中禁用商户",
    short: "商户风险",
    description: "付款目标是策略明确禁止的商户。",
    patch: {
      request: {
        merchant: {
          merchant_id: "merchant_blocked",
          canonical_merchant_id: "merchant_blocked",
          merchant_type: "mcp_server",
          merchant_display_name: "已禁用工具服务"
        }
      }
    }
  },
  {
    id: "wrong-token-or-currency",
    title: "币种不一致",
    short: "资产风险",
    description: "报价使用 USDC，但请求换成了其他结算币种。",
    patch: { request: { currency: "EUR", token: "EUR" } }
  },
  {
    id: "quote-expired",
    title: "报价已经过期",
    short: "时效风险",
    description: "付款请求到达时，原始报价已不再有效。",
    patch: { quote: { expires_at: "2026-06-23T10:01:00Z" } }
  },
  {
    id: "amount-drift-above-threshold",
    title: "报价金额漂移",
    short: "重点演示",
    description: "最终金额相较原报价上涨 25%，超过策略允许的 10%。",
    patch: {
      quote: { final_amount: 2.5, drift_amount: 0.5, drift_percentage: 25 },
      request: { amount: 2.5 }
    }
  },
  {
    id: "duplicate-idempotency-key",
    title: "疑似重复支付",
    short: "重试风险",
    description: "重试请求复用了当前任务已经出现过的幂等键。",
    patch: { history: { used_idempotency_keys: ["idem_123"] } }
  }
];

const reasonCopy = {
  amount_exceeds_single_payment_limit: "本次金额超过 5 USDC 的单笔支付上限",
  cumulative_budget_exceeded: "本次支付会使任务累计支出超过 20 USDC",
  blocked_merchant: "收款方出现在策略禁用名单中",
  merchant_not_allowed: "收款方不在当前策略的允许范围内",
  currency_mismatch: "支付币种与策略或报价不一致",
  token_mismatch: "结算资产与策略要求不一致",
  chain_mismatch: "支付网络与策略要求不一致",
  policy_expired: "当前支付策略已过有效期",
  quote_expired: "付款请求发生时，原始报价已经过期",
  quote_amount_drift_exceeded: "最终金额相对报价的变化超过 10%",
  duplicate_idempotency_key: "当前任务中已使用过相同的幂等键",
  missing_required_metadata: "支付请求缺少策略要求的必要信息",
  review_threshold_exceeded: "金额超过 3 USDC，需要人工确认"
};

const checkDefinitions = [
  {
    id: "amount",
    label: "单笔金额",
    rule: ({ policy }) => `不高于 ${policy.max_amount_per_payment} ${policy.currency}`,
    reasons: ["amount_exceeds_single_payment_limit"]
  },
  {
    id: "budget",
    label: "任务累计预算",
    rule: ({ policy, history, request }) =>
      `${formatAmount(history.total_amount_spent + request.amount)} / ${policy.max_total_budget} ${policy.currency}`,
    reasons: ["cumulative_budget_exceeded"]
  },
  {
    id: "merchant",
    label: "商户范围",
    rule: ({ request }) => request.merchant.canonical_merchant_id,
    reasons: ["blocked_merchant", "merchant_not_allowed"]
  },
  {
    id: "asset",
    label: "币种与网络",
    rule: ({ request }) => `${request.currency} · ${request.chain}`,
    reasons: ["currency_mismatch", "token_mismatch", "chain_mismatch"]
  },
  {
    id: "expiry",
    label: "报价有效期",
    rule: ({ request, quote }) =>
      new Date(request.created_at) > new Date(quote.expires_at) ? "已过期" : "仍在有效期内",
    reasons: ["policy_expired", "quote_expired"]
  },
  {
    id: "drift",
    label: "报价金额变化",
    rule: ({ policy, quote }) =>
      `实际 ${formatAmount(Math.abs(quote.drift_percentage))}% · 允许 ≤ ${policy.max_quote_drift_percentage}%`,
    reasons: ["quote_amount_drift_exceeded"]
  },
  {
    id: "idempotency",
    label: "重复支付检查",
    rule: ({ history }) => history.used_idempotency_keys.length > 0 ? "发现历史重复键" : "未发现重复键",
    reasons: ["duplicate_idempotency_key"]
  },
  {
    id: "metadata",
    label: "必要支付信息",
    rule: ({ policy }) => `${policy.required_metadata.length} 个字段完整`,
    reasons: ["missing_required_metadata"]
  }
];

const els = {
  scenarioList: document.querySelector("#scenarioList"),
  simulation: document.querySelector(".simulation"),
  runButton: document.querySelector("#runButton"),
  resetButton: document.querySelector("#resetButton"),
  amountInput: document.querySelector("#amountInput"),
  merchantInput: document.querySelector("#merchantInput"),
  quoteExpiryInput: document.querySelector("#quoteExpiryInput"),
  amountDisplay: document.querySelector("#amountDisplay"),
  currencyDisplay: document.querySelector("#currencyDisplay"),
  purposeDisplay: document.querySelector("#purposeDisplay"),
  merchantDisplay: document.querySelector("#merchantDisplay"),
  policyChecks: document.querySelector("#policyChecks"),
  decisionPanel: document.querySelector("#decisionPanel"),
  decisionTime: document.querySelector("#decisionTime"),
  decisionSymbol: document.querySelector("#decisionSymbol"),
  decisionEyebrow: document.querySelector("#decisionEyebrow"),
  decisionTitle: document.querySelector("#decisionTitle"),
  decisionSummary: document.querySelector("#decisionSummary"),
  reasonList: document.querySelector("#reasonList"),
  receiptId: document.querySelector("#receiptId"),
  evidenceLabel: document.querySelector("#evidenceLabel"),
  evidenceFacts: document.querySelector("#evidenceFacts"),
  evidenceCode: document.querySelector("#evidenceCode"),
  copyButton: document.querySelector("#copyButton"),
  toast: document.querySelector("#toast")
};

let activeScenario = scenarios[0];
let activeFixture = makeFixture(activeScenario);
let lastEvaluation = null;
let activeTab = "policy";
let runToken = 0;
let visibleCheckCount = 0;
let isRunning = false;

buildScenarioList();
bindEvents();
syncControlsFromFixture();
render();

function buildScenarioList() {
  els.scenarioList.innerHTML = "";

  scenarios.forEach((scenario, index) => {
    const evaluation = evaluate(makeFixture(scenario));
    const state = decisionState(evaluation.decision);
    const outcome = state === "pass" ? "可放行" : state === "review" ? "需复核" : "将拦截";
    const button = document.createElement("button");
    button.className = "scenario-button";
    button.type = "button";
    button.dataset.scenario = scenario.id;
    button.innerHTML = `
      <span class="scenario-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="scenario-name"><strong>${scenario.title}</strong><small>${scenario.short}</small></span>
      <span class="scenario-outcome ${state}">${outcome}</span>
    `;
    button.addEventListener("click", () => selectScenario(scenario));
    els.scenarioList.append(button);
  });
}

function bindEvents() {
  els.runButton.addEventListener("click", runPreflight);
  els.resetButton.addEventListener("click", resetFixture);

  els.amountInput.addEventListener("input", () => {
    const amount = Number(els.amountInput.value);
    activeFixture.request.amount = Number.isFinite(amount) ? amount : 0;
    activeFixture.quote.final_amount = activeFixture.request.amount;
    activeFixture.quote.drift_amount = round(activeFixture.request.amount - activeFixture.quote.quoted_amount);
    activeFixture.quote.drift_percentage = round(
      ((activeFixture.request.amount - activeFixture.quote.quoted_amount) /
        activeFixture.quote.quoted_amount) *
        100
    );
    markChanged();
  });

  els.merchantInput.addEventListener("change", () => {
    const merchantId = els.merchantInput.value;
    const displayNames = {
      merchant_api_example: "Example MCP 工具服务",
      merchant_blocked: "已禁用工具服务",
      merchant_unknown: "未知工具服务"
    };
    activeFixture.request.merchant = {
      ...activeFixture.request.merchant,
      merchant_id: merchantId,
      canonical_merchant_id: merchantId,
      merchant_display_name: displayNames[merchantId]
    };
    markChanged();
  });

  els.quoteExpiryInput.addEventListener("change", () => {
    activeFixture.quote.expires_at =
      els.quoteExpiryInput.value === "expired"
        ? "2026-06-23T10:01:00Z"
        : "2026-06-23T10:10:00Z";
    markChanged();
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      document.querySelectorAll(".tab").forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      renderEvidence();
    });
  });

  els.copyButton.addEventListener("click", copyReceipt);
}

function selectScenario(scenario) {
  cancelRun();
  activeScenario = scenario;
  activeFixture = makeFixture(scenario);
  lastEvaluation = null;
  visibleCheckCount = 0;
  syncControlsFromFixture();
  render();
}

function resetFixture() {
  cancelRun();
  activeFixture = makeFixture(activeScenario);
  lastEvaluation = null;
  visibleCheckCount = 0;
  syncControlsFromFixture();
  render();
  showToast("场景已恢复到初始状态");
}

function markChanged() {
  cancelRun();
  lastEvaluation = null;
  visibleCheckCount = 0;
  render();
}

async function runPreflight() {
  if (isRunning) return;

  const token = ++runToken;
  isRunning = true;
  lastEvaluation = null;
  visibleCheckCount = 0;
  els.runButton.disabled = true;
  els.simulation.classList.add("running");
  render();

  for (let index = 0; index < checkDefinitions.length; index += 1) {
    if (token !== runToken) return;
    visibleCheckCount = index + 1;
    renderChecks(evaluate(activeFixture));
    renderFlow(Math.min(2, Math.floor(index / 3)));
    await delay(105);
  }

  if (token !== runToken) return;
  await delay(180);
  lastEvaluation = evaluate(activeFixture);
  isRunning = false;
  els.runButton.disabled = false;
  els.simulation.classList.remove("running");
  render();
}

function cancelRun() {
  runToken += 1;
  isRunning = false;
  els.runButton.disabled = false;
  els.simulation.classList.remove("running");
}

function render() {
  document.querySelectorAll(".scenario-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === activeScenario.id);
  });

  els.amountDisplay.textContent = formatAmount(activeFixture.request.amount);
  els.currencyDisplay.textContent = activeFixture.request.currency;
  els.purposeDisplay.textContent = activeFixture.request.purpose;
  els.merchantDisplay.textContent = activeFixture.request.merchant.merchant_display_name;

  const evaluation = evaluate(activeFixture);
  renderChecks(evaluation);
  renderFlow(lastEvaluation ? 3 : isRunning ? 1 : -1);
  renderDecision();
  renderEvidence();
}

function renderChecks(evaluation) {
  els.policyChecks.innerHTML = "";

  checkDefinitions.forEach((check, index) => {
    const failed = check.reasons.some((reason) => evaluation.reason_codes.includes(reason));
    const checked = Boolean(lastEvaluation) || index < visibleCheckCount;
    const checking = isRunning && index === visibleCheckCount;
    const state = checked ? (failed ? "fail" : "pass") : checking ? "pending" : "idle";
    const stateText = checked ? (failed ? "未通过" : "符合") : checking ? "检查中" : "待检查";
    const indicator = checked ? (failed ? "×" : "✓") : "";

    const row = document.createElement("div");
    row.className = `check-row ${state}`;
    row.innerHTML = `
      <span class="check-indicator">${indicator}</span>
      <strong>${check.label}</strong>
      <span class="check-rule">${check.rule(activeFixture)}</span>
      <span class="check-state">${stateText}</span>
    `;
    els.policyChecks.append(row);
  });
}

function renderFlow(activeIndex) {
  document.querySelectorAll(".flow-step").forEach((step, index) => {
    step.classList.toggle("active", index === activeIndex);
    step.classList.toggle("done", lastEvaluation ? true : index < activeIndex);
  });
}

function renderDecision() {
  if (isRunning) {
    els.decisionPanel.className = "decision-panel running";
    els.decisionTime.textContent = "正在评估";
    els.decisionSymbol.textContent = "···";
    els.decisionEyebrow.textContent = "确定性规则执行中";
    els.decisionTitle.textContent = "正在检查";
    els.decisionSummary.textContent = `已检查 ${visibleCheckCount} / ${checkDefinitions.length} 项规则，资金尚未移动。`;
    els.reasonList.innerHTML = "<p>正在核对报价、策略、请求与任务历史…</p>";
    els.receiptId.textContent = "生成中";
    return;
  }

  if (!lastEvaluation) {
    els.decisionPanel.className = "decision-panel idle";
    els.decisionTime.textContent = "等待运行";
    els.decisionSymbol.textContent = "G";
    els.decisionEyebrow.textContent = "策略闸门";
    els.decisionTitle.textContent = "等待预检";
    els.decisionSummary.textContent = "运行后，Gauntlet 会在资金移动之前给出可解释的决定。";
    els.reasonList.innerHTML = `<p>${activeScenario.description}</p>`;
    els.receiptId.textContent = "待生成";
    return;
  }

  const state = decisionState(lastEvaluation.decision);
  const receipt = buildReceipt(activeFixture, lastEvaluation);
  const view = {
    pass: {
      symbol: "✓",
      eyebrow: "满足已配置策略",
      title: "可以继续",
      summary: "八项本地检查均符合当前策略，可继续模拟支付流程。"
    },
    fail: {
      symbol: "×",
      eyebrow: "违反已配置策略",
      title: "已拦截支付",
      summary: "Gauntlet 已在调用支付服务商之前停止这笔请求。"
    },
    review: {
      symbol: "!",
      eyebrow: "触发人工边界",
      title: "转人工复核",
      summary: "请求未违反硬性规则，但金额超过自主支付阈值。"
    }
  }[state];

  els.decisionPanel.className = `decision-panel ${state}`;
  els.decisionTime.textContent = "评估完成 · 842ms";
  els.decisionSymbol.textContent = view.symbol;
  els.decisionEyebrow.textContent = view.eyebrow;
  els.decisionTitle.textContent = view.title;
  els.decisionSummary.textContent = view.summary;
  els.receiptId.textContent = receipt.receipt_id;

  const reasons =
    lastEvaluation.reason_codes.length > 0
      ? lastEvaluation.reason_codes
      : ["no_policy_violations"];
  els.reasonList.innerHTML = "";
  reasons.forEach((reason) => {
    const item = document.createElement("p");
    item.className = "reason-item";
    item.textContent =
      reason === "no_policy_violations"
        ? "未发现违反当前配置策略的条件"
        : reasonCopy[reason] ?? reason;
    els.reasonList.append(item);
  });
}

function renderEvidence() {
  const evaluation = lastEvaluation ?? evaluate(activeFixture);
  const receipt = buildReceipt(activeFixture, evaluation);
  const requestSnapshot = {
    quote: activeFixture.quote,
    payment_request: activeFixture.request,
    history: activeFixture.history
  };
  const views = {
    policy: {
      label: "当前生效的支付边界",
      facts: [
        ["策略 ID", activeFixture.policy.policy_id],
        ["单笔上限", `${activeFixture.policy.max_amount_per_payment} USDC`],
        ["任务预算", `${activeFixture.policy.max_total_budget} USDC`],
        ["报价漂移", `≤ ${activeFixture.policy.max_quote_drift_percentage}%`]
      ],
      content: pretty(activeFixture.policy)
    },
    request: {
      label: "本次预检使用的输入快照",
      facts: [
        ["请求 ID", activeFixture.request.request_id],
        ["Agent", activeFixture.request.agent_id],
        ["收款方", activeFixture.request.merchant.canonical_merchant_id],
        ["支付金额", `${formatAmount(activeFixture.request.amount)} ${activeFixture.request.currency}`]
      ],
      content: pretty(requestSnapshot)
    },
    receipt: {
      label: "可进入 CI、PR 或复盘的脱敏凭证",
      facts: [
        ["凭证 ID", receipt.receipt_id],
        ["决策", decisionLabel(evaluation.decision)],
        ["脱敏模式", "default"],
        ["脱敏字段", "session_id, idempotency_key"]
      ],
      content: pretty(receipt)
    },
    report: {
      label: "面向开发者的可读决策报告",
      facts: [
        ["场景", activeScenario.title],
        ["结论", decisionLabel(evaluation.decision)],
        ["原因数量", String(evaluation.reason_codes.length)],
        ["输出格式", "Markdown"]
      ],
      content: buildReport(activeFixture, evaluation)
    }
  };

  const view = views[activeTab];
  els.evidenceLabel.textContent = view.label;
  els.evidenceFacts.innerHTML = view.facts
    .map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`)
    .join("");
  els.evidenceCode.textContent = view.content;
}

function syncControlsFromFixture() {
  els.amountInput.value = activeFixture.request.amount;
  els.merchantInput.value = activeFixture.request.merchant.merchant_id;
  els.quoteExpiryInput.value =
    new Date(activeFixture.request.created_at) > new Date(activeFixture.quote.expires_at)
      ? "expired"
      : "valid";
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
  if (policy.required_metadata.some((field) => !request.metadata[field])) {
    reasonCodes.push("missing_required_metadata");
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
  const scenarioNumber = scenarios.findIndex((item) => item.id === scenario.id) + 1;
  return {
    receipt_id: `GTL-20260723-${String(scenarioNumber).padStart(2, "0")}A`,
    decision: evaluation.decision,
    reason_codes: evaluation.reason_codes,
    evaluated_at: "2026-07-23T10:05:02+08:00",
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
      ? evaluation.reason_codes
          .map((reason) => `- ${reasonCopy[reason] ?? reason} (${reason})`)
          .join("\n")
      : "- 未发现违反当前配置策略的条件";

  return `# Gauntlet 支付预检报告

场景：${scenario.title}
说明：${scenario.description}

结论：${decisionLabel(evaluation.decision)}

支付请求：
- 收款方：${request.merchant.canonical_merchant_id}
- 金额：${formatAmount(request.amount)} ${request.currency}
- 网络：${request.chain}

判断依据：
${reasons}

说明：
Gauntlet 在任何支付服务商调用发生前执行本地确定性检查。本报告不代表真实付款授权，也不验证商户身份。`;
}

async function copyReceipt() {
  const evaluation = lastEvaluation ?? evaluate(activeFixture);
  const text = pretty(buildReceipt(activeFixture, evaluation));

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast("当前脱敏凭证已复制");
  } catch {
    showToast("浏览器未允许复制，请在“脱敏凭证”中手动选择");
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
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

function decisionState(decision) {
  if (decision === "policy_failed") return "fail";
  if (decision === "requires_review") return "review";
  return "pass";
}

function decisionLabel(decision) {
  if (decision === "policy_failed") return "已拦截支付";
  if (decision === "requires_review") return "转人工复核";
  return "满足当前策略";
}

function formatAmount(value) {
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function delay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
