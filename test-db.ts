
import { prisma } from './src/lib/prisma';

async function test() {
    try {
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
        const superAdmin = await prisma.user.findUnique({
            where: { email: 'super@admin.com' }
        });
        console.log('Super admin found:', !!superAdmin);
        process.exit(0);
    } catch (error) {
        console.error('Database connection test failed:', error);
        process.exit(1);
    }
}

test();
