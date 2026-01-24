// Healthy Tag Type Definitions

import { HealthStatus, DeviceType, UserRole, AlertType, AlertSeverity, FacilityType } from '@prisma/client';

// Re-export Prisma enums
export { HealthStatus, DeviceType, UserRole, AlertType, AlertSeverity, FacilityType };

// Device payload from IoT device
export interface DevicePayload {
    device_id: string;
    timestamp: string;
    temp: number;
    humidity: number;
    lat?: number;
    lon?: number;
    gsm_signal?: number;
    battery_level?: number;
}

// Dashboard statistics
export interface DashboardStats {
    totalDevices: number;
    healthyDevices: number;
    warningDevices: number;
    unhealthyDevices: number;
    offlineDevices: number;
    activeAlerts: number;
    complianceRate: number;
}

// Device with relations for dashboard
export interface DeviceWithDetails {
    id: string;
    deviceId: string;
    type: DeviceType;
    healthStatus: HealthStatus;
    isOnline: boolean;
    lastSeenAt: Date | null;
    lastTempValue: number | null;
    lastHumidityValue: number | null;
    latitude: number | null;
    longitude: number | null;
    tempMin: number;
    tempMax: number;
    facility: {
        id: string;
        name: string;
        type: FacilityType;
    } | null;
    wilaya: {
        id: string;
        name: string;
        code: string;
    };
    baladiya: {
        id: string;
        name: string;
        code: string;
    };
    _count?: {
        alerts: number;
    };
}

// Map marker data
export interface MapMarker {
    id: string;
    deviceId: string;
    lat: number;
    lng: number;
    status: HealthStatus;
    type: DeviceType;
    temp: number | null;
    humidity: number | null;
    facilityName: string | null;
    wilayaName: string;
    baladiyaName: string;
}

// Chart data point
export interface TemperatureDataPoint {
    timestamp: Date;
    temperature: number;
    humidity: number;
}

// Alert summary
export interface AlertSummary {
    id: string;
    deviceId: string;
    deviceName: string;
    alertType: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    createdAt: Date;
    facilityName: string | null;
    wilayaName: string;
}

// User session data
export interface UserSession {
    userId: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    wilayaId?: string | null;
    baladiyaId?: string | null;
    wilayaName?: string;
    baladiyaName?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Filter options
export interface DeviceFilters {
    status?: HealthStatus;
    type?: DeviceType;
    wilayaId?: string;
    baladiyaId?: string;
    facilityId?: string;
    search?: string;
}
