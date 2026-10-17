#!/bin/bash
set -e

BACKUP_DIR="${BACKUP_PATH:-/backups}/$(date +%Y%m%d_%H%M%S)"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/shri_amudha_finance?replicaSet=rs0}"

echo "Starting automated database backup to ${BACKUP_DIR}..."
mkdir -p "$BACKUP_DIR"
mongodump --uri="$MONGO_URI" --gzip --out="$BACKUP_DIR"

echo "Backup completed successfully at ${BACKUP_DIR}."

# Enforce 30-day retention
echo "Cleaning up backups older than 30 days..."
find "${BACKUP_PATH:-/backups}" -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +
echo "Retention policy applied."
