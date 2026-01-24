import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const device = await prisma.device.findUnique({
            where: { id: params.id }
        });

        if (!device) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });

        await prisma.device.update({
            where: { id: params.id },
            data: {
                healthStatus: 'HEALTHY',
                needsManualReset: false
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
