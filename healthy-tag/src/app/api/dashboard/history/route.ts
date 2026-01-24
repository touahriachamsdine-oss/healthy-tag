/**
 * Dashboard History Data API
 * GET /api/dashboard/history
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
        const deviceId = searchParams.get('deviceId');
        const period = searchParams.get('period') || '24h'; // 24h, 7d, 30d

        // Build filter
        const deviceFilter: Prisma.DeviceWhereInput = {};
        if (user.role === 'WILAYA_ADMIN' && user.wilayaId) {
            deviceFilter.wilayaId = user.wilayaId;
        } else if (user.role === 'BALADIYA_ADMIN' && user.baladiyaId) {
            deviceFilter.baladiyaId = user.baladiyaId;
        }

        const timeFilter = new Date();
        if (period === '7d') {
            timeFilter.setDate(timeFilter.getDate() - 7);
        } else if (period === '30d') {
            timeFilter.setDate(timeFilter.getDate() - 30);
        } else {
            timeFilter.setHours(timeFilter.getHours() - 24);
        }

        // Get readings
        const readings = await prisma.deviceReading.findMany({
            where: {
                serverTimestamp: { gte: timeFilter },
                device: deviceId ? { id: deviceId, ...deviceFilter } : deviceFilter,
            },
            orderBy: { serverTimestamp: 'asc' },
            select: {
                temperature: true,
                humidity: true,
                serverTimestamp: true,
            },
        });

        // Group/sample readings to avoid too many points
        // For 24h, we want maybe 24-48 points
        const sampledReadings = readings.filter((_, index) => {
            if (period === '24h') return index % 4 === 0; // Every hour if reading every 15m
            if (period === '7d') return index % 12 === 0;
            return index % 48 === 0;
        });

        const labels = sampledReadings.map(r =>
            new Date(r.serverTimestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                ...(period !== '24h' ? { month: 'short', day: 'numeric' } : {})
            })
        );
        const temperatures = sampledReadings.map(r => r.temperature);
        const humidity = sampledReadings.map(r => r.humidity);

        return NextResponse.json({
            success: true,
            data: {
                labels,
                temperatures,
                humidity,
            },
        });

    } catch (error) {
        console.error('History data error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
