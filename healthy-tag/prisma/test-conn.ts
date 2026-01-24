import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Testing connection with adapter...');
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database!');
        const count = await prisma.wilaya.count();
        console.log('Wilaya count:', count);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
