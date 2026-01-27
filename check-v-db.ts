
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Database Devices ---');
    const devices = await prisma.device.findMany({
        include: {
            facility: true,
            _count: {
                select: { readings: true }
            }
        }
    });

    console.log(`Total Devices: ${devices.length}`);
    devices.forEach(d => {
        console.log(`- [${d.deviceId}] ${d.isOnline ? 'ONLINE' : 'OFFLINE'} | Status: ${d.healthStatus} | Readings: ${d._count.readings}`);
        console.log(`  Last Seen: ${d.lastSeenAt}`);
        console.log(`  Temp: ${d.lastTempValue}°C`);
    });

    const readings = await prisma.deviceReading.findMany({
        orderBy: { serverTimestamp: 'desc' },
        take: 5
    });
    console.log('\n--- Recent Readings ---');
    readings.forEach(r => {
        console.log(`- DeviceID: ${r.deviceId} | Temp: ${r.temperature}°C | Time: ${r.serverTimestamp}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
