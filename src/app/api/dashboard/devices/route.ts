/**
 * Dashboard Devices List API
 * GET /api/dashboard/devices
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Build filter based on user role
        const deviceFilter: Prisma.DeviceWhereInput = {};

        if (user.role === 'WILAYA_ADMIN' && user.wilayaId) {
            deviceFilter.wilayaId = user.wilayaId;
        } else if (user.role === 'BALADIYA_ADMIN' && user.baladiyaId) {
            deviceFilter.baladiyaId = user.baladiyaId;
        }

        const devices = await prisma.device.findMany({
            where: deviceFilter,
            include: {
                facility: { select: { name: true } },
                wilaya: { select: { name: true } },
                baladiya: { select: { name: true } },
                _count: {
                    select: { alerts: { where: { status: 'ACTIVE' } } }
                }
            },
            orderBy: { lastSeenAt: 'desc' },
            take: limit,
        });

        return NextResponse.json({
            success: true,
            data: devices,
        });

    } catch (error) {
        console.error('Dashboard devices error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
