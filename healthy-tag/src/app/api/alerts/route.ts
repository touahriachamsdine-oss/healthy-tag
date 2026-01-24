/**
 * Alerts API
 * GET /api/alerts - List alerts
 * PATCH /api/alerts - Acknowledge/resolve alerts
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const severity = searchParams.get('severity');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');

        // Build filter
        const alertFilter: Prisma.AlertWhereInput = {};

        if (status) {
            alertFilter.status = status as Prisma.EnumAlertStatusFilter;
        }

        if (severity) {
            alertFilter.severity = severity as Prisma.EnumAlertSeverityFilter;
        }

        // Role-based device filtering
        const deviceFilter: Prisma.DeviceWhereInput = {};
        if (user.role === 'WILAYA_ADMIN' && user.wilayaId) {
            deviceFilter.wilayaId = user.wilayaId;
        } else if (user.role === 'BALADIYA_ADMIN' && user.baladiyaId) {
            deviceFilter.baladiyaId = user.baladiyaId;
        }

        if (Object.keys(deviceFilter).length > 0) {
            alertFilter.device = deviceFilter;
        }

        const [alerts, total] = await Promise.all([
            prisma.alert.findMany({
                where: alertFilter,
                include: {
                    device: {
                        include: {
                            facility: { select: { name: true } },
                            wilaya: { select: { name: true } },
                            baladiya: { select: { name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: (page - 1) * limit,
            }),
            prisma.alert.count({ where: alertFilter }),
        ]);

        const formattedAlerts = alerts.map(alert => ({
            id: alert.id,
            deviceId: alert.device.deviceId,
            deviceName: alert.device.facility?.name || alert.device.deviceId,
            alertType: alert.alertType,
            severity: alert.severity,
            status: alert.status,
            title: alert.title,
            message: alert.message,
            triggerValue: alert.triggerValue,
            thresholdValue: alert.thresholdValue,
            createdAt: alert.createdAt,
            acknowledgedAt: alert.acknowledgedAt,
            resolvedAt: alert.resolvedAt,
            facilityName: alert.device.facility?.name,
            wilayaName: alert.device.wilaya.name,
            baladiyaName: alert.device.baladiya.name,
        }));

        return NextResponse.json({
            success: true,
            data: formattedAlerts,
            pagination: {
                total,
                page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('Alerts API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { alertId, action } = await request.json();

        if (!alertId || !action) {
            return NextResponse.json(
                { success: false, error: 'Alert ID and action are required' },
                { status: 400 }
            );
        }

        const updateData: Prisma.AlertUpdateInput = {};

        if (action === 'acknowledge') {
            updateData.status = 'ACKNOWLEDGED';
            updateData.acknowledgedByUser = { connect: { id: user.userId } };
            updateData.acknowledgedAt = new Date();
        } else if (action === 'resolve') {
            updateData.status = 'RESOLVED';
            updateData.resolvedAt = new Date();
        } else if (action === 'dismiss') {
            updateData.status = 'DISMISSED';
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
        }

        const alert = await prisma.alert.update({
            where: { id: alertId },
            data: updateData,
        });

        // Log audit
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: `ALERT_${action.toUpperCase()}`,
                entityType: 'Alert',
                entityId: alertId,
            },
        });

        return NextResponse.json({
            success: true,
            data: alert,
        });

    } catch (error) {
        console.error('Alert update error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
