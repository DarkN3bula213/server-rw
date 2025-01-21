#!/bin/bash
set -e

until mongosh --host mongo1:27017 --eval "print(\"waited for connection\")"
do
  echo "Waiting for mongodb to be ready..."
  sleep 2
done

echo "MongoDB is ready" 