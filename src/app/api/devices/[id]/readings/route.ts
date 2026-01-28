import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const searchParams = new URL(request.url).searchParams;
        const limit = parseInt(searchParams.get('limit') || '100');

        // Allow fetching by Serial Number (deviceId) or internal UUID
        const readings = await prisma.deviceReading.findMany({
            where: {
                OR: [
                    { deviceId: id }, // Match internal UUID
                    { device: { deviceId: id } } // Match Serial Number (HT-DZ-...)
                ]
            },
            orderBy: { deviceTimestamp: 'desc' },
            take: limit
        });

        return NextResponse.json({ success: true, data: readings });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let step = 'init';
    try {
        step = 'params';
        const { id } = await params;

        step = 'body_parse';
        const body = await request.json();
        const { temperature, humidity, lat, lon } = body;

        console.log(`[API] Received reading for device ${id}:`, { temperature, humidity, lat, lon });

        if (temperature === undefined || humidity === undefined) {
            return NextResponse.json({ success: false, error: 'Missing temp or humidity in body' }, { status: 400 });
        }

        step = 'db_find_device';
        // 1. Verify Device exists by Serial Number (deviceId)
        let device = await prisma.device.findUnique({
            where: { deviceId: id }
        });

        // AUTO-REGISTRATION: If device doesn't exist, create it on the fly!
        if (!device) {
            console.log(`[API] Device not found: ${id}. Auto-registering...`);
            step = 'db_auto_register';

            // We need at least one Wilaya and Baladiya to associate the device
            // Picking the first available ones for auto-registration
            const defaultWilaya = await prisma.wilaya.findFirst();
            const defaultBaladiya = await prisma.baladiya.findFirst();

            if (!defaultWilaya || !defaultBaladiya) {
                console.error('[API] Cannot auto-register: No wilayas/baladiyas in database');
                return NextResponse.json({ success: false, error: 'System not initialized (missing regions)' }, { status: 500 });
            }

            device = await prisma.device.create({
                data: {
                    deviceId: id,
                    type: 'FRIDGE',
                    model: 'Auto-Registered Prototype',
                    apiKey: 'auto_' + Math.random().toString(36).substring(7),
                    wilayaId: defaultWilaya.id,
                    baladiyaId: defaultBaladiya.id,
                    isOnline: true,
                    healthStatus: 'UNKNOWN'
                }
            });
            console.log(`[API] Successfully auto-registered device: ${id}`);
        }

        step = 'logic_health_check';
        // 2. Check Health Rules
        const isHealthy = (
            Number(temperature) >= (device.tempMin ?? -20) &&
            Number(temperature) <= (device.tempMax ?? 10)
        );

        step = 'db_create_reading';
        // 3. Save Reading using Internal UUID (device.id)
        await prisma.deviceReading.create({
            data: {
                deviceId: device.id,
                temperature: Number(temperature),
                humidity: Number(humidity),
                latitude: lat ? Number(lat) : undefined,
                longitude: lon ? Number(lon) : undefined,
                healthStatus: isHealthy ? 'HEALTHY' : 'NOT_HEALTHY',
                deviceTimestamp: new Date(),
            }
        });

        step = 'db_update_device';
        // 4. Update Device Status
        await prisma.device.update({
            where: { id: device.id },
            data: {
                lastTempValue: Number(temperature),
                lastHumidityValue: Number(humidity),
                lastLatitude: lat ? Number(lat) : undefined,
                lastLongitude: lon ? Number(lon) : undefined,
                lastSeenAt: new Date(),
                healthStatus: isHealthy ? 'HEALTHY' : 'NOT_HEALTHY',
                isOnline: true
            }
        });

        return NextResponse.json({ success: true, healthy: isHealthy, deviceId: id });

    } catch (error: any) {
        console.error(`[API] Error at step '${step}':`, error);
        return NextResponse.json({
            success: false,
            error: `Server Error at '${step}': ${error.message || 'Unknown'}`,
            details: error.stack
        }, { status: 500 });
    }
}
