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
    short: "建立正常基线",
    description: "请求、报价、商户和任务历史均符合当前策略。",
    trigger: "2.00 USDC · 允许商户",
    patch: {}
  },
  {
    id: "manual-review-threshold",
    title: "触发人工复核",
    short: "展示三态决定",
    description: "金额未超过硬性上限，但已超过 Agent 的自主支付阈值。",
    trigger: "自主额度 3 → 请求 4 USDC",
    patch: {
      quote: { quoted_amount: 4, final_amount: 4, drift_amount: 0, drift_percentage: 0 },
      request: { amount: 4 }
    }
  },
  {
    id: "amount-exceeds-single-payment-limit",
    title: "单笔金额超限",
    short: "超过硬性上限",
    description: "Agent 尝试支付超过单笔策略上限的金额。",
    trigger: "单笔上限 5 → 请求 8 USDC",
    patch: { request: { amount: 8 } }
  },
  {
    id: "cumulative-budget-exceeded",
    title: "任务预算不足",
    short: "累计支出超额",
    description: "单笔金额不高，但任务累计支出将超过预算。",
    trigger: "已支出 19 + 本次 2 USDC",
    patch: { history: { total_amount_spent: 19 } }
  },
  {
    id: "blocked-merchant",
    title: "命中禁用商户",
    short: "对手方不允许",
    description: "付款目标是策略明确禁止的商户。",
    trigger: "允许商户 → 禁用商户",
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
    short: "结算资产冲突",
    description: "报价使用 USDC，但请求换成了其他结算币种。",
    trigger: "报价 USDC → 请求 EUR",
    patch: { request: { currency: "EUR", token: "EUR" } }
  },
  {
    id: "quote-expired",
    title: "报价已经过期",
    short: "时效边界失效",
    description: "模拟请求发生时，原始报价已不再有效。",
    trigger: "10:01 过期 → 10:05 请求",
    patch: { quote: { expires_at: "2026-06-23T10:01:00Z" } }
  },
  {
    id: "amount-drift-above-threshold",
    title: "报价金额漂移",
    short: "推荐开场场景",
    description: "最终金额相较原报价上涨 25%，超过策略允许的 10%。",
    trigger: "2.00 → 2.50 USDC · +25%",
    patch: {
      quote: { final_amount: 2.5, drift_amount: 0.5, drift_percentage: 25 },
      request: { amount: 2.5 }
    }
  },
  {
    id: "duplicate-idempotency-key",
    title: "疑似重复支付",
    short: "验证重复重试",
    description: "重试请求复用了当前任务已经出现过的幂等键。",
    trigger: "idem_123 首次 → 已使用",
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
  quote_expired: "模拟请求发生时，原始报价已经过期",
  quote_amount_drift_exceeded: "最终金额相对报价的变化超过 10%",
  duplicate_idempotency_key: "当前任务中已使用过相同的幂等键",
  missing_required_metadata: "支付请求缺少策略要求的必要信息",
  review_threshold_exceeded: "金额超过 3 USDC，需要人工确认"
};

const checkDefinitions = [
  {
    id: "metadata",
    label: "必要支付信息",
    rule: ({ policy }) => `${policy.required_metadata.length} 个字段完整`,
    reasons: ["missing_required_metadata"]
  },
  {
    id: "amount",
    label: "单笔金额上限",
    rule: ({ policy }) => `请求不高于 ${policy.max_amount_per_payment} ${policy.currency}`,
    reasons: ["amount_exceeds_single_payment_limit"]
  },
  {
    id: "budget",
    label: "任务累计预算",
    rule: ({ policy, history, request }) =>
      `${formatAmount(history.total_amount_spent + request.amount)} / ${formatAmount(policy.max_total_budget)} ${policy.currency}`,
    reasons: ["cumulative_budget_exceeded"]
  },
  {
    id: "merchant",
    label: "商户允许范围",
    rule: ({ request }) => request.merchant.canonical_merchant_id,
    reasons: ["blocked_merchant", "merchant_not_allowed"]
  },
  {
    id: "asset",
    label: "币种与支付网络",
    rule: ({ request }) => `${request.currency} · ${request.chain}`,
    reasons: ["currency_mismatch", "token_mismatch", "chain_mismatch"]
  },
  {
    id: "expiry",
    label: "策略与报价时效",
    rule: ({ request, quote }) =>
      new Date(request.created_at) > new Date(quote.expires_at) ? "报价已过期" : "报价仍在有效期内",
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
    rule: ({ history }) => history.used_idempotency_keys.length > 0 ? "发现已使用的幂等键" : "未发现重复键",
    reasons: ["duplicate_idempotency_key"]
  }
];

