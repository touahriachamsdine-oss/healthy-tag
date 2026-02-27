import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const wilayas = await prisma.wilaya.findMany({
            orderBy: { code: 'asc' },
            select: { id: true, name: true, code: true, nameAr: true }
        });

        return NextResponse.json({ success: true, data: wilayas });
    } catch (error) {
        console.error('Fetch wilayas error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
