const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiEmbedding = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

async function run() {
    const entries = await prisma.entry.findMany({});
    console.log(`Found ${entries.length} entries to backfill.`);

    for (const entry of entries) {
        console.log(`Generating embedding for: ${entry.errorText.substring(0, 30)}...`);
        try {
            const result = await geminiEmbedding.embedContent(entry.errorText);
            const embedding = result.embedding.values;

            await prisma.entry.update({
                where: { id: entry.id },
                data: { embedding: embedding }
            });
            console.log(`Updated entry ${entry.id}`);
        } catch (e) {
            console.error(`Failed to generate embedding for ${entry.id}:`, e.message);
        }
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
    }
    console.log('Backfill complete!');
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