const shortcutScenarioIds = [
  "amount-drift-above-threshold",
  "valid-mcp-paid-tool-payment",
  "duplicate-idempotency-key",
  "manual-review-threshold"
];

const els = {
  scenarioIndex: document.querySelector("#scenarioIndex"),
  scenarioTitle: document.querySelector("#scenarioTitle"),
  scenarioShortcuts: document.querySelector("#scenarioShortcuts"),
  scenarioGrid: document.querySelector("#scenarioGrid"),
  scenarioDialog: document.querySelector("#scenarioDialog"),
  editDialog: document.querySelector("#editDialog"),
  openScenariosButton: document.querySelector("#openScenariosButton"),
  editButton: document.querySelector("#editButton"),
  editForm: document.querySelector("#editForm"),
  applyEditButton: document.querySelector("#applyEditButton"),
  resetButton: document.querySelector("#resetButton"),
  amountInput: document.querySelector("#amountInput"),
  merchantInput: document.querySelector("#merchantInput"),
  quoteExpiryInput: document.querySelector("#quoteExpiryInput"),
  editQuotedAmount: document.querySelector("#editQuotedAmount"),
  editDrift: document.querySelector("#editDrift"),
  scenarioDescription: document.querySelector("#scenarioDescription"),
  caseTitle: document.querySelector("#caseTitle"),
  requestIdLabel: document.querySelector("#requestIdLabel"),
  amountDisplay: document.querySelector("#amountDisplay"),
  currencyDisplay: document.querySelector("#currencyDisplay"),
  purposeDisplay: document.querySelector("#purposeDisplay"),
  merchantDisplay: document.querySelector("#merchantDisplay"),
  causeBeforeLabel: document.querySelector("#causeBeforeLabel"),
  quotedAmount: document.querySelector("#quotedAmount"),
  causeAfterLabel: document.querySelector("#causeAfterLabel"),
  finalAmount: document.querySelector("#finalAmount"),
  deltaLabel: document.querySelector("#deltaLabel"),
  deltaValue: document.querySelector("#deltaValue"),
  boundaryLabel: document.querySelector("#boundaryLabel"),
  boundaryValue: document.querySelector("#boundaryValue"),
  networkFact: document.querySelector("#networkFact"),
  budgetFact: document.querySelector("#budgetFact"),
  expiryFact: document.querySelector("#expiryFact"),
  scanQueue: document.querySelector("#scanQueue"),
  checkProgressBar: document.querySelector("#checkProgressBar"),
  checkProgressText: document.querySelector("#checkProgressText"),
  resultHero: document.querySelector("#resultHero"),
  resultIcon: document.querySelector("#resultIcon"),
  resultEyebrow: document.querySelector("#resultEyebrow"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  primaryReason: document.querySelector("#primaryReason"),
  primaryReasonCode: document.querySelector("#primaryReasonCode"),
  decisionComparison: document.querySelector("#decisionComparison"),
  toggleRulesButton: document.querySelector("#toggleRulesButton"),
  toggleRulesText: document.querySelector("#toggleRulesText"),
  ruleEvidence: document.querySelector("#ruleEvidence"),
  ruleSummary: document.querySelector("#ruleSummary"),
  resultRules: document.querySelector("#resultRules"),
  receiptFacts: document.querySelector("#receiptFacts"),
  evidenceCode: document.querySelector("#evidenceCode"),
  copyButton: document.querySelector("#copyButton"),
  downloadButton: document.querySelector("#downloadButton"),
  primaryAction: document.querySelector("#primaryAction"),
  backButton: document.querySelector("#backButton"),
  dockStatus: document.querySelector("#dockStatus"),
  dockMessage: document.querySelector("#dockMessage"),
  toast: document.querySelector("#toast")
};

let activeScenario = scenarios.find((scenario) => scenario.id === "amount-drift-above-threshold");
let activeFixture = makeFixture(activeScenario);
let activeScreen = "request";
let activeTab = "receipt";
let lastEvaluation = null;
let visibleCheckCount = 0;
let runToken = 0;
let isRunning = false;
let isCustom = false;

buildScenarioControls();
bindEvents();
syncControlsFromFixture();
render();

function buildScenarioControls() {
  els.scenarioShortcuts.innerHTML = "";
  shortcutScenarioIds.forEach((id) => {
    const scenario = scenarios.find((item) => item.id === id);
    const button = document.createElement("button");
    button.className = "shortcut-button";
    button.type = "button";
    button.dataset.scenario = id;
    button.textContent = scenario.title;
    button.addEventListener("click", () => selectScenario(scenario));
    els.scenarioShortcuts.append(button);
  });

  els.scenarioGrid.innerHTML = "";
  scenarios.forEach((scenario) => {
    const evaluation = evaluate(makeFixture(scenario));
    const state = decisionState(evaluation.decision);
    const outcome = state === "pass" ? "符合策略" : state === "review" ? "需要复核" : "违反策略";
    const button = document.createElement("button");
    button.className = "scenario-card";
    button.type = "button";
    button.dataset.scenario = scenario.id;
    button.innerHTML = `
      <span class="scenario-card-head">
        <span><strong>${scenario.title}</strong><small>${scenario.short}</small></span>
        <span class="outcome-tag ${state}">${outcome}</span>
      </span>
      <span class="scenario-trigger">${iconHtml("arrow")} ${scenario.trigger}</span>
    `;
    button.addEventListener("click", () => {
      selectScenario(scenario);
      els.scenarioDialog.close();
    });
    els.scenarioGrid.append(button);
  });
}

function bindEvents() {
  els.openScenariosButton.addEventListener("click", () => els.scenarioDialog.showModal());
  els.editButton.addEventListener("click", () => {
    syncControlsFromFixture();
    renderEditPreview();
    els.editDialog.showModal();
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => document.querySelector(`#${button.dataset.closeDialog}`).close());
  });

  els.amountInput.addEventListener("input", renderEditPreview);
  els.editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyEdits();
    els.editDialog.close();
  });
  els.resetButton.addEventListener("click", resetFixture);
  els.primaryAction.addEventListener("click", handlePrimaryAction);
  els.backButton.addEventListener("click", handleBack);
  els.toggleRulesButton.addEventListener("click", toggleRules);
  els.copyButton.addEventListener("click", copyReceipt);
  els.downloadButton.addEventListener("click", downloadReceipt);

  document.querySelectorAll(".document-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      document.querySelectorAll(".document-tab").forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      renderReceipt();
    });
  });
}

