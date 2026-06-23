import type { Decision } from "../index.js";

export type MerchantType =
  | "domain"
  | "api_endpoint"
  | "mcp_server"
  | "wallet_address"
  | "smart_contract"
  | "stripe_merchant"
  | "card_descriptor"
  | "organization"
  | "unknown";

export interface Policy {
  policy_id: string;
  version: number;
  agent_id: string;
  max_amount_per_payment: number;
  max_total_budget: number;
  budget_window: "task";
  currency: string;
  chain?: string;
  allowed_merchants: string[];
  blocked_merchants: string[];
  requires_review_above: number;
  expires_at: string;
  max_payments_per_task: number;
  max_quote_drift_percentage: number;
  required_metadata: string[];
}

export interface Merchant {
  merchant_id: string;
  canonical_merchant_id: string;
  merchant_type: MerchantType;
  merchant_domain?: string;
  merchant_wallet_address?: string;
  merchant_provider_id?: string;
  merchant_display_name?: string;
}

export interface Quote {
  quote_id: string;
  merchant_id: string;
  quoted_amount: number;
  quoted_currency: string;
  quoted_at: string;
  expires_at: string;
  item_description: string;
  final_amount: number;
  drift_amount: number;
  drift_percentage: number;
}

export interface PaymentRequest {
  request_id: string;
  task_id: string;
  session_id: string;
  idempotency_key: string;
  original_request_id?: string;
  retry_count: number;
  previous_decision_id?: string;
  provider_request_id?: string;
  provider_transaction_reference?: string;
  merchant_order_id?: string;
  payment_session_id?: string;
  quote_id: string;
  price_quote_expires_at?: string;
  agent_id: string;
  merchant: Merchant;
  amount: number;
  currency: string;
  token?: string;
  chain?: string;
  purpose?: string;
  tool_source?: string;
  provider?: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface History {
  task_id: string;
  session_id: string;
  prior_requests: PaymentRequest[];
  prior_decisions: Decision[];
  prior_receipts: string[];
  total_amount_spent: number;
  payment_count_for_task: number;
  used_idempotency_keys: string[];
}

