export interface RedactionResult<T> {
  snapshot: T;
  redactedFields: string[];
}

const SENSITIVE_KEYS = new Set([
  "provider_transaction_reference",
  "merchant_order_id",
  "provider_request_id",
  "payment_session_id",
  "merchant_wallet_address",
  "purpose"
]);

const SENSITIVE_KEY_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /access[_-]?token/i,
  /bearer[_-]?token/i
];

export function redactSnapshot<T>(value: T): RedactionResult<T> {
  const redactedFields: string[] = [];

  function visit(current: unknown, path: string[]): unknown {
    if (Array.isArray(current)) {
      return current.map((item, index) => visit(item, [...path, String(index)]));
    }

    if (current && typeof current === "object") {
      return Object.fromEntries(
        Object.entries(current).map(([key, child]) => {
          const nextPath = [...path, key];
          if (shouldRedact(key)) {
            redactedFields.push(nextPath.join("."));
            return [key, "[REDACTED]"];
          }
          return [key, visit(child, nextPath)];
        })
      );
    }

    return current;
  }

  return {
    snapshot: visit(value, []) as T,
    redactedFields
  };
}

function shouldRedact(key: string): boolean {
  return SENSITIVE_KEYS.has(key) || SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}
