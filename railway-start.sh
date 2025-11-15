#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
node scripts/railway-setup.js

# Start the server
echo "Starting server..."
node server.js