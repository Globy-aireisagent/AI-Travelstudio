# Neon Database Setup Guide

## 1. Create Neon Account & Database

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project/database
3. Copy your connection string from the Neon dashboard

## 2. Set Environment Variable

Add your database URL to `.env.local`:
\`\`\`
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
\`\`\`

## 3. Run SQL Scripts in Neon Console

Go to your Neon dashboard → SQL Editor and run these scripts in order:

### Step 1: Create Tables
\`\`\`sql
-- Run the content from scripts/create-neon-tables.sql
\`\`\`

### Step 2: Insert Demo Data
\`\`\`sql
-- Run the content from scripts/insert-neon-demo-data.sql
\`\`\`

### Step 3: Verify Setup
\`\`\`sql
-- Run the content from scripts/verify-database-setup.sql
\`\`\`

## 4. Test Connection

After setup, test your connection by visiting:
- `/test-neon` - Test basic database connection
- `/feature-request` - Test feature request system
- `/agent-dashboard` - Test full dashboard

## Troubleshooting

If you get connection errors:
1. Check your DATABASE_URL is correct
2. Ensure your Neon database is not sleeping (free tier sleeps after inactivity)
3. Check the Neon dashboard for any issues

## What Gets Created

- **agencies** - Travel agencies
- **users** - System users (agents, clients, admins)
- **feature_requests** - Feature requests with voting
- **feature_votes** - User votes on features
- **feature_comments** - Comments on feature requests
- **bookings** - Travel bookings
- **travel_ideas** - Travel packages/ideas
- **webhook_events** - Webhook event log

## Demo Data Included

- 3 demo agencies
- 4 demo users (admin, agents, client)
- 6 feature requests with votes and comments
- 3 sample bookings
- 3 travel ideas

This gives you a fully functional system to test with!
