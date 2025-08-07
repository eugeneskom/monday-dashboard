# Monday.com App Setup Instructions

## 1. Register Your App with Monday.com

1. Go to [Monday.com Developers Portal](https://monday.com/developers)
2. Sign in with your Monday.com account
3. Click "Create App" 
4. Fill in the app details:
   - **App Name**: Monday Dashboard
   - **Description**: A dashboard for managing Monday.com boards
   - **App URL**: Your public URL (see step 2 below)
   - **Redirect URI**: Your public URL + `/auth/callback`

## 2. Set Up Public URL for Development

Since Monday.com needs to access your app via HTTPS, you'll need to expose your local development server:

### Option A: Using ngrok (Recommended)
```bash
# Install ngrok if you haven't already
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose your local server
ngrok http 3001
```

### Option B: Using localtunnel
```bash
# Install localtunnel
npm install -g localtunnel

# Start your Next.js app
npm run dev

# In another terminal, expose your local server
lt --port 3001 --subdomain your-app-name
```

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in the values from your Monday.com app registration:
   - `MONDAY_CLIENT_ID`: From your app settings
   - `MONDAY_CLIENT_SECRET`: From your app settings  
   - `NEXT_PUBLIC_APP_URL`: Your ngrok/localtunnel URL
   - `MONDAY_API_TOKEN`: Generate from Monday.com > Admin > API

## 4. Update App URLs in Monday.com

In your Monday.com app settings, update:
- **App URL**: `https://your-ngrok-url.ngrok.io`
- **Redirect URI**: `https://your-ngrok-url.ngrok.io/auth/callback`

## 5. Install Your App

1. In Monday.com, go to your workspace
2. Click the "+" button to add an integration
3. Find your app in "My Apps" section
4. Install it to a board or dashboard

## 6. Testing

Once configured, your app should:
- Load inside Monday.com iframe
- Receive context events via `monday.listen('context')`
- Have access to Monday.com data and APIs

## Troubleshooting

- **No console logs**: App must be accessed through Monday.com, not directly
- **CORS errors**: Check your CSP headers in next.config.ts
- **Authentication issues**: Verify client ID/secret and redirect URI match
