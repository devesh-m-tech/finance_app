# SHRI AMUDHA SMALL FINANCE - PRODUCTION DEPLOYMENT & INFRASTRUCTURE GUIDE

## 1. Production Architecture Overview

```mermaid
flowchart TD
    Client["Clients (Mobile App & Web Admin)"] -->|HTTPS (443)| Cloudflare["Cloudflare / CDN"]
    Cloudflare -->|SSL Termination| Nginx["Nginx Reverse Proxy"]
    
    subgraph AppServer ["Application Node (Docker / Kubernetes)"]
        Nginx -->|/api/*| NestBackend["NestJS Backend Instances (Cluster)"]
        Nginx -->|/*| WebStatic["Vite Web Admin Static Build"]
        
        NestBackend --> Redis[("Redis 7 (BullMQ + Cache)")]
        NestBackend --> MinIO[("MinIO / AWS S3 (Document Store)")]
    end

    subgraph DataTier ["Data Tier (High Availability)"]
        NestBackend --> MongoRS[("MongoDB 7 3-Node Replica Set")]
    end
```

---

## 2. Infrastructure Setup (Docker Compose)

The root `docker-compose.yml` provides a production-equivalent environment with:
1. **MongoDB 7 Replica Set**: Single-node replica set for development/staging; easily swap with MongoDB Atlas connection string in `backend/.env`.
2. **Redis 7**: Memory-efficient key-value cache and job queue broker.
3. **MinIO**: S3-compatible local object storage for customer KYC docs, photos, and generated PDFs.
4. **Backend**: NestJS application containerized with multi-stage Node 20/22 alpine build.
5. **Frontend Web**: Production static build served via Nginx.
6. **Reverse Proxy**: Nginx routing `/api` traffic to backend and root traffic to admin panel.

### Launching the Stack:
```bash
# Initialize replica set and start all services
docker compose up -d --build

# Run database seeds and initialize super admin
docker compose exec backend npm run seed
```

---

## 3. MongoDB Replica Set Initialization
To enable multi-document transactions and change streams, MongoDB must run as a replica set. The container runs `infra/mongo/init-replica.sh`:
```bash
mongosh --eval 'rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "mongodb:27017" }] })'
```

---

## 4. Backup & Disaster Recovery

### Automated Daily Backup (`infra/mongo/backup.sh`)
```bash
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mongodump --uri="$MONGODB_URI" --gzip --out="$BACKUP_DIR"
find /backups -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +
```

### Restore Drill (`infra/mongo/restore.sh`)
```bash
#!/bin/bash
mongorestore --uri="$MONGODB_URI" --gzip --drop "$1"
```
