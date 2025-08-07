# Live Team Dashboard - Monday.com App Setup

## Overview
A real-time employee workload and payment calculation dashboard for Monday.com boards. The app is deployed on Vercel and provides live updates through webhooks.

## 🚀 Production Deployment (Current Setup)

### App URLs
- **Production App**: `https://monday-dashboard-mnoceabni-eugeneskoms-projects.vercel.app`
- **Repository**: `https://github.com/eugeneskom/monday-dashboard`
- **Platform**: Vercel (auto-deploys from main branch)

## 1. Monday.com App Configuration

### App Details
- **App Name**: Live Team Dashboard
- **Description**: Real-time employee workload and payment calculations from Monday.com boards
- **App URL**: `https://monday-dashboard-mnoceabni-eugeneskoms-projects.vercel.app`
- **Redirect URI**: `https://monday-dashboard-mnoceabni-eugeneskoms-projects.vercel.app/auth/callback`

### Required Credentials
```
Client ID: 5d265acf26737f438fd1626cfb668ad0
Client Secret: c4fa3541afaacd14d0514939edc88e88
API Token: [Your Monday.com API token]
```

## 2. Environment Variables (Vercel)

The following environment variables are configured in Vercel:

```bash
MONDAY_CLIENT_ID=5d265acf26737f438fd1626cfb668ad0
MONDAY_CLIENT_SECRET=c4fa3541afaacd14d0514939edc88e88
MONDAY_API_TOKEN=[Your API token]
NEXT_PUBLIC_APP_URL=https://monday-dashboard-mnoceabni-eugeneskoms-projects.vercel.app
```

## 3. Features

### ✅ Implemented
- **Real-time Dashboard**: Employee workload analysis with live updates
- **Payment Calculations**: Additional payment tracking based on task completion
- **Board Integration**: Connect multiple Monday.com boards
- **Live Updates**: Webhook-based real-time data synchronization
- **Mobile Responsive**: Works on all devices
- **Employee Management**: Dynamic salary management system

### 📊 Dashboard Tabs
1. **Employee Workload**: Real-time task breakdown by status and employee
2. **Additional Payments**: Payment calculations based on completed tasks
3. **Monday.com Employees**: Employee data import and management

## 4. How to Use

### For Board Integration
1. Add the app as a widget to any Monday.com board
2. Select boards to analyze
3. View real-time employee workload data
4. Monitor task progress and completion rates

### For Standalone Use
1. Visit: `https://monday-dashboard-mnoceabni-eugeneskoms-projects.vercel.app`
2. Select boards from your Monday.com workspace
3. Navigate between dashboard tabs
4. View live data updates automatically

## 5. Development Setup (Local)

### Prerequisites
```bash
Node.js 18+
Git
Monday.com account with API access
```

### Local Installation
```bash
# Clone repository
git clone https://github.com/eugeneskom/monday-dashboard.git
cd monday-dashboard

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

### Local Environment Variables
```bash
MONDAY_CLIENT_ID=5d265acf26737f438fd1626cfb668ad0
MONDAY_CLIENT_SECRET=c4fa3541afaacd14d0514939edc88e88
MONDAY_API_TOKEN=[Your API token]
NEXT_PUBLIC_APP_URL=http://localhost:3002
MONDAY_API_URL=https://api.monday.com/v3
```

## 6. Deployment

### Automatic Deployment
- **Platform**: Vercel
- **Trigger**: Push to `main` branch
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Manual Deployment
```bash
# Using Vercel CLI
npx vercel --prod
```

## 7. Troubleshooting

### Common Issues
- **API Errors**: Verify Monday.com API token has required permissions
- **Widget Not Loading**: Check if app URL is correctly configured in Monday.com
- **No Live Updates**: Ensure webhook endpoints are accessible
- **Permission Errors**: Verify app has access to selected boards

### Support
- Check browser console for detailed error messages
- Verify environment variables are properly set in Vercel
- Ensure Monday.com app configuration matches deployment URLs

## 8. Technical Stack

- **Frontend**: Next.js 15.4.5 with React
- **Styling**: Tailwind CSS (mobile-first responsive design)
- **Data Fetching**: SWR with Monday.com GraphQL API v2
- **Real-time Updates**: Server-Sent Events with webhook integration
- **Deployment**: Vercel with automatic GitHub integration
- **State Management**: React hooks with localStorage persistence
