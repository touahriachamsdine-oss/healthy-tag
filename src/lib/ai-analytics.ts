/**
 * Healthy Tag - AI Analytics Layer
 * 
 * This module provides AI-powered analytics for:
 * - Anomaly detection
 * - Failure prediction
 * - Pattern recognition
 * - Behavioral learning
 */

import { DeviceType, HealthStatus } from '@prisma/client';
import { TEMP_THRESHOLDS, detectCompressorIssue } from './health-logic';

interface Reading {
    temperature: number;
    humidity: number;
    timestamp: Date;
}

interface AnomalyResult {
    isAnomaly: boolean;
    score: number; // 0-100
    type: string | null;
    description: string | null;
}

interface PredictionResult {
    failureProbability: number; // 0-1
    predictedFailure: boolean;
    failureType: string | null;
    timeToFailure: number | null; // hours
    confidence: number; // 0-1
    recommendations: string[];
}

interface PatternResult {
    pattern: string | null;
    confidence: number;
    description: string | null;
}

/**
 * Calculate statistical properties of readings
 */
function calculateStats(values: number[]): {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    variance: number;
} {
    if (values.length === 0) {
        return { mean: 0, stdDev: 0, min: 0, max: 0, variance: 0 };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
        mean,
        stdDev,
        min: Math.min(...values),
        max: Math.max(...values),
        variance,
    };
}

/**
 * Z-score based anomaly detection
 */
export function detectAnomalies(
    currentReading: Reading,
    historicalReadings: Reading[],
    deviceType: DeviceType
): AnomalyResult {
    if (historicalReadings.length < 10) {
        return { isAnomaly: false, score: 0, type: null, description: null };
    }

    const temps = historicalReadings.map(r => r.temperature);
    const humids = historicalReadings.map(r => r.humidity);

    const tempStats = calculateStats(temps);
    const humidStats = calculateStats(humids);

    // Calculate Z-scores
    const tempZScore = tempStats.stdDev > 0
        ? Math.abs((currentReading.temperature - tempStats.mean) / tempStats.stdDev)
        : 0;

    const humidZScore = humidStats.stdDev > 0
        ? Math.abs((currentReading.humidity - humidStats.mean) / humidStats.stdDev)
        : 0;

    // Anomaly thresholds
    const TEMP_Z_THRESHOLD = 2.5;
    const HUMID_Z_THRESHOLD = 2.5;

    let anomalyScore = 0;
    let anomalyType: string | null = null;
    let description: string | null = null;

    if (tempZScore > TEMP_Z_THRESHOLD) {
        anomalyScore = Math.min(100, (tempZScore / TEMP_Z_THRESHOLD) * 50);
        anomalyType = 'TEMPERATURE_ANOMALY';
        description = `Temperature ${currentReading.temperature}°C is ${tempZScore.toFixed(1)} standard deviations from normal`;
    }

    if (humidZScore > HUMID_Z_THRESHOLD) {
        const humidScore = Math.min(100, (humidZScore / HUMID_Z_THRESHOLD) * 50);
        if (humidScore > anomalyScore) {
            anomalyScore = humidScore;
            anomalyType = 'HUMIDITY_ANOMALY';
            description = `Humidity ${currentReading.humidity}% is ${humidZScore.toFixed(1)} standard deviations from normal`;
        }
    }

    // Check for rapid change anomaly
    if (historicalReadings.length >= 2) {
        const lastReading = historicalReadings[historicalReadings.length - 1];
        const timeDiffMinutes = (currentReading.timestamp.getTime() - lastReading.timestamp.getTime()) / (1000 * 60);

        if (timeDiffMinutes > 0 && timeDiffMinutes <= 10) {
            const rateOfChange = Math.abs(currentReading.temperature - lastReading.temperature) / timeDiffMinutes;

            if (rateOfChange > 0.5) { // More than 0.5°C per minute
                const rapidChangeScore = Math.min(100, rateOfChange * 30);
                if (rapidChangeScore > anomalyScore) {
                    anomalyScore = rapidChangeScore;
                    anomalyType = 'RAPID_CHANGE';
                    description = `Temperature changing at ${(rateOfChange * 60).toFixed(1)}°C/hour`;
                }
            }
        }
    }

    return {
        isAnomaly: anomalyScore > 50,
        score: Math.round(anomalyScore),
        type: anomalyType,
        description,
    };
}

/**
 * Predict potential failures based on patterns
 */
