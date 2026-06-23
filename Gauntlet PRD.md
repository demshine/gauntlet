# PRD v0.4: Gauntlet

日期：2026-06-23  
阶段：4-6 周强验证项目 / Technical Prototype / Open-source Devtool  
产品名：Gauntlet  
产品副标题：A test suite for AI agents that spend money  
第一阶段定位：MCP Paid Tool Payment Failure Test Suite  
后续潜在定位：Agent Payment Preflight & Receipt Infrastructure

## 1. 结论

Gauntlet 值得做，但不应该直接按完整 SaaS 或 “Agent Payment Safety Infrastructure” 推进。

更合理的第一阶段是：

> 面向 MCP paid tool / agent tool-use payment demo 开发者，做一个本地 agent payment policy test harness + failure scenario suite + receipt generator。

一句话定位：

> Before your AI agent pays for a tool, test whether it should.

这个版本的目标不是证明“未来 agent payment 一定需要完整安全基础设施”，而是先证明一个更具体的问题：

> 正在做 MCP paid tool 或 agent tool-use payment demo 的开发者，是否真的需要一个专门面向 agent 花钱场景的 policy test runner，而不是自己写几百行规则、日志和 mock？

如果这个问题成立，Gauntlet 后续可以升级为 Agent Payment Preflight & Receipt Infrastructure。  
如果不成立，它仍然可以沉淀为 agent payment 安全评估服务、x402 / MCP paid tool demo hardening toolkit、developer education 内容、failure scenario library，或未来 agent wallet / payment product 的内部模块。

## 2. 为什么第一阶段收窄

v0.2 的问题不是方向错，而是产品确定性写得过满。

它抓到的问题是真实的：

- agent 代表用户或企业花钱时，需要明确授权边界；
- payment request 需要在执行前被检查；
- 重复付款、金额漂移、商户变化、授权过期、prompt injection 都是高价值风险；
- 付款之后需要可解释 receipt 和 replay。

但 v0.2 直接把这些抽象成 “Agent Payment Safety Infrastructure”，这会带来几个风险：

- Primary ICP 可能认同问题，但不一定购买，因为 wallet / payment infra 团队可能自己做；
- 早期最愿意试用的人可能没钱，真正有预算的企业客户还没到大规模 agent payment 阶段；
- V1 能力主要是本地 test harness，还不足以承担 safety infrastructure 的用户期待；
- “判断付款是否符合 intent” 涉及自然语言语义、merchant identity、provider metadata，技术难度被低估；
- SaaS 商业化路径过早，付费动机未验证。

因此当前策略是：

- 正式做，但第一阶段只做可以被真实开发者用起来的 narrow devtool；
- 先做 failure test suite，不先做 hosted console；
- 先做 deterministic policy rules，不把 LLM/heuristic 判断包装成强安全结论；
- 先验证使用和集成，再谈 SaaS。

## 3. 产品定义

Gauntlet 是一个面向 MCP paid tool payment demo 的本地测试工具。

它帮助开发者在 agent 模拟调用付费 MCP tool 前，用 fixture、policy 和历史状态测试 payment request 是否符合预设 policy，并生成可复盘 receipt。

V0.1 是 offline/local test harness，不是生产 runtime enforcement，也不替开发者批准或拒绝真实付款。

核心对象：

- policy.yaml：定义 agent 花钱边界；
- payment_request.json：描述一次具体付款请求；
- history.json：描述同一 task / session 下的历史请求和决策；
- scenario：描述一个 failure case；
- receipt.json：记录这次判断的结构化结果；
- markdown report：给开发者看的可解释报告。

核心命令：

```
gauntlet init
gauntlet run
gauntlet run --scenario amount-drift
gauntlet run --policy ./policy.yaml --request ./payment_request.json
gauntlet run --policy ./policy.yaml --request ./payment_request.json --history ./history.json
gauntlet run --ci
```

## 4. 第一阶段目标用户

### 4.1 Primary ICP: MCP Paid Tool Demo Builder

这类用户正在构建：

