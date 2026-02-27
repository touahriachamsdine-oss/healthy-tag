/**
 * User Management API
 * POST /api/users
 * GET /api/users
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            include: {
                wilaya: { select: { name: true } },
                baladiya: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Remove passwords before sending
        const safeUsers = users.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });

        return NextResponse.json({ success: true, data: safeUsers });
    } catch (error) {
        console.error('Fetch users error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, password, firstName, lastName, role, wilayaId, baladiyaId } = body;

        if (!email || !password || !firstName || !lastName || !role) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName,
                lastName,
                role,
                wilayaId: wilayaId || null,
                baladiyaId: baladiyaId || null,
                isActive: true
            }
        });

        const { password: _, ...safeUser } = newUser;
        return NextResponse.json({ success: true, data: safeUser });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
