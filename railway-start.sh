#!/bin/bash

# Railway start script with enhanced error handling and debugging

set -e  # Exit on any error

echo "🚀 Starting Railway deployment process..."

# Function to handle errors
handle_error() {
    echo "❌ Error occurred in Railway start script at line $1"
    exit 1
}

# Set up error handling
trap 'handle_error $LINENO' ERR

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "⚠️  Not in project root, attempting to find it..."
    if [ -f "../package.json" ]; then
        cd ..
    elif [ -f "../../package.json" ]; then
        cd ../..
    else
        echo "❌ Cannot find package.json"
        exit 1
    fi
fi

echo "📂 Current directory: $(pwd)"

# Check if required environment variables are set
echo "🔍 Checking environment variables..."
if [ -z "$MYSQLHOST" ] || [ -z "$MYSQLUSER" ] || [ -z "$MYSQLPASSWORD" ] || [ -z "$MYSQLDATABASE" ]; then
    echo "❌ Required MySQL environment variables are not set"
    echo "MYSQLHOST: ${MYSQLHOST:-NOT SET}"
    echo "MYSQLUSER: ${MYSQLUSER:-NOT SET}"
    echo "MYSQLPASSWORD: ${MYSQLPASSWORD:-NOT SET}"
    echo "MYSQLDATABASE: ${MYSQLDATABASE:-NOT SET}"
    exit 1
fi

echo "✅ MySQL environment variables are set"

# Install dependencies with better error handling
echo "📦 Installing dependencies..."
if ! npm ci --prefer-offline --no-audit --no-fund --quiet; then
    echo "⚠️  npm ci failed, trying npm install..."
    if ! npm install --prefer-offline --no-audit --no-fund --quiet; then
        echo "❌ npm install failed"
        exit 1
    fi
fi

echo "✅ Dependencies installed successfully"

# Run database setup scripts
echo "🔧 Running database setup scripts..."

# Run the main post-deploy script
echo "🔧 Running main post-deploy script..."
if ! node scripts/railway-post-deploy.js; then
    echo "❌ Main post-deploy script failed"
    exit 1
fi

# Run the sub-category migration script
echo "🔧 Running sub-category migration script..."
if ! node scripts/add-subcategory-to-materials.js; then
    echo "❌ Sub-category migration script failed"
    exit 1
fi

echo "✅ All database setup scripts completed successfully"

# Start the application
echo "🚀 Starting the application..."
exec node server.js