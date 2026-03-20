export const ASSUMPTIONS_LOG = [
  'Canonical revenue source defaults to PaymentLedgerTable (amount normalized from micro-USDC by DEFAULT_AMOUNT_DECIMALS).',
  'When AppSync event endpoint/api key are unavailable, live stream falls back to most recent normalized DynamoDB/API-derived events.',
  'Status normalization maps observed backend statuses into quote_created/payment_settled/upload_started/upload_confirmed/failed/unknown.',
  'Failure categories are heuristically mapped from status/reason text into auth/payment/upload/confirm/storage/validation/unknown.',
  'Trace inputs are wired to query functions; text-input submit interactions remain a small follow-up UX enhancement.',
]
