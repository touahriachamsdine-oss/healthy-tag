/**
 * Dashboard Map Data API
 * GET /api/dashboard/map
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { MapMarker } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Build filter based on user role
        const deviceFilter: Prisma.DeviceWhereInput = {
            latitude: { not: null },
            longitude: { not: null },
        };

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
            },
        });

        const markers: MapMarker[] = devices
            .filter(d => d.latitude !== null && d.longitude !== null)
            .map(device => ({
                id: device.id,
                deviceId: device.deviceId,
                lat: device.latitude!,
                lng: device.longitude!,
                status: device.healthStatus,
                type: device.type,
                temp: device.lastTempValue,
                humidity: device.lastHumidityValue,
                facilityName: device.facility?.name || null,
                wilayaName: device.wilaya.name,
                baladiyaName: device.baladiya.name,
            }));

        return NextResponse.json({
            success: true,
            data: markers,
        });

    } catch (error) {
        console.error('Map data error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
