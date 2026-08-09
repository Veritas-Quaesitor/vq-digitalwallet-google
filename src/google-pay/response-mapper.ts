import { isNullOrEmpty } from '../core/config.js';

/** Validates whether a string round-trips cleanly through atob/btoa as Base64. */
export function isValidBase64(str: string): boolean {
  if (isNullOrEmpty(str)) return false;
  try {
    const decoded = atob(str);
    return btoa(decoded) === str;
  } catch {
    return false;
  }
}

/** Normalizes a raw Google Pay token to a JSON string, regardless of input shape. */
export function normalizeGooglePayToken(rawToken: unknown): string {
  const jsonString = typeof rawToken === 'string' ? rawToken : JSON.stringify(rawToken);
  return jsonString.startsWith('"') ? jsonString : JSON.stringify(jsonString);
}

/**
 * Encodes a string to Base64. This is an encoding for safe transport, not
 * encryption — it provides no confidentiality. Always verify the resulting
 * token server-side.
 * @throws {Error} When encoding fails.
 */
export function encodePayloadToBase64(tokenizationData: string): string {
  if (!tokenizationData) {
    throw new Error('Invalid tokenization data');
  }
  try {
    return btoa(tokenizationData);
  } catch (error) {
    throw new Error('Failed to encode tokenization data: ' + (error as Error).message);
  }
}

/**
 * Decodes a Base64 payload back to a parsed JSON object.
 * @throws {Error} When decoding fails or the payload is invalid.
 */
export function decodePayloadFromBase64(base64EncodedPayload: string): unknown {
  if (!base64EncodedPayload || !isValidBase64(base64EncodedPayload)) {
    throw new Error('Invalid base64 encoded payload');
  }
  try {
    const decodedString = atob(base64EncodedPayload);
    return JSON.parse(decodedString);
  } catch (error) {
    throw new Error('Failed to decode base64 payload: ' + (error as Error).message);
  }
}
