const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const user = await prisma.user.findUnique({ where: { email: 'dev@debugdiary.com' } });
    if (!user) {
        console.log('No user dev@debugdiary.com found.');
        return;
    }

    const entries = await prisma.entry.findMany({ where: { userId: user.id } });
    console.log('Total entries:', entries.length);

    let withEmbeddings = 0;
    for (const entry of entries) {
        if (entry.embedding !== null && Array.isArray(entry.embedding) && entry.embedding.length > 0) {
            withEmbeddings++;
        } else {
            console.log(`Entry ${entry.id} missing embedding.`);
        }
    }
    console.log('Entries with valid array embeddings:', withEmbeddings);
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
