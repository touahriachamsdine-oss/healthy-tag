
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateDeviceLocation() {
    const lat = 35.48916;
    const lon = 8.07262;
    const deviceId = 'HT-DZ-F4035934';

    console.log(`Updating device ${deviceId} location to: ${lat}, ${lon}`);

    const device = await prisma.device.findUnique({
        where: { deviceId }
    });

    if (device) {
        await prisma.device.update({
            where: { id: device.id },
            data: {
                lastLatitude: lat,
                lastLongitude: lon,
                latitude: lat,
                longitude: lon
            }
        });

        // Also update the latest reading to reflect on the map immediately
        const latestReading = await prisma.deviceReading.findFirst({
            where: { deviceId: device.id },
            orderBy: { serverTimestamp: 'desc' }
        });

        if (latestReading) {
            await prisma.deviceReading.update({
                where: { id: latestReading.id },
                data: {
                    latitude: lat,
                    longitude: lon
                }
            });
        }

        console.log('✅ Device location updated successfully!');
    } else {
        console.error('❌ Device HT-DZ-00034 not found in database.');
    }
}

updateDeviceLocation().finally(() => prisma.$disconnect());
