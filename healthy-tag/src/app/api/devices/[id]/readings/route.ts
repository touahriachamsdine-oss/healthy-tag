import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const searchParams = new URL(request.url).searchParams;
        const limit = parseInt(searchParams.get('limit') || '100');

        // Allow fetching by Serial Number (deviceId) or internal ID
        const readings = await prisma.deviceReading.findMany({
            where: {
                device: {
                    deviceId: params.id
                }
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
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { temperature, humidity } = body;

        // 1. Verify Device exists by Serial Number (deviceId)
        const device = await prisma.device.findUnique({
            where: { deviceId: params.id }
        });

        if (!device) {
            return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
        }

        // 2. Check Health Rules
        const isHealthy = (
            temperature >= (device.tempMin ?? -20) &&
            temperature <= (device.tempMax ?? 10)
        );

        // 3. Save Reading using Internal UUID (device.id)
        // Schema requires healthStatus enum 'HEALTHY' | 'WARNING' | 'NOT_HEALTHY' ...
        await prisma.deviceReading.create({
            data: {
                deviceId: device.id, // Correctly link to Foreign Key (UUID)
                temperature: Number(temperature),
                humidity: Number(humidity),
                healthStatus: isHealthy ? 'HEALTHY' : 'NOT_HEALTHY',
                deviceTimestamp: new Date(),
            }
        });

        // 4. Update Device Status (Optional but good for sync)
        await prisma.device.update({
            where: { id: device.id },
            data: {
                lastTempValue: Number(temperature),
                lastHumidityValue: Number(humidity),
                lastSeenAt: new Date(),
                healthStatus: isHealthy ? 'HEALTHY' : 'NOT_HEALTHY',
                isOnline: true
            }
        });

        return NextResponse.json({ success: true, healthy: isHealthy });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Error processing reading' }, { status: 500 });
    }
}
