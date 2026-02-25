const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const geminiEmbedding = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

async function withRetry(fn, retries = 3, delay = 2000) {
    try {
        return await fn();
    } catch (e) {
        if (retries > 0 && e?.status === 429) {
            console.log(`Rate limit hit. Retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw e;
    }
}

async function enrichEntry(errorText, fixText, codeSnippet) {
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
`;
    const result = await withRetry(() => geminiFlash.generateContent(prompt));
    const clean = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
}

async function run() {
    const entries = await prisma.entry.findMany({ where: { aiEnriched: false } });
    console.log(`Found ${entries.length} stuck entries.`);

    for (const entry of entries) {
        console.log(`Processing entry: ${entry.id}`);
        try {
            const enriched = await enrichEntry(entry.errorText, entry.fixText, entry.codeSnippet);
            const embedRes = await withRetry(() => geminiEmbedding.embedContent(entry.errorText + ' ' + entry.fixText));
            const embedding = embedRes.embedding.values;

            await prisma.entry.update({
                where: { id: entry.id },
                data: {
                    ...enriched,
                    embedding: embedding,
                    aiEnriched: true
                }
            });
            console.log(`Successfully enriched ${entry.id}`);
        } catch (e) {
            console.error(`Failed to process ${entry.id}:`, e.message || e);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