- MCP paid tool；
- MCP server 的付费调用示例；
- agent 可以购买一次工具访问权的 demo；
- hackathon / DevRel / early product demo；
- agent tool-use payment proof of concept。

他们现在的问题不是“我要完整企业级安全基础设施”，而是：

- 我的 agent 会不会重复调用付费工具；
- 金额变化时 agent 是否还会继续付款；
- merchant 变化时是否会被拦住；
- 授权过期时是否仍然付款；
- prompt injection 能不能诱导 agent 付钱；
- 我如何向用户/团队解释这笔 agent payment 为什么通过或失败。

这类用户最适合第一阶段，因为 MCP tool-use 的 payment flow 足够具体，能在本地 CLI 里模拟完整闭环，也更容易形成可公开展示的 demo。

### 4.2 Secondary ICP: Agent Wallet / Payment Infra Early Team

这类用户认同 agent payment safety 问题，但未必会购买外部工具，因为这层能力可能是它们自己的产品护城河。

第一阶段不把它们作为主要付费 ICP，而是作为：

- 访谈对象；
- scenario 来源；
- integration service 潜在客户；
- 未来 adapter 合作对象。

### 4.3 Secondary ICP: Paid API / x402-like Demo Builder

这类用户也可能需要 Gauntlet，但第一阶段不围绕它们设计主体验。

进入该人群前需要满足：

- MCP paid tool demo 的核心模型已经跑通；
- payment_request shape 可以稳定映射到 paid API；
- 不需要声称完整兼容 x402 / AP2；
- 新增 adapter 不会改变 V0.1 的核心 schema。

### 4.4 Secondary ICP: AI Agent App Builder

这类用户希望 agent 代表用户购买 API、数据、工具或服务。

他们可能需要 Gauntlet，但前提是：

- 接入成本极低；
- 不需要理解复杂支付协议；
- 只需要写简单 policy；
- 能在本地看到 failure cases。

### 4.5 非目标用户

第一阶段不服务：

- 普通 C 端钱包用户；
- 完整企业财务团队；
- 合规部门；
- 需要真实 payment orchestration 的客户；
- 需要托管钱包或发卡的客户；
- DeFi 自动交易 bot 用户；
- 只需要通用 prompt injection eval 的用户。

## 5. 核心问题

Gauntlet 解决的问题是：

> 开发者在让 AI agent 花钱前，缺少一套专门面向 agent payment 的 failure test suite。

通用测试框架不理解：

- intent；
- mandate；
- payment request；
- merchant identity；
- quote；
- idempotency；
- payment retry；
- policy receipt；
- human review threshold。

通用 policy engine 不提供：

- agent payment scenarios；
- amount drift fixture；
- duplicate charge fixture；
- merchant mismatch fixture；
- payment-specific receipt；
- paid API / MCP paid tool example。

payment provider SDK 可能提供结算和钱包能力，但不一定提供跨 provider 的 failure test suite。

Gauntlet 的第一阶段价值是：

- 比自己写 300 行规则和日志更快；
- 比通用测试框架更懂 agent payment；
- 比 provider demo 更专注 failure cases；
- 能生成可复盘 receipt。

## 6. V0.1 功能范围

### 6.1 必须做

V0.1 只做一个足够完整的本地闭环：

1. Policy schema  
    支持 8-10 个确定性规则，优先覆盖金额、商户、quote、idempotency、必填字段、人工复核阈值。
    
2. Scenario runner  
    内置 8 个 must-have scenarios，另维护 12 个 backlog scenarios，不把数量当成第一版价值。
    
3. CLI report  
    输出 decision、reason_codes、redacted receipt、markdown report、CI exit code。
    
4. MCP paid tool example  
    提供一个 mock MCP paid tool flow，从 quote 到 payment request 到 Gauntlet 判断到 receipt 展示。
    
5. History fixture  
    支持最小 history.json，用来判断 cumulative budget、duplicate idempotency、retry、same-task repeated payment。

### 6.2 暂不做

V0.1 不做：

