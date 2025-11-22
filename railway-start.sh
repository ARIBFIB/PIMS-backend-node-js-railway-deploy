#!/bin/bash

echo "🚀 Starting Railway deployment process..."

# Wait for database to be ready
echo "🔧 Waiting for database to be ready..."
node scripts/railway-setup.js
setup_result=$?
if [ $setup_result -ne 0 ]; then
  echo "❌ Database setup failed with exit code $setup_result"
  exit $setup_result
fi

# Run post-deploy script to ensure all tables are created
echo "🔧 Running post-deploy setup..."
node scripts/railway-post-deploy.js
post_deploy_result=$?
if [ $post_deploy_result -ne 0 ]; then
  echo "❌ Post-deploy setup failed with exit code $post_deploy_result"
  exit $post_deploy_result
fi

# Start the server
echo "🚀 Starting server..."
node server.js