function selectScenario(scenario) {
  cancelRun();
  activeScenario = scenario;
  activeFixture = makeFixture(scenario);
  activeScreen = "request";
  lastEvaluation = null;
  visibleCheckCount = 0;
  isCustom = false;
  els.ruleEvidence.hidden = true;
  els.toggleRulesButton.classList.remove("open");
  syncControlsFromFixture();
  render();
}

function resetFixture() {
  activeFixture = makeFixture(activeScenario);
  isCustom = false;
  syncControlsFromFixture();
  renderEditPreview();
  showToast("已恢复场景的初始请求");
}

function applyEdits() {
  const amount = Number(els.amountInput.value);
  const merchantId = els.merchantInput.value;
  const displayNames = {
    merchant_api_example: "Example MCP 工具服务",
    merchant_blocked: "已禁用工具服务",
    merchant_unknown: "未知工具服务"
  };

  activeFixture.request.amount = Number.isFinite(amount) ? amount : 0;
  activeFixture.quote.final_amount = activeFixture.request.amount;
  activeFixture.quote.drift_amount = round(activeFixture.request.amount - activeFixture.quote.quoted_amount);
  activeFixture.quote.drift_percentage = round(
    ((activeFixture.request.amount - activeFixture.quote.quoted_amount) /
      activeFixture.quote.quoted_amount) * 100
  );
  activeFixture.request.merchant = {
    ...activeFixture.request.merchant,
    merchant_id: merchantId,
    canonical_merchant_id: merchantId,
    merchant_display_name: displayNames[merchantId]
  };
  activeFixture.quote.expires_at =
    els.quoteExpiryInput.value === "expired"
      ? "2026-06-23T10:01:00Z"
      : "2026-06-23T10:10:00Z";

  cancelRun();
  activeScreen = "request";
  lastEvaluation = null;
  visibleCheckCount = 0;
  isCustom = true;
  render();
  showToast("测试输入已更新，请重新运行测试");
}

