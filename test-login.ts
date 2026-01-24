
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function testLogin() {
    const email = 'super@admin.com';
    const password = 'pass';

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isValid);

        if (isValid) {
            const token = await new SignJWT({
                userId: user.id,
                email: user.email,
                role: user.role,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('24h')
                .sign(JWT_SECRET);

            console.log('Token generated:', !!token);

            await prisma.session.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                },
            });
            console.log('Session created in DB');
        }
        process.exit(0);
    } catch (error) {
        console.error('Login simulation failed:', error);
        process.exit(1);
    }
}

testLogin();