- runtime preflight enforcement；
- hosted API；
- team console；
- replay debugger 完整版；
- 多 provider adapter；
- x402 / AP2 完整兼容；
- marketplace；
- advanced approval；
- organization-level policy；
- risk score；
- dynamic merchant reputation；
- merchant verification service；
- 自动 merchant canonicalization；
- compliance export；
- 完整 SaaS pricing；
- 多租户权限系统。

尤其不做 risk score。没有足够真实数据时，risk score 容易制造假权威。

## 7. Deterministic Rules vs Advisory Checks

Gauntlet 必须明确区分确定性判断和启发式提示。

### 7.1 Deterministic Rules

第一版可以作为 pass/fail 强判断的规则：

- max_amount_per_payment；
- max_total_budget，基于输入 history 计算；
- allowed_merchants，基于精确 merchant_id / domain / wallet_address 匹配；
- blocked_merchants，基于精确 merchant_id / domain / wallet_address 匹配；
- token / currency；
- chain / network；
- policy expiry；
- quote expiry；
- quote amount drift；
- duplicate / idempotency，基于输入 history 计算；
- required metadata；
- review threshold。

这些规则可以 deterministic，同样输入必须得到同样结果。

V0.1 不把自然语言 purpose、merchant reputation、category inference、provider trustworthiness 作为强判断依据。

### 7.2 Advisory Checks

第一版只能作为 warning / advisory 的检查：

- prompt injection detection；
- purpose mismatch；
- merchant semantic mismatch；
- category inference；
- suspicious tool response；
- unusual payment reason。

这些不能直接包装成强安全结论。

产品语言必须避免：

- This payment is safe.
- This is unsafe.
- We approved this payment.

推荐语言：

- This request satisfies the configured policy.
- This request violates the configured policy.
- This request requires review.
- This input is invalid or incomplete.

## 8. Decision 语义

为了避免责任边界混乱，V0.1 不使用 approve / reject 作为核心 decision。

改为：

- policy_passed；
- policy_failed；
- requires_review；
- invalid_input。

含义：

- policy_passed：请求满足当前配置的确定性 policy；
- policy_failed：请求违反当前配置的确定性 policy；
- requires_review：请求触发人工复核条件；
- invalid_input：请求缺少必要字段或格式错误。

这能避免用户误以为 Gauntlet 在替他们做资金安全背书。

### 8.1 Decision Precedence

当多个规则同时触发时，decision 按以下优先级确定：

1. invalid_input  
2. policy_failed  
3. requires_review  
4. policy_passed

例子：

- 如果 request 缺少 quote_id，同时金额超过上限，结果是 invalid_input；
- 如果 request 超过 review threshold，同时 merchant 在 blocked_merchants 中，结果是 policy_failed；
- 如果 request 满足所有强规则但超过 requires_review_above，结果是 requires_review；
- advisory warning 不改变 deterministic decision，除非用户显式开启 heuristic enforcement。

### 8.2 CI Exit Code

CI 模式下：

- policy_passed：exit 0；
- requires_review：默认 exit 1，可通过 --allow-review 设置为 exit 0；
- policy_failed：exit 1；
- invalid_input：exit 2；
- CLI / schema / runtime error：exit 3。

## 9. 数据模型

V0.1 的数据模型只服务本地 deterministic evaluation。所有对象都来自用户 repo 中的 fixture 或 CLI 参数，不依赖远程 provider，也不做真实身份验证。

### 9.1 Policy

```
policy_id: default-agent-payment-policy
version: 1
agent_id: research-agent
max_amount_per_payment: 5
max_total_budget: 20
budget_window: task
currency: USDC
chain: base
allowed_merchants:
  - merchant_api_example
blocked_merchants:
  - merchant_unknown
requires_review_above: 3
expires_at: "2026-06-30T23:59:59Z"
max_payments_per_task: 2
max_quote_drift_percentage: 10
required_metadata:
  - idempotency_key
  - quote_id
```

### 9.2 Merchant