function handlePrimaryAction() {
  if (activeScreen === "request") {
    runPreflight();
  } else if (activeScreen === "checking") {
    finishPreflight();
  } else if (activeScreen === "result") {
    showScreen("receipt");
  } else {
    els.scenarioDialog.showModal();
  }
}

function handleBack() {
  if (activeScreen === "receipt") {
    showScreen("result");
  } else if (activeScreen === "result") {
    lastEvaluation = null;
    showScreen("request");
  }
}

async function runPreflight() {
  if (isRunning) return;

  const token = ++runToken;
  isRunning = true;
  lastEvaluation = null;
  visibleCheckCount = 0;
  els.ruleEvidence.hidden = true;
  els.toggleRulesButton.classList.remove("open");
  document.querySelector(".result-screen").classList.remove("rules-open");
  activeScreen = "checking";
  render();

  for (let index = 0; index < checkDefinitions.length; index += 1) {
    if (token !== runToken) return;
    visibleCheckCount = index + 1;
    renderChecking();
    await delay(125);
  }

  if (token !== runToken) return;
  await delay(120);
  finishPreflight();
}

function finishPreflight() {
  runToken += 1;
  isRunning = false;
  visibleCheckCount = checkDefinitions.length;
  lastEvaluation = evaluate(activeFixture);
  activeScreen = "result";
  render();
}

function cancelRun() {
  runToken += 1;
  isRunning = false;
}

function showScreen(screen) {
  activeScreen = screen;
  render();
  document.querySelector(".stage").scrollTop = 0;
}

function render() {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === activeScreen);
  });
  renderScenarioState();
  renderProgress();
  renderRequest();
  renderChecking();
  renderResult();
  renderReceipt();
  renderDock();
}

function renderScenarioState() {
  const index = scenarios.indexOf(activeScenario) + 1;
  els.scenarioIndex.textContent = `${String(index).padStart(2, "0")} / ${String(scenarios.length).padStart(2, "0")}`;
  els.scenarioTitle.textContent = `${activeScenario.title}${isCustom ? " · 已自定义" : ""}`;

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === activeScenario.id);
  });
}

function renderProgress() {
  const order = ["request", "checking", "result", "receipt"];
  const activeIndex = order.indexOf(activeScreen);
  document.querySelectorAll(".progress-step").forEach((step, index) => {
    step.classList.toggle("active", index === activeIndex);
    step.classList.toggle("done", index < activeIndex);
  });
}

function renderRequest() {
  const causal = buildCausalFacts(activeFixture);
  const expired = new Date(activeFixture.request.created_at) > new Date(activeFixture.quote.expires_at);
  els.scenarioDescription.textContent = isCustom
    ? "模拟请求已经调整。Gauntlet 将基于当前 fixture 重新执行规则并生成测试结果。"
    : activeScenario.description;
  els.caseTitle.textContent = `${activeScenario.title}${isCustom ? " · 自定义输入" : ""}`;
  els.requestIdLabel.textContent = activeFixture.request.request_id.toUpperCase();
  els.amountDisplay.textContent = formatAmount(activeFixture.request.amount);
  els.currencyDisplay.textContent = activeFixture.request.currency;
  els.purposeDisplay.textContent = activeFixture.request.purpose;
  els.merchantDisplay.textContent = activeFixture.request.merchant.merchant_display_name;
  els.causeBeforeLabel.textContent = causal.beforeLabel;
  els.quotedAmount.textContent = causal.beforeValue;
  els.causeAfterLabel.textContent = causal.afterLabel;
  els.finalAmount.textContent = causal.afterValue;
  els.deltaLabel.textContent = causal.deltaLabel;
  els.deltaValue.textContent = causal.deltaValue;
  els.boundaryLabel.textContent = causal.boundaryLabel;
  els.boundaryValue.textContent = causal.boundaryValue;
  els.networkFact.textContent = `${titleCase(activeFixture.request.chain)} · ${activeFixture.request.currency}`;
  els.budgetFact.textContent = `${formatAmount(activeFixture.history.total_amount_spent + activeFixture.request.amount)} / ${formatAmount(activeFixture.policy.max_total_budget)} ${activeFixture.policy.currency}`;
  els.expiryFact.textContent = expired ? "已过期" : "有效期内";
}

