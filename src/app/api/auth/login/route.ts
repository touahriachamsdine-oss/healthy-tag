/**
 * Authentication API - Login endpoint
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    console.log('Login attempt started');
    try {
        const body = await request.json();
        const { email, password } = body;
        console.log(`Login attempt for email: ${email}`);

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                wilaya: true,
                baladiya: true,
            },
        });

        if (!user) {
            console.log(`User not found: ${email}`);
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { success: false, error: 'Account is deactivated' },
                { status: 403 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create session
        console.log('Creating session for user:', user.id);
        const token = await createSession(user.id);
        console.log('Session token created successfully');

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        // Log audit event
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                entityType: 'User',
                entityId: user.id,
                ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
                userAgent: request.headers.get('user-agent'),
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                wilaya: user.wilaya?.name,
                baladiya: user.baladiya?.name,
            },
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: `Server error: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
