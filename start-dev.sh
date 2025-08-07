#!/bin/bash

echo "🚀 Starting Monday.com App Development Setup"
echo "==========================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please copy .env.example to .env.local and fill in your values."
    exit 1
fi

# Start Next.js development server in background
echo "📦 Starting Next.js development server..."
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 3001 --log=stdout &
NGROK_PID=$!

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the ngrok HTTPS URL from above"
echo "2. Update your .env.local with NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io"
echo "3. Register your app at https://monday.com/developers"
echo "4. Use the ngrok URL as your App URL and Redirect URI"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "kill $SERVER_PID $NGROK_PID 2>/dev/null" EXIT
wait
