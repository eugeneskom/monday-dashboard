#!/bin/bash

echo "🚀 Deploying to Vercel"
echo "====================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the deployment URL from above"
echo "2. Go to https://monday.com/developers"
echo "3. Update your app's App URL and Redirect URI with the Vercel URL"
echo "4. Add environment variables in Vercel dashboard:"
echo "   - MONDAY_API_TOKEN"
echo "   - MONDAY_WEBHOOK_SECRET"
echo "   - NEXT_PUBLIC_APP_URL"
