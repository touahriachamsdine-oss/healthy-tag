/**
 * Healthy Tag - Core Health Classification Logic
 * 
 * This module contains the core business logic for determining
 * the health status of cold-chain devices based on temperature,
 * humidity, connectivity, and other factors.
 */

import { HealthStatus, DeviceType } from '@prisma/client';

// Temperature thresholds by device type
export const TEMP_THRESHOLDS = {
    FRIDGE: { min: 2, max: 8 },
    FREEZER: { min: -25, max: -18 },
} as const;

// Warning buffer zones (degrees)
const WARNING_BUFFER = 1; // Degrees from threshold

// Offline timeout (minutes)
const OFFLINE_TIMEOUT_MINUTES = 30;

// Reading stability check (max allowed variance in short period)
const MAX_TEMP_VARIANCE = 5; // Degrees per 5 minutes

interface HealthCheckInput {
    temperature: number;
    humidity: number;
    deviceType: DeviceType;
    lastSeenAt: Date | null;
    tempMin?: number;
    tempMax?: number;
    humidityMin?: number;
    humidityMax?: number;
    recentReadings?: { temperature: number; timestamp: Date }[];
}

interface HealthCheckResult {
    status: HealthStatus;
    reasons: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
}

/**
 * Determine the health status of a device based on multiple factors
 */
export function calculateHealthStatus(input: HealthCheckInput): HealthCheckResult {
    const {
        temperature,
        humidity,
        deviceType,
        lastSeenAt,
        tempMin = TEMP_THRESHOLDS[deviceType].min,
        tempMax = TEMP_THRESHOLDS[deviceType].max,
        humidityMin = 30,
        humidityMax = 70,
        recentReadings = [],
    } = input;

    const reasons: string[] = [];
    const recommendations: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check if device is offline
    if (lastSeenAt) {
        const minutesSinceLastSeen = (Date.now() - lastSeenAt.getTime()) / (1000 * 60);
        if (minutesSinceLastSeen > OFFLINE_TIMEOUT_MINUTES) {
            return {
                status: 'OFFLINE',
                reasons: [`No data received for ${Math.round(minutesSinceLastSeen)} minutes`],
                severity: 'high',
                recommendations: ['Check device connectivity', 'Verify GSM signal', 'Inspect power supply'],
            };
        }
    }

    // Temperature out of range - Critical
    if (temperature > tempMax) {
        reasons.push(`Temperature ${temperature}°C exceeds maximum ${tempMax}°C`);
        severity = 'critical';
        recommendations.push('Check door seal', 'Verify compressor operation', 'Reduce ambient temperature');
    } else if (temperature < tempMin) {
        reasons.push(`Temperature ${temperature}°C below minimum ${tempMin}°C`);
        severity = 'critical';
        recommendations.push('Check thermostat settings', 'Verify temperature sensor');
    }

    // Temperature in warning zone
    if (temperature >= tempMax - WARNING_BUFFER && temperature <= tempMax) {
        reasons.push(`Temperature ${temperature}°C approaching upper limit`);
        if (severity !== 'critical') severity = 'medium';
    } else if (temperature <= tempMin + WARNING_BUFFER && temperature >= tempMin) {
        reasons.push(`Temperature ${temperature}°C approaching lower limit`);
        if (severity !== 'critical') severity = 'medium';
    }

    // Humidity checks
    if (humidity > humidityMax) {
        reasons.push(`Humidity ${humidity}% exceeds maximum ${humidityMax}%`);
        if (severity !== 'critical') severity = 'medium';
        recommendations.push('Check door gasket', 'Reduce frequency of door opening');
    } else if (humidity < humidityMin) {
        reasons.push(`Humidity ${humidity}% below minimum ${humidityMin}%`);
        if (severity !== 'critical') severity = 'medium';
    }

    // Check for rapid temperature changes (potential door left open or compressor issue)
    if (recentReadings.length >= 2) {
        const sortedReadings = [...recentReadings].sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        for (let i = 0; i < sortedReadings.length - 1; i++) {
            const current = sortedReadings[i];
            const previous = sortedReadings[i + 1];
            const timeDiffMinutes = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60);

            if (timeDiffMinutes <= 5) {
                const tempChange = Math.abs(current.temperature - previous.temperature);
                if (tempChange > MAX_TEMP_VARIANCE) {
                    reasons.push(`Rapid temperature change detected: ${tempChange.toFixed(1)}°C in ${timeDiffMinutes.toFixed(0)} minutes`);
                    severity = 'high';
                    recommendations.push('Check if door was left open', 'Inspect for power fluctuations');
                    break;
                }
            }
        }
    }

    // Determine final status
    let status: HealthStatus;
    if (reasons.length === 0) {
        status = 'HEALTHY';
    } else if (severity === 'critical') {
        status = 'NOT_HEALTHY';
    } else if (severity === 'high' || severity === 'medium') {
        status = 'WARNING';
    } else {
        status = 'HEALTHY';
    }

    return {
        status,
        reasons,
        severity,
        recommendations,
    };
}

