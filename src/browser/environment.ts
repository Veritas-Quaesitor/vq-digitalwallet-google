/** @throws {Error} When required browser APIs are not supported. */
export function validateBrowserSupport(): void {
  if (typeof btoa === 'undefined') {
    throw new Error('Base64 encoding not supported in this browser');
  }
  if (typeof Promise === 'undefined') {
    throw new Error('Promise support required');
  }
  if (typeof JSON === 'undefined') {
    throw new Error('JSON support required');
  }
}
