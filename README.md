# Shri Amudha Small Finance – Loan Management System

A complete, production-ready, enterprise Loan Management System designed specifically for daily, weekly, monthly, vehicle, and gold/silver collateral micro-lending operations.

## Architecture

The project is strictly separated into two independent top-level projects communicating exclusively via an OpenAPI HTTP/WebSocket contract:
- **`backend/`**: Node.js + NestJS + MongoDB 7 Replica Set (ACID transactions, change streams), Redis (BullMQ + permission cache), MinIO (S3 document storage), PDF generator, thermal ESC/POS generator.
- **`frontend/`**: React Native Expo mobile app (Android-first with EAS build, iOS-ready, offline SQLite sync, Bluetooth thermal printing, biometric lock) and React + Vite admin web panel.
- **`infra/`**: Docker Compose configuration for MongoDB replica set, Redis, MinIO, Nginx reverse proxy, and CI/CD workflows.
- **`docs/`**: Architecture specifications, ER diagrams, workflow state charts, RBAC matrix, and user manuals.

## Quick Start (Full Stack with Docker)

```bash
# 1. Clone repository
git clone https://github.com/shri-amudha/finance-app.git
cd finance-app

# 2. Start infrastructure (MongoDB Replica Set, Redis, MinIO, Backend, Web Admin)
docker compose up -d --build

# 3. Seed database with roles, workflows, forms, rate master, and demo users
docker compose exec backend npm run seed
```

## Running Standalone Locally

### 1. Backend (`backend/`)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
- API: `http://localhost:4000/api/v1`
- Swagger / OpenAPI Docs: `http://localhost:4000/docs`
- Export API Contract: `npm run export:contract`

### 2. Frontend Workspace (`frontend/`)
```bash
cd frontend
npm install
npm run sync:contract   # Syncs contract from backend/contract into frontend/shared/generated/

# Run React Native Mobile App
npm run dev:mobile

# Run React + Vite Admin Panel
npm run dev:web
```

## Demo Credentials (from Seed)
- **Super Admin**: `admin` / `Admin@12345` (Full access, P&L, Manager Restrictions, System Settings)
- **Manager (Unrestricted)**: `manager1` / `Manager@12345` (Full loan ops, approvals up to ₹1,00,000, collections, P&L)
- **Manager (P&L Restricted)**: `manager2` / `Manager@12345` (Operational loans only; P&L and Expenses blocked by Super Admin)
- **Salesperson (Field Agent)**: `sales1` / `Sales@12345` (Add Customer & Collect Cash only, Offline sync)

## Documentation Links
- [System Architecture](file:///docs/architecture.md)
- [RBAC & Permission Catalog](file:///docs/permissions.md)
- [Manager Restrictions Engine](file:///docs/restrictions.md)
- [Workflow State Diagrams](file:///docs/workflows.md)
- [Database Collections & ER Diagram](file:///docs/collections-er.md)
- [Mobile Build Guide (APK/AAB)](file:///docs/build-guide.md)
- [Production Deployment Guide](file:///docs/deployment.md)
- [Role-Wise User Manuals](file:///docs/user-manuals.md)
- [API Overview](file:///docs/api-overview.md)