export function predictFailure(
    readings: Reading[],
    deviceType: DeviceType,
    deviceAge: number // days since installation
): PredictionResult {
    const recommendations: string[] = [];
    let failureProbability = 0;
    let failureType: string | null = null;
    let timeToFailure: number | null = null;

    if (readings.length < 20) {
        return {
            failureProbability: 0,
            predictedFailure: false,
            failureType: null,
            timeToFailure: null,
            confidence: 0,
            recommendations: ['Insufficient data for prediction'],
        };
    }

    // Check for compressor issues
    const compressorCheck = detectCompressorIssue(readings, deviceType);
    if (compressorCheck.hasIssue) {
        failureProbability += 0.4;
        failureType = 'COMPRESSOR';

        switch (compressorCheck.pattern) {
            case 'GRADUAL_RISE':
                timeToFailure = 48; // 2 days
                recommendations.push('Schedule compressor inspection immediately');
                break;
            case 'EXCESSIVE_CYCLING':
                timeToFailure = 72; // 3 days
                recommendations.push('Check refrigerant levels', 'Inspect thermostat');
                break;
            case 'STRUGGLING_TO_COOL':
                timeToFailure = 24; // 1 day
                recommendations.push('Emergency maintenance required', 'Prepare backup cold storage');
                break;
        }
    }

    // Check temperature variance trend
    const recentReadings = readings.slice(-20);
    const olderReadings = readings.slice(-40, -20);

    if (olderReadings.length >= 10) {
        const recentVariance = calculateStats(recentReadings.map(r => r.temperature)).variance;
        const olderVariance = calculateStats(olderReadings.map(r => r.temperature)).variance;

        if (recentVariance > olderVariance * 2) {
            failureProbability += 0.2;
            recommendations.push('Temperature stability degrading - inspect seals and sensors');
        }
    }

    // Age-based failure probability
    if (deviceAge > 1825) { // 5 years
        failureProbability += 0.15;
        recommendations.push('Device approaching end of expected lifespan');
    } else if (deviceAge > 1095) { // 3 years
        failureProbability += 0.05;
    }

    // Humidity pattern analysis (door seal issues)
    const humidStats = calculateStats(readings.map(r => r.humidity));
    const { max: tempMax } = TEMP_THRESHOLDS[deviceType];

    if (humidStats.mean > 65 && humidStats.stdDev > 10) {
        failureProbability += 0.1;
        failureType = failureType || 'DOOR_SEAL';
        timeToFailure = timeToFailure || 168; // 1 week
        recommendations.push('Door seal may be degrading - high humidity fluctuations detected');
    }

    // Calculate confidence based on data quality
    const confidence = Math.min(1, readings.length / 100) * 0.8 + 0.2;

    return {
        failureProbability: Math.min(1, failureProbability),
        predictedFailure: failureProbability > 0.5,
        failureType,
        timeToFailure,
        confidence,
        recommendations,
    };
}

/**
 * Detect behavioral patterns
 */
export function detectPatterns(
    readings: Reading[],
    timeRangeHours: number = 24
): PatternResult {
    if (readings.length < 10) {
        return { pattern: null, confidence: 0, description: null };
    }

    // Sort by timestamp
    const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Detect door left open pattern (sudden temp rise followed by slow recovery)
    for (let i = 5; i < sorted.length - 5; i++) {
        const before = sorted.slice(i - 5, i);
        const after = sorted.slice(i, i + 5);

        const beforeMean = calculateStats(before.map(r => r.temperature)).mean;
        const peak = sorted[i].temperature;
        const afterMean = calculateStats(after.map(r => r.temperature)).mean;

        if (peak > beforeMean + 3 && afterMean < peak && afterMean > beforeMean) {
            return {
                pattern: 'DOOR_LEFT_OPEN',
                confidence: 0.8,
                description: 'Pattern indicates door was opened and left ajar, causing temperature spike with slow recovery',
            };
        }
    }

    // Detect power instability (periodic drops to ambient then recovery)
    const avgTemp = calculateStats(sorted.map(r => r.temperature)).mean;
    let powerCycles = 0;

    for (let i = 1; i < sorted.length - 1; i++) {
        const prev = sorted[i - 1].temperature;
        const curr = sorted[i].temperature;
        const next = sorted[i + 1].temperature;

        // Look for V-shaped pattern (power loss and recovery)
        if (curr > prev + 5 && curr > next + 5) {
            powerCycles++;
        }
    }

    if (powerCycles >= 2) {
        return {
            pattern: 'POWER_INSTABILITY',
            confidence: 0.7,
            description: `Detected ${powerCycles} potential power interruption events`,
        };
    }

    // Detect defrost cycle issues
    const humidSpikes = sorted.filter(r => r.humidity > 80).length;
    if (humidSpikes > sorted.length * 0.3) {
        return {
            pattern: 'DEFROST_ISSUES',
            confidence: 0.6,
            description: 'Frequent high humidity readings suggest defrost cycle problems',
        };
    }

    return { pattern: null, confidence: 0, description: null };
}