V0.1 的 merchant identity 只做 fixture 内的 deterministic matching。Gauntlet 不声明某个 merchant 真实可信，也不做外部 verification。

字段：

- merchant_id；
- canonical_merchant_id；
- merchant_type；
- merchant_domain；
- merchant_wallet_address；
- merchant_provider_id；
- merchant_display_name。

merchant_type 可选：

- domain；
- api_endpoint；
- mcp_server；
- wallet_address；
- smart_contract；
- stripe_merchant；
- card_descriptor；
- organization；
- unknown。

canonical_merchant_id 由用户或 scenario fixture 显式提供。V0.1 不自动合并相似域名、相似名称或 provider metadata。

### 9.3 Quote

Quote 必须是一等对象，用来判断 amount drift。

字段：

- quote_id；
- merchant_id；
- quoted_amount；
- quoted_currency；
- quoted_at；
- expires_at；
- item_description；
- final_amount；
- drift_amount；
- drift_percentage。

### 9.4 Payment Request

字段：

- request_id；
- task_id；
- session_id；
- idempotency_key；
- original_request_id；
- retry_count；
- previous_decision_id；
- provider_request_id；
- provider_transaction_reference；
- merchant_order_id；
- payment_session_id；
- quote_id；
- price_quote_expires_at；
- agent_id；
- merchant；
- amount；
- currency；
- token；
- chain；
- purpose；
- tool_source；
- provider；
- created_at；
- metadata。

idempotency_key、retry_count、original_request_id、previous_decision_id 是核心字段，不是后续增强。

### 9.5 State / History

部分规则不是单次 request 能判断的，必须显式传入 history。

字段：

- task_id；
- session_id；
- prior_requests；
- prior_decisions；
- prior_receipts；
- total_amount_spent；
- payment_count_for_task；
- used_idempotency_keys。

V0.1 不维护生产 ledger。CLI 只读取本地 history fixture，并在 receipt 中记录它使用了哪些历史字段。

### 9.6 Scenario

字段：

- scenario_id；
- title；
- description；
- category；
- risk_represented；
- policy；
- merchant；
- quote；
- payment_request；
- history；
- expected_decision；
- expected_reason_codes；
- advisory_expectations。

每个 scenario 必须说明：

- 它验证了哪个真实 payment failure；
- 为什么自研脚本容易漏掉它；
- 期望 decision 和 reason_codes；
- 是否需要 history；
- 是否只产生 advisory warning。

### 9.7 Receipt

Receipt 是 Gauntlet 的核心输出。

字段：

- receipt_id；
- trace_id；
- scenario_id；
- timestamp；
- policy_snapshot；
- merchant_snapshot；
- quote_snapshot；
- payment_request_snapshot；
- decision；
- reason_codes；
- advisory_warnings；
- evaluation_trace；
- redaction_policy；
- redacted_fields；
- simulator_version。

默认 receipt 必须 redacted。可能包含用户 intent、订单号、provider reference、wallet address、API endpoint 的字段默认脱敏。

用户可以在本地通过显式参数生成 unredacted receipt，但 CLI 输出必须清楚提示不适合提交到公开 repo。

### 9.8 Evaluation Trace

Trace 需要结构化，不能只是字符串日志。

字段：

- evaluated_rules；
- rule_id；
- rule_version；
- input_fields_used；
- operator；
- expected_value；
- actual_value；
- result；
- severity；
- decision_contribution。

Replay debugger 未来能否成立，取决于 V0.1 是否从一开始保存正确 trace。

## 10. 内置 Failure Scenarios

V0.1 不以 scenario 数量取胜，而以场景质量取胜。

### 10.1 Must-have Scenarios

第一版必须内置 8 个高质量 scenarios：

1. valid MCP paid tool payment request；
2. amount exceeds single payment limit；
3. cumulative budget exceeded with history；
4. blocked merchant；
5. wrong token or currency；
6. quote expired；
7. amount drift above threshold；
8. duplicate idempotency key with history。

