import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY!
)

export const geminiFlash = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash'
})

export const geminiEmbedding = genAI.getGenerativeModel({
    model: 'gemini-embedding-001'
})

// Helper for retrying API calls due to rate limits (429)
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn()
    } catch (e: any) {
        if (retries > 0 && e?.status === 429) {
            console.log(`Rate limit hit. Retrying in ${delay}ms...`)
            await new Promise(r => setTimeout(r, delay))
            return withRetry(fn, retries - 1, delay * 2)
        }
        throw e
    }
}

// Enrichment function
export async function enrichEntry(
    errorText: string,
    fixText: string,
    codeSnippet?: string
) {
    const prompt = `
You are analyzing a developer's bug fix entry.
Return ONLY valid JSON, no markdown, no explanation.

Error: ${errorText}
Fix: ${fixText}
${codeSnippet ? `Code: ${codeSnippet}` : ''}

Return this exact JSON shape:
{
  "summary": "one clear sentence describing the bug",
  "whyItHappens": "2-3 sentence explanation of root cause",
  "language": "javascript|python|typescript|java|go|rust|other",
  "framework": "react|express|nextjs|django|none|other",
  "errorType": "TypeError|SyntaxError|CORS|404|Auth|Database|Config|Other",
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": "easy|medium|hard"
}
}
`
    const result = await withRetry(() => geminiFlash.generateContent(prompt))
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
}

// Embedding function for semantic search
export async function generateEmbedding(
    text: string
): Promise<number[]> {
    const result = await withRetry(() => geminiEmbedding.embedContent(text))
    return result.embedding.values
}

// Cosine similarity helper
export function cosineSimilarity(
    a: number[],
    b: number[]
): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dot / (magA * magB)
}

// Aliases for explicit retry wrappers
export const enrichWithRetry = enrichEntry
export const embedWithRetry = generateEmbedding

// Analyze file context to generate before/after code diffs
export async function analyzeFileContext(
    fileContent: string,
    filePath: string,
    errorText: string,
    stackTrace: string
): Promise<{
    beforeCode: string
    afterCode: string
    explanation: string
    lineNumber: number | null
} | null> {
    try {
        const prompt = `
You are analyzing a JavaScript/TypeScript file that caused an error.

FILE PATH: ${filePath}

FILE CONTENT:
\`\`\`
${fileContent.substring(0, 3000)}
\`\`\`

ERROR: ${errorText}

STACK TRACE:
${stackTrace?.substring(0, 500)}

Respond ONLY with valid JSON, no markdown:
{
  "beforeCode": "the problematic code snippet (5-15 lines around the error)",
  "afterCode": "the fixed version of that same code snippet",
  "explanation": "one sentence explaining what was wrong and what changed",
  "lineNumber": the line number where error occurs or null
}
`
        const result = await withRetry(() => geminiFlash.generateContent(prompt))
        const text = result.response.text()

        const clean = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim()

        return JSON.parse(clean)

    } catch (err) {
        console.error('[DebugDiary] File analysis failed:', err)
        return null
    }
}
