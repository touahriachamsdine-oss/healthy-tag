/**
 * Dashboard Statistics API
 * GET /api/dashboard/stats
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateComplianceRate } from '@/lib/health-logic';
import { HealthStatus, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Build filter based on user role
        const deviceFilter: Prisma.DeviceWhereInput = {};

        if (user.role === 'WILAYA_ADMIN' && user.wilayaId) {
            deviceFilter.wilayaId = user.wilayaId;
        } else if (user.role === 'BALADIYA_ADMIN' && user.baladiyaId) {
            deviceFilter.baladiyaId = user.baladiyaId;
        }
        // SUPER_ADMIN sees all

        // Get device counts by status
        const devices = await prisma.device.findMany({
            where: deviceFilter,
            select: { healthStatus: true },
        });

        const statusCounts = devices.reduce(
            (acc, device) => {
                acc[device.healthStatus] = (acc[device.healthStatus] || 0) + 1;
                return acc;
            },
            {} as Record<HealthStatus, number>
        );

        // Get active alerts count
        const activeAlerts = await prisma.alert.count({
            where: {
                status: 'ACTIVE',
                device: deviceFilter,
            },
        });

        // Calculate compliance rate
        const complianceRate = calculateComplianceRate(devices);

        // Get recent readings trend
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentReadings = await prisma.deviceReading.count({
            where: {
                serverTimestamp: { gte: oneDayAgo },
                device: deviceFilter,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                totalDevices: devices.length,
                healthyDevices: statusCounts['HEALTHY'] || 0,
                warningDevices: statusCounts['WARNING'] || 0,
                unhealthyDevices: statusCounts['NOT_HEALTHY'] || 0,
                offlineDevices: statusCounts['OFFLINE'] || 0,
                unknownDevices: statusCounts['UNKNOWN'] || 0,
                activeAlerts,
                complianceRate,
                readingsLast24h: recentReadings,
            },
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