function renderChecking() {
  const evaluation = evaluate(activeFixture);
  els.checkProgressBar.style.width = `${(visibleCheckCount / checkDefinitions.length) * 100}%`;
  els.checkProgressText.textContent = `${visibleCheckCount} / ${checkDefinitions.length}`;
  els.scanQueue.innerHTML = "";

  checkDefinitions.forEach((check, index) => {
    const failed = check.reasons.some((reason) => evaluation.reason_codes.includes(reason));
    const checked = index < visibleCheckCount;
    const active = isRunning && index === visibleCheckCount;
    const state = checked ? (failed ? "fail" : "pass") : active ? "active" : "idle";
    const status = checked ? (failed ? "未通过" : "符合") : active ? "正在检查" : "等待";
    const indicator = checked ? (failed ? "×" : "✓") : index + 1;
    const row = document.createElement("div");
    row.className = `scan-row ${state}`;
    row.innerHTML = `
      <span class="scan-state">${indicator}</span>
      <strong>${check.label}</strong>
      <span>${check.rule(activeFixture)}</span>
      <em>${status}</em>
    `;
    els.scanQueue.append(row);
  });
}

function renderResult() {
  if (!lastEvaluation) return;

  const state = decisionState(lastEvaluation.decision);
  const reason = lastEvaluation.reason_codes[0] ?? "no_policy_violations";
  const causal = buildCausalFacts(activeFixture);
  const view = {
    pass: {
      icon: "check",
      eyebrow: "POLICY PASSED",
      title: "测试结果：符合当前策略",
      summary: "该 fixture 的 8 项确定性检查均符合当前配置。"
    },
    fail: {
      icon: "x",
      eyebrow: "POLICY FAILED",
      title: "测试结果：违反当前策略",
      summary: "该模拟支付请求命中了当前策略中的失败条件。"
    },
    review: {
      icon: "alert",
      eyebrow: "HUMAN REVIEW REQUIRED",
      title: "测试结果：需要人工复核",
      summary: "硬性规则均符合，但该 fixture 超过 Agent 的自主支付阈值。"
    }
  }[state];

  els.resultHero.className = `result-hero ${state}`;
  els.resultIcon.innerHTML = iconHtml(view.icon);
  els.resultEyebrow.textContent = view.eyebrow;
  els.resultTitle.textContent = view.title;
  els.resultSummary.textContent = view.summary;
  els.primaryReason.textContent = reason === "no_policy_violations"
    ? "未发现违反当前配置策略的条件"
    : reasonCopy[reason] ?? reason;
  els.primaryReasonCode.textContent = reason;
  els.primaryReasonCode.style.color = state === "pass" ? "var(--green)" : state === "review" ? "var(--amber)" : "var(--red)";
  els.primaryReasonCode.style.background = state === "pass" ? "var(--green-soft)" : state === "review" ? "var(--amber-soft)" : "var(--red-soft)";

  els.decisionComparison.innerHTML = [
    [causal.beforeLabel, causal.beforeValue],
    [causal.afterLabel, causal.afterValue],
    [causal.boundaryLabel, causal.boundaryValue]
  ].map(([label, value]) => `<div><small>${label}</small><strong>${value}</strong></div>`).join("");

  renderResultRules();
}

function renderResultRules() {
  if (!lastEvaluation) return;
  let failedCount = 0;
  els.resultRules.innerHTML = "";
  checkDefinitions.forEach((check, index) => {
    const failed = check.reasons.some((reason) => lastEvaluation.reason_codes.includes(reason));
    if (failed) failedCount += 1;
    const row = document.createElement("div");
    row.className = `result-rule ${failed ? "fail" : "pass"}`;
    row.innerHTML = `
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${check.label}</strong>
      <span>${check.rule(activeFixture)}</span>
      <em>${failed ? "未通过" : "符合"}</em>
    `;
    els.resultRules.append(row);
  });
  els.ruleSummary.textContent = `${checkDefinitions.length - failedCount} 项符合 · ${failedCount} 项未通过`;
}

