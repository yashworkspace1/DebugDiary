const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiEmbedding = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

async function run() {
    const user = await prisma.user.findUnique({ where: { email: 'dev@debugdiary.com' } });
    const entries = await prisma.entry.findMany({ where: { userId: user.id } });

    const entry = entries.find(e => e.embedding);
    if (entry) {
        console.log('Type of embedding:', typeof entry.embedding);
        console.log('Is Array?', Array.isArray(entry.embedding));
        if (Array.isArray(entry.embedding)) {
            console.log('Length:', entry.embedding.length);
            console.log('First element type:', typeof entry.embedding[0]);
            console.log('First element:', entry.embedding[0]);
        } else if (typeof entry.embedding === 'string') {
            console.log('It is a string! trying to parse...');
            try {
                const parsed = JSON.parse(entry.embedding);
                console.log('Parsed is array?', Array.isArray(parsed));
            } catch (e) { }
        } else {
            console.log('Value:', entry.embedding);
        }
    }
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
