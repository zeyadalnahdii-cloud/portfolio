const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 3

const hits = new Map<string, number[]>()

/**
 * Per-IP rate limiting (SRS C-03), in memory.
 *
 * The honest limitation: this counts within one server instance. On a
 * serverless platform each cold start begins with an empty map and concurrent
 * instances do not share one, so a determined sender can exceed the limit by
 * spreading requests. It raises the cost of casual abuse, which is what a
 * contact form on a personal site needs; it is not a defence against a
 * motivated attacker.
 *
 * A shared store would fix that and costs infrastructure this site does not
 * otherwise need. If the form is ever actually abused, that is the upgrade.
 */
export function rateLimit(ip: string, now = Date.now()): { allowed: boolean; retryAfter: number } {
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0] ?? now
    return { allowed: false, retryAfter: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) }
  }

  recent.push(now)
  hits.set(ip, recent)

  return { allowed: true, retryAfter: 0 }
}

/** Test seam: the map is module state and would otherwise leak between cases. */
export function resetRateLimit(): void {
  hits.clear()
}