function toggleRules() {
  const willOpen = els.ruleEvidence.hidden;
  els.ruleEvidence.hidden = !willOpen;
  els.toggleRulesButton.classList.toggle("open", willOpen);
  els.toggleRulesText.textContent = willOpen ? "收起完整规则" : "查看全部 8 项检查";
  document.querySelector(".result-screen").classList.toggle("rules-open", willOpen);
}

function renderReceipt() {
  if (!lastEvaluation) return;
  const receipt = buildReceipt(activeFixture, lastEvaluation);
  const requestSnapshot = {
    quote: activeFixture.quote,
    payment_request: activeFixture.request,
    history: activeFixture.history
  };
  const views = {
    receipt: pretty(receipt),
    report: buildReport(activeFixture, lastEvaluation),
    request: pretty(requestSnapshot),
    policy: pretty(activeFixture.policy)
  };
  els.receiptFacts.innerHTML = [
    ["凭证 ID", receipt.receipt_id],
    ["最终决定", decisionLabel(lastEvaluation.decision)],
    ["策略版本", `${activeFixture.policy.policy_id} · v${activeFixture.policy.version}`],
    ["脱敏字段", "session_id, idempotency_key"]
  ].map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("");
  els.evidenceCode.textContent = views[activeTab];
}

function renderDock() {
  const config = {
    request: {
      status: isCustom ? "测试输入已修改" : "测试场景已就绪",
      message: isCustom ? "当前输入不同于场景初始 fixture，需要重新运行测试。" : "本地 fixture 已准备，不会连接钱包或移动资金。",
      action: "运行这个失败测试",
      icon: "play",
      back: false
    },
    checking: {
      status: "正在执行测试",
      message: `已完成 ${visibleCheckCount} / ${checkDefinitions.length} 项确定性检查。`,
      action: "立即显示结果",
      icon: "shield",
      back: false
    },
    result: {
      status: decisionLabel(lastEvaluation?.decision),
      message: "验证结果与原因码已生成，可以继续查看脱敏测试凭证。",
      action: "查看测试凭证",
      icon: "file",
      back: true
    },
    receipt: {
      status: "测试凭证已生成",
      message: "测试输入、规则轨迹和结果已记录，敏感字段已脱敏。",
      action: "选择下一个测试场景",
      icon: "list",
      back: true
    }
  }[activeScreen];

  els.dockStatus.textContent = config.status;
  els.dockMessage.textContent = config.message;
  els.primaryAction.innerHTML = `${iconHtml(config.icon)}<span>${config.action}</span>`;
  els.backButton.hidden = !config.back;
}

function syncControlsFromFixture() {
  els.amountInput.value = activeFixture.request.amount;
  els.merchantInput.value = activeFixture.request.merchant.merchant_id;
  els.quoteExpiryInput.value =
    new Date(activeFixture.request.created_at) > new Date(activeFixture.quote.expires_at)
      ? "expired"
      : "valid";
  renderEditPreview();
}

function renderEditPreview() {
  const amount = Number(els.amountInput.value) || 0;
  const drift = round(((amount - activeFixture.quote.quoted_amount) / activeFixture.quote.quoted_amount) * 100);
  els.editQuotedAmount.textContent = `${formatAmount(activeFixture.quote.quoted_amount)} ${activeFixture.quote.quoted_currency}`;
  els.editDrift.textContent = `${drift >= 0 ? "+" : ""}${formatAmount(drift)}%`;
}

