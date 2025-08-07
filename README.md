# Live Team Dashboard for Monday.com

## Technical Requirements Implementation

### Core Functionality Status

#### 1. Multiple Board Integration
- Supports selection of multiple boards (2 or more)
- Combines data from all selected boards
- Board selection persists between sessions
- Shows board status with item counts

#### 2. Employee Workload Table
- Displays employee names from Monday.com boards
- Shows task counts by status:
  - IN PROGRESS
  - NEED REVIEW  
  - LEAD FEEDBACK
  - TO PACK
  - SENT
  - CLIENT FEEDBACK
  - READY FOR CLIENT
  - PAUSED
- Calculates overall workload (IN PROGRESS + NEED REVIEW)
- Tracks completed tasks (DONE, STOPPED)
- Integrates with Monday.com time tracking

#### 3. Additional Payments Calculation
- Formula: Salary - (Hours Spent × Hourly Rate)
- Predefined salary amounts:
  - Мохова - $500
  - Скорик - $1000  
  - Дьоміна - $1500
- Automatic calculation updates
- Editable salary management system

#### 4. Live Data Updates
- Webhook integration with Monday.com
- Server-Sent Events for real-time frontend updates
- Auto-refresh when board data changes
- Live connection status indicator
- Manual refresh option available

#### 5. Data Sources
- Direct Monday.com API integration
- Token-based authentication
- Multiple project board support

## Additional Features

### Enhanced Employee Management
- Automatic employee discovery from Monday.com person columns
- Department inference based on board names
- Hours worked calculation from time tracking data
- Project count per employee
- Employee data export functionality

### User Interface
- Task summary widget with project overview
- Completion rate calculations and display
- Color-coded status indicators
- Responsive design for mobile and desktop
- Real-time status indicators throughout the interface

### Technical Implementation
- Full TypeScript implementation with type safety
- Next.js 15 with Turbopack for development
- SWR for data fetching with automatic revalidation
- Local storage for user settings persistence
- Comprehensive error handling and loading states

## Architecture Details

### Monday.com Integration
- Custom GraphQL client for Monday.com API
- Bearer token authentication system
- SWR data fetching with webhook-triggered updates
- Real-time updates via webhook endpoints and Server-Sent Events

### Data Processing
- Automatic employee extraction from Person columns
- Status mapping to match required task statuses
- Time parsing from Monday.com format (HH:MM:SS)
- Multi-board data aggregation with deduplication

### Live Updates System
- Webhook endpoint at /api/webhooks/monday/route.ts
- Server-Sent Events for pushing updates to frontend
- Fallback to 30-second SWR polling when webhooks unavailable
- Real-time connection status display

### Payment Calculation
```javascript
additionalPayment = salary - (hoursSpent × hourlyRate)
where hourlyRate = salary / 160 (monthly hours)
```