这些 scenarios 都必须有完整 fixture、expected_decision、expected_reason_codes、receipt 示例和 markdown report 示例。

### 10.2 Backlog Scenarios

以下 12 个场景进入 backlog，按用户访谈和真实 demo 反馈排序：

1. unknown merchant；
2. wrong chain；
3. expired policy；
4. retry without original_request_id；
5. repeated payment within same task；
6. missing idempotency key；
7. missing quote_id；
8. requires review above threshold；
9. merchant domain mismatch；
10. MCP tool asks for payment outside allowed tool；
11. prompt injection attempts to change merchant；
12. suspicious tool response asks agent to ignore payment policy。

其中 prompt injection 和 suspicious tool response 默认只输出 advisory warning，不直接作为强 policy_failed，除非用户显式开启 heuristic enforcement。

### 10.3 Scenario Quality Bar

一个 scenario 只有同时满足以下条件，才算进入内置库：

- 能映射到一个真实或高可信 payment failure；
- fixture 可以在本地重复运行；
- expected_decision 稳定；
- reason_codes 可解释；
- receipt 能帮助开发者定位问题；
- 不依赖真实资金、真实 provider 或远程服务。

## 11. CLI 体验

### 11.1 初始化

```
gauntlet init
```

生成：

```
gauntlet/
  policy.yaml
  merchants.json
  quotes.json
  history.json
  requests/
    valid-payment.json
    amount-drift.json
  scenarios/
    amount-drift.yaml
    duplicate-retry.yaml
  receipts/
```

### 11.2 运行

```
gauntlet run
gauntlet run --scenario amount-drift
gauntlet run --request ./requests/payment_request.json
gauntlet run --request ./requests/payment_request.json --history ./history.json
gauntlet run --ci
```

### 11.3 输出

CLI summary：

```
Gauntlet run complete

Scenarios: 8
Policy passed: 1
Policy failed: 6
Requires review: 0
Invalid input: 1
Advisory warnings: 0

High signal failures:
- amount-drift: final_amount exceeded quote by 42%
- duplicate-idempotency-key: idempotency_key already used in task history
- quote-expired: quote expired before payment request was created
```

生成：

- receipt.json；
- report.md；
- optional junit-style output for CI。
 
默认 receipt 为 redacted。开发者必须显式传入 --unredacted 才能生成完整 snapshot。

## 12. One Example Integration

V0.1 只选择一个 example integration。

第一版固定选择：MCP paid tool。

理由：

- 更贴近 agent tool-use 场景；
- 比完整 x402 更容易模拟；
- 更容易展示 prompt/tool response 与 payment request 的关系；
- 可以后续扩展到 paid API。

示例 flow：

1. agent 想调用一个 paid MCP tool；
2. tool 返回 price quote；
3. agent 生成 payment request；
4. Gauntlet 检查 policy；
5. 如果 policy_passed，demo 继续模拟 tool access；
6. 如果 policy_failed / requires_review，demo 展示 receipt。

x402-like paid API 不进入 V0.1 主示例。它可以作为后续 adapter 研究对象，但不能影响 V0.1 的 MCP paid tool demo 交付。

## 13. 竞争与替代方案

### 13.1 Payment Provider Built-ins

Coinbase、Circle、Cobo、Crossmint、Stripe 等 provider 未来可能内置 budget、approval、receipt、policy。

Gauntlet 的差异化：

- provider-agnostic；
- failure scenario first；
- local dev / CI friendly；
- 不要求接入真实 provider；
- 可作为多个 provider 前的测试层。

### 13.2 通用 Policy Engine

OPA、AWS Cedar、Permit.io、OpenFGA 等可以表达规则。

Gauntlet 的差异化：

- 不只是规则引擎；
- 内置 agent payment domain model；
- 内置 payment-specific scenarios；
- 内置 quote/idempotency/merchant matching fixture；
- 输出 payment receipt，而不是通用授权结果。

### 13.3 AI Eval / Agent Testing Tools

Langfuse、Braintrust、Guardrails、agent eval tools 可能覆盖 prompt injection、tool-use eval。

