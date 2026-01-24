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
        const { targetTemp, tempMin, tempMax } = body;

        await prisma.device.update({
            where: { id },
            data: {
                targetTemp: targetTemp !== undefined ? parseFloat(targetTemp) : undefined,
                tempMin: tempMin !== undefined ? parseFloat(tempMin) : undefined,
                tempMax: tempMax !== undefined ? parseFloat(tempMax) : undefined,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
