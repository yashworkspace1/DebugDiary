// In-memory store for rate limiting.
// Resets when serverless function cold starts (every ~5 minutes on Vercel).
// Good enough for abuse prevention on the free tier.

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const errorHashStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
    apiKey: string,
    errorMessage: string
): { allowed: boolean; reason?: string } {
    const now = Date.now()
    const hourMs = 60 * 60 * 1000

    // --- Check total errors per hour per API key ---
    const keyLimit = rateLimitStore.get(apiKey)

    if (keyLimit) {
        if (now < keyLimit.resetAt) {
            if (keyLimit.count >= 100) {
                return {
                    allowed: false,
                    reason: 'Rate limit exceeded: 100 errors/hour per API key'
                }
            }
            keyLimit.count++
        } else {
            // Window has expired, reset
            rateLimitStore.set(apiKey, { count: 1, resetAt: now + hourMs })
        }
    } else {
        rateLimitStore.set(apiKey, { count: 1, resetAt: now + hourMs })
    }

    // --- Check identical errors per hour ---
    // Hash = apiKey + first 100 chars of error message
    const errorHash = apiKey + ':' + errorMessage.substring(0, 100)
    const hashLimit = errorHashStore.get(errorHash)

    if (hashLimit) {
        if (now < hashLimit.resetAt) {
            if (hashLimit.count >= 10) {
                return {
                    allowed: false,
                    reason: 'Duplicate error limit: 10 identical errors/hour'
                }
            }
            hashLimit.count++
        } else {
            errorHashStore.set(errorHash, { count: 1, resetAt: now + hourMs })
        }
    } else {
        errorHashStore.set(errorHash, { count: 1, resetAt: now + hourMs })
    }

    return { allowed: true }
}