function buildCausalFacts({ policy, quote, request, history }) {
  const evaluation = evaluate({ policy, quote, request, history });
  const reasons = evaluation.reason_codes;

  if (reasons.includes("amount_exceeds_single_payment_limit")) {
    return {
      beforeLabel: "单笔策略上限",
      beforeValue: `${formatAmount(policy.max_amount_per_payment)} ${policy.currency}`,
      afterLabel: "当前支付请求",
      afterValue: `${formatAmount(request.amount)} ${request.currency}`,
      deltaLabel: "超出额度",
      deltaValue: `+${formatAmount(request.amount - policy.max_amount_per_payment)} ${policy.currency}`,
      boundaryLabel: "硬性边界",
      boundaryValue: `请求 ≤ ${formatAmount(policy.max_amount_per_payment)} ${policy.currency}`
    };
  }
  if (reasons.includes("cumulative_budget_exceeded")) {
    return {
      beforeLabel: "任务已支出",
      beforeValue: `${formatAmount(history.total_amount_spent)} ${policy.currency}`,
      afterLabel: "加上本次请求",
      afterValue: `${formatAmount(history.total_amount_spent + request.amount)} ${policy.currency}`,
      deltaLabel: "本次金额",
      deltaValue: `+${formatAmount(request.amount)} ${request.currency}`,
      boundaryLabel: "任务预算",
      boundaryValue: `累计 ≤ ${formatAmount(policy.max_total_budget)} ${policy.currency}`
    };
  }
  if (reasons.includes("blocked_merchant") || reasons.includes("merchant_not_allowed")) {
    return {
      beforeLabel: "策略允许商户",
      beforeValue: "merchant_api_example",
      afterLabel: "当前收款方",
      afterValue: request.merchant.canonical_merchant_id,
      deltaLabel: "商户状态",
      deltaValue: reasons.includes("blocked_merchant") ? "命中禁用名单" : "不在允许范围",
      boundaryLabel: "对手方规则",
      boundaryValue: "仅允许白名单商户"
    };
  }
  if (reasons.includes("currency_mismatch") || reasons.includes("token_mismatch")) {
    return {
      beforeLabel: "策略与报价币种",
      beforeValue: policy.currency,
      afterLabel: "当前请求币种",
      afterValue: request.currency,
      deltaLabel: "资产变化",
      deltaValue: `${policy.currency} → ${request.currency}`,
      boundaryLabel: "资产规则",
      boundaryValue: "币种必须完全一致"
    };
  }
  if (reasons.includes("quote_expired") || reasons.includes("policy_expired")) {
    return {
      beforeLabel: "报价有效期至",
      beforeValue: formatTime(quote.expires_at),
      afterLabel: "模拟请求时间",
      afterValue: formatTime(request.created_at),
      deltaLabel: "时效状态",
      deltaValue: "报价已过期",
      boundaryLabel: "时效规则",
      boundaryValue: "请求必须在有效期内"
    };
  }
  if (reasons.includes("quote_amount_drift_exceeded") || quote.drift_percentage !== 0) {
    return {
      beforeLabel: "原始报价",
      beforeValue: `${formatAmount(quote.quoted_amount)} ${quote.quoted_currency}`,
      afterLabel: "最终支付请求",
      afterValue: `${formatAmount(request.amount)} ${request.currency}`,
      deltaLabel: "金额变化",
      deltaValue: `${quote.drift_percentage >= 0 ? "+" : ""}${formatAmount(quote.drift_percentage)}%`,
      boundaryLabel: "报价漂移边界",
      boundaryValue: `允许变化 ≤ ${policy.max_quote_drift_percentage}%`
    };
  }
  if (reasons.includes("duplicate_idempotency_key")) {
    return {
      beforeLabel: "幂等键初始状态",
      beforeValue: "未使用",
      afterLabel: "当前请求幂等键",
      afterValue: request.idempotency_key,
      deltaLabel: "历史比对",
      deltaValue: "已发现相同键",
      boundaryLabel: "重试规则",
      boundaryValue: "同一任务中不可复用"
    };
  }
  if (evaluation.decision === "requires_review") {
    return {
      beforeLabel: "Agent 自主额度",
      beforeValue: `${formatAmount(policy.requires_review_above)} ${policy.currency}`,
      afterLabel: "当前支付请求",
      afterValue: `${formatAmount(request.amount)} ${request.currency}`,
      deltaLabel: "超过自主额度",
      deltaValue: `+${formatAmount(request.amount - policy.requires_review_above)} ${policy.currency}`,
      boundaryLabel: "人工复核区间",
      boundaryValue: `${formatAmount(policy.requires_review_above)}–${formatAmount(policy.max_amount_per_payment)} ${policy.currency}`
    };
  }
  return {
    beforeLabel: "原始报价",
    beforeValue: `${formatAmount(quote.quoted_amount)} ${quote.quoted_currency}`,
    afterLabel: "最终支付请求",
    afterValue: `${formatAmount(request.amount)} ${request.currency}`,
    deltaLabel: "金额变化",
    deltaValue: `${quote.drift_percentage >= 0 ? "+" : ""}${formatAmount(quote.drift_percentage)}%`,
    boundaryLabel: "报价漂移边界",
    boundaryValue: `允许变化 ≤ ${policy.max_quote_drift_percentage}%`
  };
}

