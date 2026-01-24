# Healthy Tag | Cold Chain Monitoring & Compliance

Healthy Tag is a professional-grade IoT and AI-powered platform designed for real-time cold-chain compliance monitoring. It ensures the safety and integrity of vaccines, pharmaceuticals, and temperature-sensitive food supplies.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
The platform uses SQLite for local data storage and Prisma for ORM.
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database and seed demo data (Wilayas, Baladiyas, Devices)
npm run db:reset
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the platform.

## 🔐 Administrative Access

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `super@admin.com` | `pass` |
| **Wilaya Admin** | `alger@healthytag.dz` | `HealthyTag2026!` |

## ✨ Key Features

- **Real-Time Monitoring**: Live temperature and humidity tracking via GSM-connected IoT devices.
- **Enterprise Security**: JWT-based authentication with hierarchical role-based access control (RBAC).
- **AI-Powered Analytics**: Predictive failure detection and anomaly recognition.
- **Geolocation tracking**: Asset movement monitoring with GPS integration.
- **Regulatory Compliance**: Immutable audit trails and legal-grade reporting.

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS 4, Lucide Icons, Chart.js.
- **Backend**: Next.js API Routes, Prisma ORM, SQLite.
- **Auth**: JOSE (JWT), BcryptJS.
- **Maps**: Leaflet (SSR-disabled).

## 📁 Project Structure

- `src/app`: Application routes and UI components.
- `src/components`: Reusable UI elements (Dashboard cards, Charts, Maps).
- `src/lib`: Core logic (Authentication, Database, Health Status AI).
- `src/proxy.ts`: Authentication and routing protection.
- `prisma/`: Database schema and seeding scripts.

---
© 2026 Healthy Tag. Professional Cold Chain Solutions.
