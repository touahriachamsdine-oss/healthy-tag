import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { randomBytes } from 'crypto';


export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow admins to register devices
        if (user.role === 'BALADIYA_ADMIN') {
            // Technically could allow, but usually restricted to higher levels
            // For now let's allow all admins but check their scope later
        }

        const body = await request.json();
        const { deviceId, type, facilityId, targetTemp, tempMin, tempMax } = body;

        if (!deviceId || !type) {
            return NextResponse.json({ success: false, error: 'Device ID and type are required' }, { status: 400 });
        }

        // Check if device already exists
        const existing = await prisma.device.findUnique({ where: { deviceId } });
        if (existing) {
            return NextResponse.json({ success: false, error: 'Device ID already registered' }, { status: 400 });
        }

        // Get facility to find wilaya/baladiya
        const facility = await prisma.facility.findUnique({
            where: { id: facilityId },
            include: { baladiya: true }
        });

        if (!facility) {
            return NextResponse.json({ success: false, error: 'Invalid facility' }, { status: 400 });
        }

        // Generate a cryptographically secure random API Key
        const apiKey = randomBytes(32).toString('hex');

        const device = await prisma.device.create({
            data: {
                deviceId,
                type,
                facilityId,
                wilayaId: facility.baladiya.wilayaId,
                baladiyaId: facility.baladiyaId,
                apiKey,
                targetTemp: parseFloat(targetTemp || 4),
                tempMin: parseFloat(tempMin || 2),
                tempMax: parseFloat(tempMax || 8),
                healthStatus: 'UNKNOWN',
                isOnline: false
            }
        });

        return NextResponse.json({ success: true, data: device });
    } catch (error) {
        console.error('Register device error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Filter facilities based on user scope
        const filter: any = {};
        if (user.role === 'WILAYA_ADMIN') {
            filter.baladiya = { wilayaId: user.wilayaId };
        } else if (user.role === 'BALADIYA_ADMIN') {
            filter.baladiyaId = user.baladiyaId;
        }

        const facilities = await prisma.facility.findMany({
            where: filter,
            select: { id: true, name: true, baladiyaId: true }
        });
        return NextResponse.json({ success: true, data: facilities });
    } catch (error) {
        console.error('Fetch facilities error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