Gauntlet 的差异化：

- 聚焦 agent spending；
- deterministic payment rules 优先；
- payment request / quote / merchant / idempotency 是一等对象；
- 不把安全判断完全交给 LLM。

### 13.4 Spend Management / Virtual Card Controls

Ramp、Brex、Stripe Issuing、Airwallex 等可能做 agent 支出控制。

Gauntlet 的差异化：

- 面向开发阶段；
- 不依赖真实卡和企业财务系统；
- 可用于 paid API / MCP tool / crypto / wallet 场景；
- 输出 developer debugging receipt。

### 13.5 自研脚本

最强替代方案是目标用户自己写脚本。

Gauntlet 必须证明：

- 8 个 must-have scenarios 比自己写更可靠；
- receipt schema 比自己打日志更好；
- CI integration 更省时间；
- merchant / quote / idempotency 模型帮用户少踩坑；
- 后续 scenario library 持续更新。

### 13.6 竞争验证问题

用户访谈必须验证：

- 如果他们现在用自研脚本，脚本覆盖了哪些 failure cases，漏掉哪些；
- 如果他们现在用通用测试框架，是否愿意引入 payment-specific fixture；
- 如果他们现在用 provider SDK，provider 是否提供 agent payment failure suite；
- receipt 是否比现有日志更有用；
- CI 失败信号是否足够清楚，还是只会增加噪音；
- MCP paid tool demo 是否比 x402-like paid API 更容易触发真实使用。

## 14. 护城河假设

V0.1 的护城河不是代码复杂度，而是 domain-specific accumulation。

潜在护城河：

- 高质量 agent payment failure scenarios；
- 真实事故案例沉淀；
- provider-agnostic receipt schema；
- merchant matching fixtures；
- idempotency / retry test fixtures；
- CI/CD integration；
- 开源社区贡献；
- service review 中沉淀的 custom scenarios。

如果无法积累真实 scenarios，Gauntlet 很容易被看成普通规则测试工具。

## 15. 商业化顺序

当前阶段不采用 “CLI free -> SaaS pro/team/enterprise” 作为默认路径。

更现实的顺序：

### Stage 1: Open-source Adoption

目标：

- 有人愿意接入；
- 有人愿意贡献 scenario；
- 有人愿意在 demo / hackathon / paid API 中使用；
- 有团队因为 Gauntlet 发现真实问题。

### Stage 2: Service Revenue

服务对象：

- agent payment startup；
- paid API builder；
- MCP paid tool builder；
- wallet infra demo team。

服务内容：

- agent payment policy review；
- custom scenario pack；
- provider integration；
- demo hardening；
- policy architecture review。

这不是低级咨询，而是用服务换真实场景和付费信号。

### Stage 3: Hosted Receipts / Replay

只有当用户在 production-like 环境里持续生成 receipts，hosted API 和 console 才有意义。

收费点：

- hosted receipt ledger；
- replay debugger；
- team sharing；
- CI history；
- private scenario packs；
- provider adapters；
- retention / export。

## 16. 4-6 周验证计划

这不是随意试水，而是立项前强验证。

### 16.1 用户访谈

访谈 20 个目标用户：

- 8 个 MCP paid tool / agent tool-use payment demo builder；
- 4 个 paid API / x402-like demo builder；
- 3 个 agent wallet / payment infra builder；
- 3 个 agent app builder；
- 2 个 DevRel / hackathon demo builder。

访谈不问“你会不会用”，而是获取：

- 他们是否有真实 payment flow；
- 他们现在如何测试 agent payment；
- 是否遇到 duplicate、amount drift、merchant mismatch、expired mandate；
- 是否愿意提供 demo flow；
- 是否愿意把 Gauntlet 放进 CI 或 repo；
- 如果只给 8 个高质量 scenarios，是否足以替代他们的第一版自研脚本。

### 16.2 真实 Demo Flow

找到 5 个真实或半真实 demo flow：

