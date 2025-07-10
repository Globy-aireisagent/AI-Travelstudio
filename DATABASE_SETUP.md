# Database Setup Guide

## Quick Setup

1. **Add Environment Variable**
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=https://wcofqyyppfyvdssrxctw.supabase.co
   \`\`\`

2. **Run SQL Scripts in Supabase**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste each SQL file content
   - Execute in this order:
     1. `create-feature-requests-table.sql`
     2. `create-bookings-table.sql`
     3. `create-webhook-tables.sql`

## What Gets Created

### Feature Requests System
- ✅ `feature_requests` - Main features table
- ✅ `feature_votes` - User voting system
- ✅ `feature_comments` - Comments on features
- ✅ Auto vote counting with triggers
- ✅ Demo data with 8 sample features

### User & Booking System
- ✅ `users` - User management
- ✅ `bookings` - Travel bookings
- ✅ `travel_ideas` - Travel ideas/packages
- ✅ Full JSONB support for complex data

### Webhook System
- ✅ `webhook_events` - Event logging
- ✅ `webhook_subscriptions` - Webhook management

## Features Available After Setup

1. **Feature Roadmap** (`/agent-dashboard`)
   - Vote on features
   - Filter by status/category
   - Search functionality
   - Real-time vote counting

2. **User Dashboard**
   - Personal bookings
   - Travel ideas
   - Analytics

3. **Admin Features**
   - Feature management
   - User management
   - Webhook monitoring

## Performance Optimizations

- ✅ Indexes on all frequently queried columns
- ✅ Automatic vote counting via triggers
- ✅ JSONB for flexible data storage
- ✅ Proper foreign key relationships

## Security

- ✅ UUID primary keys
- ✅ Proper data validation
- ✅ Unique constraints where needed
- ✅ Cascade deletes for data integrity

Your database is now production-ready! 🚀
