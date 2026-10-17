#!/bin/bash
set -e

TARGET_DIR="$1"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/shri_amudha_finance?replicaSet=rs0}"

if [ -z "$TARGET_DIR" ]; then
  echo "Usage: ./restore.sh <path_to_backup_directory>"
  exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Directory $TARGET_DIR does not exist."
  exit 1
fi

echo "WARNING: Restoring will overwrite existing data. Target: $TARGET_DIR"
mongorestore --uri="$MONGO_URI" --gzip --drop "$TARGET_DIR"

echo "Database restore completed successfully."
