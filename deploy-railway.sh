#!/bin/bash

echo "🚀 Deploying to Railway"
echo "======================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Initialize project
echo "🚀 Deploying to Railway..."
railway deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the deployment URL from Railway dashboard"
echo "2. Go to https://monday.com/developers"
echo "3. Update your app's App URL and Redirect URI"
echo "4. Add environment variables in Railway dashboard"