/**
 * Check if GPS coordinates have changed significantly (device moved)
 */
export function hasDeviceMoved(
    oldLat: number | null,
    oldLon: number | null,
    newLat: number,
    newLon: number,
    thresholdMeters: number = 100
): boolean {
    if (oldLat === null || oldLon === null) return false;

    const R = 6371e3; // Earth radius in meters
    const φ1 = (oldLat * Math.PI) / 180;
    const φ2 = (newLat * Math.PI) / 180;
    const Δφ = ((newLat - oldLat) * Math.PI) / 180;
    const Δλ = ((newLon - oldLon) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance > thresholdMeters;
}

/**
 * Detect potential compressor issues based on temperature patterns
 */
export function detectCompressorIssue(
    readings: { temperature: number; timestamp: Date }[],
    deviceType: DeviceType
): { hasIssue: boolean; pattern: string | null } {
    if (readings.length < 10) return { hasIssue: false, pattern: null };

    const { max: tempMax } = TEMP_THRESHOLDS[deviceType];

    // Sort by timestamp
    const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Check for gradual temperature rise (compressor failing)
    let risingCount = 0;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].temperature > sorted[i - 1].temperature) {
            risingCount++;
        }
    }

    if (risingCount > sorted.length * 0.8) {
        return { hasIssue: true, pattern: 'GRADUAL_RISE' };
    }

    // Check for oscillation (compressor cycling issues)
    let oscillations = 0;
    for (let i = 2; i < sorted.length; i++) {
        const prev = sorted[i - 2].temperature;
        const curr = sorted[i - 1].temperature;
        const next = sorted[i].temperature;

        if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
            oscillations++;
        }
    }

    if (oscillations > sorted.length * 0.5) {
        return { hasIssue: true, pattern: 'EXCESSIVE_CYCLING' };
    }

    // Check for temperatures stuck near threshold
    const nearThreshold = sorted.filter(r => r.temperature >= tempMax - 1).length;
    if (nearThreshold > sorted.length * 0.7) {
        return { hasIssue: true, pattern: 'STRUGGLING_TO_COOL' };
    }

    return { hasIssue: false, pattern: null };
}

/**
 * Calculate compliance rate for a set of devices
 */
export function calculateComplianceRate(
    devices: { healthStatus: HealthStatus }[]
): number {
    if (devices.length === 0) return 100;

    const healthyCount = devices.filter(
        d => d.healthStatus === 'HEALTHY'
    ).length;

    return Math.round((healthyCount / devices.length) * 100);
}

/**
 * Get status icon for TFT display
 */
export function getStatusIcon(status: HealthStatus): string {
    switch (status) {
        case 'HEALTHY':
            return '✅';
        case 'WARNING':
            return '⚠️';
        case 'NOT_HEALTHY':
            return '❌';
        case 'OFFLINE':
            return '📡';
        default:
            return '❓';
    }
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: HealthStatus): {
    bg: string;
    text: string;
    border: string;
} {
    switch (status) {
        case 'HEALTHY':
            return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' };
        case 'WARNING':
            return { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500' };
        case 'NOT_HEALTHY':
            return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
        case 'OFFLINE':
            return { bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500' };
        default:
            return { bg: 'bg-slate-400', text: 'text-slate-400', border: 'border-slate-400' };
    }
}
