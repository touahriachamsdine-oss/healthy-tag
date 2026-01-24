import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    wilayaId?: string | null;
    baladiyaId?: string | null;
    iat: number;
    exp: number;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            wilayaId: true,
            baladiyaId: true,
        },
    });

    if (!user) throw new Error('User not found');

    const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        wilayaId: user.wilayaId,
        baladiyaId: user.baladiyaId,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

    // Store session in database
    await prisma.session.create({
        data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + SESSION_DURATION),
        },
    });

    // Update last login
    await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
    });

    return token;
}

export async function verifySession(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Verify session exists in database
        const session = await prisma.session.findFirst({
            where: {
                token,
                expiresAt: { gt: new Date() },
            },
        });

        if (!session) return null;

        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    return verifySession(token);
}

export async function logout(token: string): Promise<void> {
    await prisma.session.deleteMany({
        where: { token },
    });
}

// Role-based access control
export function canAccessWilaya(user: JWTPayload, wilayaId: string): boolean {
    if (user.role === 'SUPER_ADMIN') return true;
    if (user.role === 'WILAYA_ADMIN' && user.wilayaId === wilayaId) return true;
    return false;
}

export function canAccessBaladiya(user: JWTPayload, baladiyaId: string, wilayaId: string): boolean {
    if (user.role === 'SUPER_ADMIN') return true;
    if (user.role === 'WILAYA_ADMIN' && user.wilayaId === wilayaId) return true;
    if (user.role === 'BALADIYA_ADMIN' && user.baladiyaId === baladiyaId) return true;
    return false;
}

export function canManageUsers(user: JWTPayload, targetRole: UserRole): boolean {
    if (user.role === 'SUPER_ADMIN') return true;
    if (user.role === 'WILAYA_ADMIN' && targetRole === 'BALADIYA_ADMIN') return true;
    return false;
}