function evaluate({ policy, quote, request, history }) {
  const reasonCodes = [];
  if (request.amount > policy.max_amount_per_payment) reasonCodes.push("amount_exceeds_single_payment_limit");
  if (history.total_amount_spent + request.amount > policy.max_total_budget) reasonCodes.push("cumulative_budget_exceeded");
  if (policy.blocked_merchants.includes(request.merchant.canonical_merchant_id)) {
    reasonCodes.push("blocked_merchant");
  } else if (!policy.allowed_merchants.includes(request.merchant.canonical_merchant_id)) {
    reasonCodes.push("merchant_not_allowed");
  }
  if (request.currency !== policy.currency || quote.quoted_currency !== policy.currency) reasonCodes.push("currency_mismatch");
  if (request.token !== policy.currency) reasonCodes.push("token_mismatch");
  if (request.chain !== policy.chain) reasonCodes.push("chain_mismatch");
  if (new Date(request.created_at) > new Date(policy.expires_at)) reasonCodes.push("policy_expired");
  if (new Date(request.created_at) > new Date(quote.expires_at)) reasonCodes.push("quote_expired");
  if (Math.abs(quote.drift_percentage) > policy.max_quote_drift_percentage) reasonCodes.push("quote_amount_drift_exceeded");
  if (history.used_idempotency_keys.includes(request.idempotency_key)) reasonCodes.push("duplicate_idempotency_key");
  if (policy.required_metadata.some((field) => !request.metadata[field])) reasonCodes.push("missing_required_metadata");
  if (reasonCodes.length > 0) return { decision: "policy_failed", reason_codes: reasonCodes };
  if (request.amount > policy.requires_review_above) return { decision: "requires_review", reason_codes: ["review_threshold_exceeded"] };
  return { decision: "policy_passed", reason_codes: [] };
}

function buildReceipt({ scenario, policy, quote, request }, evaluation) {
  const scenarioNumber = scenarios.findIndex((item) => item.id === scenario.id) + 1;
  return {
    receipt_id: `GTL-20260730-${String(scenarioNumber).padStart(2, "0")}A`,
    decision: evaluation.decision,
    reason_codes: evaluation.reason_codes,
    evaluated_at: "2026-07-30T10:05:02+08:00",
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
  const reasons = evaluation.reason_codes.length > 0
    ? evaluation.reason_codes.map((reason) => `- ${reasonCopy[reason] ?? reason} (${reason})`).join("\n")
    : "- 未发现违反当前配置策略的条件";
  return `# Gauntlet Agent 支付失败测试报告

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
Gauntlet 使用本地 fixture 执行确定性策略测试，不会连接钱包或调用支付服务商。本报告不代表真实付款授权，也不验证商户身份。`;
}

async function copyReceipt() {
  const receipt = pretty(buildReceipt(activeFixture, lastEvaluation));
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(receipt);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = receipt;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast("脱敏凭证已复制");
  } catch {
    showToast("浏览器未允许复制，请在凭证窗口中手动选择");
  }
}

function downloadReceipt() {
  const receipt = pretty(buildReceipt(activeFixture, lastEvaluation));
  const blob = new Blob([receipt], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${buildReceipt(activeFixture, lastEvaluation).receipt_id}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("脱敏凭证已下载");
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
    output[key] = value && typeof value === "object" && !Array.isArray(value)
      ? mergeDeep(output[key] ?? {}, value)
      : value;
  }
  return output;
}

function decisionState(decision) {
  if (decision === "policy_failed") return "fail";
  if (decision === "requires_review") return "review";
  return "pass";
}

function decisionLabel(decision) {
  if (decision === "policy_failed") return "违反当前策略";
  if (decision === "requires_review") return "需要人工复核";
  return "符合当前策略";
}

function iconHtml(name) {
  return `<svg aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
}

function formatAmount(value) {
  return Number(value).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