- 至少 3 个来自 MCP paid tool / agent tool-use payment demo；
- 至少 2 个愿意接入 CLI；
- 至少 1 个愿意在 GitHub repo / demo 中公开使用；
- 至少 1 个愿意为 custom scenario / safety review 付费或签 LOI。

### 16.3 Failure Case 验证

验证至少 5 个高频 failure case：

- amount drift；
- duplicate retry；
- merchant mismatch；
- expired mandate；
- missing idempotency key；
- quote expired；
- tool / prompt injection 诱导付款；
- history-dependent budget / duplicate 判断。

### 16.4 Receipt Schema 验证

验证：

- 用户是否愿意保存 receipt；
- 是否愿意展示 receipt 给终端用户或团队；
- receipt 是否真的帮助 debug；
- trace 字段是否足够；
- 默认 redaction 是否保留了足够 debug 信息；
- 用户是否需要本地 unredacted receipt。

### 16.5 集成成本验证

硬目标：

- 5 分钟跑通内置 demo；
- 15 分钟理解 policy；
- 30 分钟接入一个 demo flow；
- 比用户自己写规则更快。

### 16.6 停止或转向条件

如果出现以下情况，应停止推进 Hosted Receipts / Replay，并重新判断 wedge：

- 20 个访谈中少于 5 个有真实或半真实 agent payment flow；
- MCP paid tool builder 对该问题兴趣弱于 paid API / wallet infra builder；
- 外部开发者平均超过 60 分钟仍不能跑通 demo flow；
- 用户只想复制 example code，不愿意引入 CLI；
- receipt 没有明显优于普通日志；
- CI failure 被认为噪音大于价值；
- 没有任何用户愿意提供自有 scenario 或 history fixture。

## 17. 继续推进门槛

进入下一阶段前，需要满足以下硬门槛中的大多数，且前两项必须满足：

- 至少 3 个外部开发者完成接入；
- 至少 1 个非朋友用户主动提出 scenario；
- 至少 1 个团队愿意为集成支持付费；
- GitHub repo 有真实 issue / PR；
- 8 个 must-have scenarios 中至少 5 个被用户认为真实有用；
- 用户明确说：这个东西我自己写很麻烦，愿意继续用；
- 至少 1 个真实 flow 中发现了原本没注意到的问题。

如果达不到这些，不进入 Hosted Receipts / Replay。

如果只满足 open-source curiosity，但没有接入、scenario、付费支持或真实问题发现，应转向 developer education / scenario library，而不是继续做 hosted product。

## 18. 风险

### 18.1 ICP 购买动机不成立

Infra builder 可能自己做这层。

应对：

- 第一阶段不依赖它们付费；
- 用它们验证 scenarios；
- 通过服务项目找真实集成。

### 18.2 市场过早

有兴趣的人不付费，能付费的人没需求。

应对：

- open-source adoption 优先；
- service revenue 作为中间路径；
- 不过早建设 SaaS。

### 18.3 技术判断被高估

Intent / purpose / prompt injection 不能简单 deterministic。

应对：

- deterministic rules 和 advisory checks 分层；
- 不把 heuristic 输出包装成强安全判断。

### 18.4 责任边界混乱

用户可能把 policy_passed 理解成“安全”。

应对：

- 不使用 safe/unsafe；
- 不使用 approved/rejected；
- 所有输出都围绕 configured policy；
- 文档明确 Gauntlet 不提供资金安全保证。

### 18.5 自研脚本替代

早期团队可能自己写。

应对：

- scenarios 足够强；
- receipt 足够好；
- idempotency / quote / merchant 模型足够专业；
- CI integration 足够省事。

### 18.6 V0.1 范围膨胀

merchant identity、history、receipt、CI、MCP demo 都可能继续扩大。

应对：

- 第一版只做 MCP paid tool；
- 只承诺 8 个 must-have scenarios；
- merchant 只做 fixture matching；
- history 只做本地 fixture；
- 不做 runtime preflight API。

### 18.7 Receipt 泄露敏感信息

receipt 可能包含订单号、provider reference、wallet address、用户 intent、tool source。

