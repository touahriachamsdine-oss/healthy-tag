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


        const device = await prisma.device.findUnique({
            where: { id },
            select: { wilayaId: true, baladiyaId: true }
        });

        if (!device) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });

        // Scoping check
        if (user.role === 'WILAYA_ADMIN' && user.wilayaId !== device.wilayaId) {
            return NextResponse.json({ success: false, error: 'Forbidden: Access to this region denied' }, { status: 403 });
        }
        if (user.role === 'BALADIYA_ADMIN' && user.baladiyaId !== device.baladiyaId) {
            return NextResponse.json({ success: false, error: 'Forbidden: Access to this municipality denied' }, { status: 403 });
        }

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

        // Scoping check before delete
        const device = await prisma.device.findUnique({
            where: { id },
            select: { wilayaId: true, baladiyaId: true }
        });

        if (device) {
            if (user.role === 'WILAYA_ADMIN' && user.wilayaId !== device.wilayaId) {
                return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
            }
            if (user.role === 'BALADIYA_ADMIN' && user.baladiyaId !== device.baladiyaId) {
                return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
            }

            // Delete readings first due to foreign key constraints if not cascaded
            await prisma.deviceReading.deleteMany({
                where: { deviceId: id }
            });

            await prisma.device.delete({
                where: { id }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
