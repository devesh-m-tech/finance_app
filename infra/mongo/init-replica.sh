#!/bin/bash
set -e

echo "Waiting for MongoDB node to be ready..."
until mongosh --host mongodb:27017 --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 2
done

echo "Initiating MongoDB replica set rs0..."
mongosh --host mongodb:27017 --eval '
try {
  const status = rs.status();
  if (status.ok === 1) {
    console.log("Replica set already initialized.");
  }
} catch (e) {
  console.log("Initiating new replica set rs0...");
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongodb:27017" }
    ]
  });
  console.log("Replica set initiated successfully.");
}
'

echo "MongoDB replica set initialization complete."
