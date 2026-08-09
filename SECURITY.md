# Security Policy

The current `1.x` browser SDK line receives security and Google Pay compatibility fixes.

Report vulnerabilities through [GitHub private vulnerability reporting](https://github.com/Veritas-Quaesitor/vq-digitalwallet-google/security/advisories/new). Include only the SDK version, hosted script URL, error message, redacted reproduction steps, browser/OS versions, affected lifecycle stage, and impact.

Never submit Google Pay tokens, merchant credentials, gateway merchant IDs, authorization headers, cookies, backend responses, or customer payment details.

## What this SDK does and does not protect against

- **Base64 is an encoding, not encryption.** The payment token returned by `requestPayment` is Base64-encoded for safe transport, not confidential. Treat it accordingly and always verify it server-side before authorizing a charge.
- **Rate limiting is a client-side UX safeguard**, not a security control. It can be bypassed by any client that doesn't run this SDK. Enforce independent server-side rate limiting on your token-processing endpoint.
- **The Google Pay script (`https://pay.google.com/gp/p/js/pay.js`) is loaded without Subresource Integrity pinning.** Google does not publish a versioned URL or stable content hash for this script — it is served live and updated server-side, unlike Apple's versioned CDN path used by the sibling Apple Pay SDK. This SDK trusts Google's own infrastructure for that script's integrity.
- This browser SDK does not own merchant credential storage, gateway authorization, capture, refund, settlement, backend idempotency, replay prevention, or production rate limiting. Those controls remain server-side merchant responsibilities.
