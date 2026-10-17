# Shri Amudha Small Finance – Backend Service

NestJS + MongoDB 7 Replica Set backend microservice for the Loan Management System.

## Features
- **ACID Transactions**: MongoDB 7 replica set ensures financial consistency across payments, schedules, and sequential receipts.
- **Dynamic RBAC & Restrictions**: Global `PermissionsGuard` enforces role permissions (`SUPER_ADMIN`, `MANAGER`, `SALESPERSON`) minus manager restrictions (deny-wins).
- **Data Tenancy**: Mongoose scope plugin enforces user data visibility at query level.
- **Application Encryption**: AES-256-GCM encryption for Aadhaar, fingerprint, CIBIL, and bank data.
- **Deterministic HMAC**: Searchable hashes (`aadhaarHash`, `panHash`) with unique partial indexes.
- **Financial Calculation**: Shared Money utility with integer paise representation.

## Setup & Running

```bash
# Install dependencies
npm install

# Start local MongoDB replica set & Redis via root docker-compose
docker compose up -d mongodb redis minio

# Export contract (Swagger & permissions catalog)
npm run export:contract

# Seed database
npm run seed

# Start server in dev mode
npm run start:dev
```
