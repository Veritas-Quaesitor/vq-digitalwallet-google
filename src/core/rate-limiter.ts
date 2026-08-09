const MAX_REQUESTS_PER_SECOND = 3;
const REQUEST_COOLDOWN = 1000;

/** Per-instance client-side rate limiting (UX safeguard, not a security control). */
export class RateLimiter {
  private requestCount = 0;
  private lastRequestTime = 0;

  /** @throws {Error} When the rate limit is exceeded. */
  check(): void {
    const now = Date.now();
    if (now - this.lastRequestTime < REQUEST_COOLDOWN) {
      this.requestCount++;
      if (this.requestCount > MAX_REQUESTS_PER_SECOND) {
        throw new Error('Too many payment requests. Please wait before trying again.');
      }
    } else {
      this.requestCount = 1;
    }
    this.lastRequestTime = now;
  }

  reset(): void {
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }
}
