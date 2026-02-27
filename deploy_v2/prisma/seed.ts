import 'dotenv/config';
import { PrismaClient, DeviceType, HealthStatus, FacilityType, UserRole, AlertType, AlertSeverity } from '@prisma/client';

import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    try {
        await prisma.aIAnalytics.deleteMany();
        await prisma.alert.deleteMany();
        await prisma.deviceReading.deleteMany();
        await prisma.deviceEvent.deleteMany();
        await prisma.auditLog.deleteMany();
        await prisma.session.deleteMany();
        await prisma.device.deleteMany();
        await prisma.user.deleteMany();
        await prisma.facility.deleteMany();
        await prisma.baladiya.deleteMany();
        await prisma.wilaya.deleteMany();
    } catch (e) {
        console.warn('⚠️  Could not clear some tables (they might be empty)');
    }

    // Create Wilayas (Algerian provinces)
    console.log('🗺️  Creating wilayas...');
    const wilayaData = [
        { code: '16', name: 'Alger', nameAr: 'الجزائر' },
        { code: '31', name: 'Oran', nameAr: 'وهران' },
        { code: '25', name: 'Constantine', nameAr: 'قسنطينة' },
        { code: '23', name: 'Annaba', nameAr: 'عنابة' },
        { code: '09', name: 'Blida', nameAr: 'البليدة' },
        { code: '19', name: 'Sétif', nameAr: 'سطيف' },
    ];

    const wilayas = [];
    for (const data of wilayaData) {
        wilayas.push(await prisma.wilaya.create({ data }));
    }

    // Create Baladiyas (municipalities)
    console.log('🏘️  Creating baladiyas...');
    const baladiyas = [];

    // Alger
    baladiyas.push(await prisma.baladiya.create({ data: { code: '1601', name: 'Sidi M\'Hamed', wilayaId: wilayas[0].id } }));
    baladiyas.push(await prisma.baladiya.create({ data: { code: '1602', name: 'El Madania', wilayaId: wilayas[0].id } }));
    baladiyas.push(await prisma.baladiya.create({ data: { code: '1603', name: 'Hussein Dey', wilayaId: wilayas[0].id } }));
    // Oran
    baladiyas.push(await prisma.baladiya.create({ data: { code: '3101', name: 'Oran Centre', wilayaId: wilayas[1].id } }));
    baladiyas.push(await prisma.baladiya.create({ data: { code: '3102', name: 'Es Senia', wilayaId: wilayas[1].id } }));
    // Constantine
    baladiyas.push(await prisma.baladiya.create({ data: { code: '2501', name: 'Constantine Centre', wilayaId: wilayas[2].id } }));
    // Annaba
    baladiyas.push(await prisma.baladiya.create({ data: { code: '2301', name: 'Annaba Centre', wilayaId: wilayas[3].id } }));
    // Blida
    baladiyas.push(await prisma.baladiya.create({ data: { code: '0901', name: 'Blida Centre', wilayaId: wilayas[4].id } }));
    // Sétif
    baladiyas.push(await prisma.baladiya.create({ data: { code: '1901', name: 'Sétif Centre', wilayaId: wilayas[5].id } }));

    // Create Facilities
    console.log('🏥 Creating facilities...');
    const facilities = [];
    facilities.push(await prisma.facility.create({
        data: {
            name: 'CHU Mustapha Pacha',
            type: FacilityType.HOSPITAL,
            address: 'Place du 1er Mai, Alger',
            baladiyaId: baladiyas[0].id,
            latitude: 36.7538,
            longitude: 3.0588,
        },
    }));
    facilities.push(await prisma.facility.create({
        data: {
            name: 'Pharmacie Centrale d\'Alger',
            type: FacilityType.PHARMACY,
            address: 'Rue Didouche Mourad, Alger',
            baladiyaId: baladiyas[1].id,
            latitude: 36.7698,
            longitude: 3.0583,
        },
    }));
    facilities.push(await prisma.facility.create({
        data: {
            name: 'Centre de Vaccination Oran',
            type: FacilityType.VACCINE_CENTER,
            address: 'Boulevard de l\'ALN, Oran',
            baladiyaId: baladiyas[3].id,
            latitude: 35.6969,
            longitude: -0.6331,
        },
    }));
    facilities.push(await prisma.facility.create({
        data: {
            name: 'CHU Ibn Badis',
            type: FacilityType.HOSPITAL,
            address: 'Rue Zaamoum, Constantine',
            baladiyaId: baladiyas[5].id,
            latitude: 36.3650,
            longitude: 6.6147,
        },
    }));
    facilities.push(await prisma.facility.create({
        data: {
            name: 'Hôpital Ibn Sina Annaba',
            type: FacilityType.HOSPITAL,
            address: 'Route de l\'Aéroport, Annaba',
            baladiyaId: baladiyas[6].id,
            latitude: 36.9000,
            longitude: 7.7667,
        },
    }));
    facilities.push(await prisma.facility.create({
        data: {
            name: 'Laboratoire Central Blida',
            type: FacilityType.LABORATORY,
            address: 'Rue Frantz Fanon, Blida',
            baladiyaId: baladiyas[7].id,
            latitude: 36.4700,
            longitude: 2.8300,
        },
    }));
    facilities.push(await prisma.facility.create({
        data: {
            name: 'Banque de Sang Sétif',
            type: FacilityType.BLOOD_BANK,
            address: 'Avenue du 1er Novembre, Sétif',
            baladiyaId: baladiyas[8].id,
            latitude: 36.1900,
            longitude: 5.4100,
        },
    }));

    // Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('HealthyTag2026!', 12);

    const users = [];
    // Super Admin
    const superAdminPassword = await bcrypt.hash('pass', 12);
    users.push(await prisma.user.create({
        data: {
            email: 'super@admin.com',
            password: superAdminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            phone: '+213555000001',
            role: UserRole.SUPER_ADMIN,
            isActive: true,
            twoFactorEnabled: true,
        },
    }));
    // Wilaya Admin
    const wilayaAdminPassword = await bcrypt.hash('HealthyTag2026!', 12);
    users.push(await prisma.user.create({
        data: {
            email: 'alger@healthytag.dz',
            password: wilayaAdminPassword,
            firstName: 'Ahmed',
            lastName: 'Benali',
            phone: '+213555000002',
            role: UserRole.WILAYA_ADMIN,
            wilayaId: wilayas[0].id,
            isActive: true,
        },
    }));

    // Create Devices
    console.log('📟 Creating devices...');
    const devices = [];
    devices.push(await prisma.device.create({
        data: {
            deviceId: 'HT-DZ-00001',
            simNumber: '+213550000001',
            apiKey: 'ak_' + randomUUID(),
            type: DeviceType.FRIDGE,
            model: 'HealthyTag Pro V2',
            firmwareVersion: '2.1.0',
            facilityId: facilities[0].id,
            wilayaId: wilayas[0].id,
            baladiyaId: baladiyas[0].id,
            latitude: 36.7538,
            longitude: 3.0588,
            tempMin: 2,
            tempMax: 8,
            healthStatus: HealthStatus.HEALTHY,
            isOnline: true,
            lastSeenAt: new Date(),
            lastTempValue: 4.2,
            lastHumidityValue: 65,
            installDate: new Date('2025-06-15'),
        },
    }));
    devices.push(await prisma.device.create({
        data: {
            deviceId: 'HT-DZ-00002',
            simNumber: '+213550000002',
            apiKey: 'ak_' + randomUUID(),
            type: DeviceType.FREEZER,
            model: 'HealthyTag Pro V2',
            firmwareVersion: '2.1.0',
            facilityId: facilities[0].id,
            wilayaId: wilayas[0].id,
            baladiyaId: baladiyas[0].id,
            latitude: 36.7540,
            longitude: 3.0590,
            tempMin: -25,
            tempMax: -18,
            healthStatus: HealthStatus.HEALTHY,
            isOnline: true,
            lastSeenAt: new Date(),
            lastTempValue: -20.5,
            lastHumidityValue: 45,
            installDate: new Date('2025-06-15'),
        },
    }));

    // Device used in Arduino Example
    devices.push(await prisma.device.create({
        data: {
            deviceId: 'HT-DZ-00034',
            simNumber: '+213550000034',
            apiKey: 'ak_' + randomUUID(),
            type: DeviceType.FRIDGE,
            model: 'Arduino Prototype',
            firmwareVersion: '1.0.0',
            facilityId: facilities[0].id,
            wilayaId: wilayas[0].id,
            baladiyaId: baladiyas[0].id,
            latitude: 36.7538,
            longitude: 3.0588,
            tempMin: 2,
            tempMax: 8,
            healthStatus: HealthStatus.UNKNOWN,
            isOnline: false,
            installDate: new Date(),
        },
    }));

    // Create sample readings
    console.log('📊 Creating sample readings...');
    const readings = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        readings.push({
            deviceId: devices[0].id,
            temperature: 4 + (Math.random() * 2 - 1),
            humidity: 60 + (Math.random() * 10 - 5),
            latitude: 36.7538,
            longitude: 3.0588,
            gsmSignal: 80,
            healthStatus: HealthStatus.HEALTHY,
            deviceTimestamp: timestamp,
            serverTimestamp: timestamp,
        });
    }
    await prisma.deviceReading.createMany({ data: readings });

    console.log('\n✅ Database seeded successfully!');
    console.log('📧 Admin: super@admin.com / pass');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