应对：

- 默认 redacted receipt；
- 明确 redacted_fields；
- --unredacted 需要显式开启；
- README 提醒不要把 unredacted receipt 提交到公开 repo。

## 19. 第一阶段交付物

### Week 1: Core Model

- policy schema；
- merchant schema；
- quote schema；
- payment request schema；
- history schema；
- receipt schema；
- redaction policy；
- evaluation trace schema。

### Week 2: Rule Engine & CLI

- deterministic rules；
- CLI init；
- CLI run；
- summary output；
- receipt output；
- CI exit code。

### Week 3: Scenario Library

- 8 个 must-have scenarios；
- 12 个 backlog scenarios；
- scenario authoring guide；
- markdown report；
- CI mode。

### Week 4: Example Integration

- MCP paid tool example；
- quickstart；
- GitHub repo；
- demo video；
- initial outreach。

### Week 5-6: External Validation

- 20 个访谈；
- 5 个 demo flow；
- 2-3 个外部接入；
- scenario feedback；
- commercial signal review；
- next-stage decision。

## 20. 成功指标

### Usage

- CLI run 次数；
- custom policy 数；
- custom scenario 数；
- receipt 生成数；
- CI usage；
- example integration clone / fork；
- 5 分钟内跑通 demo 的比例；
- 30 分钟内接入 demo flow 的比例。

### Adoption

- GitHub stars；
- issues；
- PRs；
- external scenario submissions；
- public demos using Gauntlet；
- relevant developer mentions；
- 外部 history fixture 贡献数。

### Value

- 发现真实问题的次数；
- 用户认为真实有用的 scenarios 数；
- 比自研脚本节省的时间；
- 用户是否愿意继续使用；
- 是否愿意付费做 custom scenario / integration；
- receipt 是否帮助定位问题；
- CI failure 是否被认为清楚且有行动价值。

## 21. 后续升级路径

如果 V0.1 成立，路线如下：

### V0.2: Agent Payment Preflight API

- SDK；
- local preflight function；
- webhook mode；
- x402-like adapter；
- MCP paid tool adapter。

### V0.3: Receipt & Replay Layer

- hosted receipt storage；
- replay view；
- decision timeline；
- policy diff；
- redaction。

### V1.0: Agent Payment Preflight & Receipt Infrastructure

- hosted API；
- team workspace；
- provider adapters；
- CI history；
- private scenarios；
- paid plans。

只有到这个阶段，才适合更谨慎地使用 “Agent Payment Safety Infrastructure” 叙事。

## 22. Out of Scope

第一阶段明确不做：

- 真实资金结算；
- 钱包托管；
- 私钥管理；
- 发卡；
- KYC / AML；
- merchant reputation network；
- risk scoring；
- full replay dashboard；
- team console；
- runtime enforcement；
- production ledger；
- automatic merchant canonicalization；
- merchant verification service；
- compliance export；
- legal safety guarantee；
- full AP2 / x402 compatibility claim。

## 23. 参考来源

- Google AP2: [https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)
- AP2 official docs: [https://ap2-protocol.org/](https://ap2-protocol.org/)
- Coinbase x402 docs: [https://docs.cdp.coinbase.com/x402/welcome](https://docs.cdp.coinbase.com/x402/welcome)
- x402 ecosystem: [https://www.x402.org/ecosystem](https://www.x402.org/ecosystem)
- Circle Agent Stack: [https://www.circle.com/blog/introducing-circle-agent-stack-financial-infrastructure-for-the-agentic-economy](https://www.circle.com/blog/introducing-circle-agent-stack-financial-infrastructure-for-the-agentic-economy)
- Cobo Agentic Wallet: [https://github.com/CoboGlobal/cobo-agentic-wallet/](https://github.com/CoboGlobal/cobo-agentic-wallet/)
- 本地报告：Agentic Payment Wallet and Infrastructure: 深度市场调研报告
- 本地 PDF：Agent Wallets 竞争格局与功能分析，2026-05-28
