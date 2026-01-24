/**
 * Auth Status API
 * GET /api/auth/me
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const payload = await getCurrentUser();

        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                wilaya: { select: { name: true } },
                baladiya: { select: { name: true } },
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Session invalid' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                wilayaId: user.wilayaId,
                baladiyaId: user.baladiyaId,
                wilayaName: user.wilaya?.name,
                baladiyaName: user.baladiya?.name,
            },
        });

    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