/**
 * Learn normal behavior baseline for a device
 */
export function learnBaseline(readings: Reading[]): {
    normalTempRange: { min: number; max: number };
    normalHumidRange: { min: number; max: number };
    typicalVariance: number;
    peakHours: number[];
} {
    if (readings.length < 50) {
        return {
            normalTempRange: { min: 2, max: 8 },
            normalHumidRange: { min: 30, max: 70 },
            typicalVariance: 1,
            peakHours: [],
        };
    }

    const tempStats = calculateStats(readings.map(r => r.temperature));
    const humidStats = calculateStats(readings.map(r => r.humidity));

    // Find peak activity hours based on temperature variance
    const hourlyVariance: { [hour: number]: number[] } = {};

    readings.forEach(r => {
        const hour = r.timestamp.getHours();
        if (!hourlyVariance[hour]) hourlyVariance[hour] = [];
        hourlyVariance[hour].push(r.temperature);
    });

    const hourlyStats = Object.entries(hourlyVariance).map(([hour, temps]) => ({
        hour: parseInt(hour),
        variance: calculateStats(temps).variance,
    }));

    const avgVariance = hourlyStats.reduce((sum, h) => sum + h.variance, 0) / hourlyStats.length;
    const peakHours = hourlyStats
        .filter(h => h.variance > avgVariance * 1.5)
        .map(h => h.hour)
        .sort((a, b) => a - b);

    return {
        normalTempRange: {
            min: tempStats.mean - 2 * tempStats.stdDev,
            max: tempStats.mean + 2 * tempStats.stdDev,
        },
        normalHumidRange: {
            min: humidStats.mean - 2 * humidStats.stdDev,
            max: humidStats.mean + 2 * humidStats.stdDev,
        },
        typicalVariance: tempStats.variance,
        peakHours,
    };
}

/**
 * Generate AI-powered insights for a device
 */
export function generateInsights(
    readings: Reading[],
    deviceType: DeviceType,
    deviceAge: number
): {
    summary: string;
    healthScore: number;
    insights: string[];
    alerts: string[];
} {
    const insights: string[] = [];
    const alerts: string[] = [];
    let healthScore = 100;

    if (readings.length < 10) {
        return {
            summary: 'Insufficient data for AI analysis',
            healthScore: 50,
            insights: ['Need more readings for comprehensive analysis'],
            alerts: [],
        };
    }

    // Get current reading
    const current = readings[readings.length - 1];

    // Anomaly detection
    const anomaly = detectAnomalies(current, readings.slice(0, -1), deviceType);
    if (anomaly.isAnomaly) {
        alerts.push(anomaly.description || 'Anomaly detected');
        healthScore -= anomaly.score * 0.3;
    }

    // Failure prediction
    const prediction = predictFailure(readings, deviceType, deviceAge);
    if (prediction.predictedFailure) {
        alerts.push(`Potential ${prediction.failureType} failure predicted`);
        if (prediction.timeToFailure) {
            alerts.push(`Estimated time to failure: ${prediction.timeToFailure} hours`);
        }
        healthScore -= prediction.failureProbability * 40;
    }
    prediction.recommendations.forEach(r => insights.push(r));

    // Pattern detection
    const pattern = detectPatterns(readings);
    if (pattern.pattern) {
        insights.push(pattern.description || `Pattern detected: ${pattern.pattern}`);
        healthScore -= (1 - pattern.confidence) * 10;
    }

    // Baseline learning
    const baseline = learnBaseline(readings);
    if (baseline.peakHours.length > 0) {
        insights.push(`High activity typically occurs at: ${baseline.peakHours.map(h => `${h}:00`).join(', ')}`);
    }

    // Generate summary
    let summary: string;
    if (healthScore >= 90) {
        summary = 'Device operating optimally with no concerns';
    } else if (healthScore >= 70) {
        summary = 'Device mostly healthy with minor observations';
    } else if (healthScore >= 50) {
        summary = 'Device requires attention - some issues detected';
    } else {
        summary = 'Critical issues detected - immediate action required';
    }

    return {
        summary,
        healthScore: Math.max(0, Math.round(healthScore)),
        insights,
        alerts,
    };
}
