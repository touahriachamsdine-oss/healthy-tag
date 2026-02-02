import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { targetTemp, tempMin, tempMax, healthStatus } = body;


        await prisma.device.update({
            where: { id },
            data: {
                targetTemp: targetTemp !== undefined ? parseFloat(targetTemp) : undefined,
                tempMin: tempMin !== undefined ? parseFloat(tempMin) : undefined,
                tempMax: tempMax !== undefined ? parseFloat(tempMax) : undefined,
                healthStatus: healthStatus !== undefined ? healthStatus : undefined,
            }
        });


        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        // Delete readings first due to foreign key constraints if not cascaded
        await prisma.deviceReading.deleteMany({
            where: { deviceId: id }
        });

        await prisma.device.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
