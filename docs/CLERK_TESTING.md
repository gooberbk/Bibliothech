# Clerk Authentication Testing Guide

This guide provides comprehensive testing procedures for the Clerk authentication integration in the Bibliothech application.

## Prerequisites

Before testing, ensure you have:

- ✅ Clerk environment variables configured in `.env` and `.env.local`
- ✅ Database connection working
- ✅ Development server running (`npm run dev`)
- ✅ Webhook configured in Clerk Dashboard (optional for basic auth testing)

## Manual Testing Procedures

### 1. Application Startup Test

**Objective**: Verify the application starts without errors

**Steps**:
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Check for environment variable errors
3. Verify no Clerk initialization errors in console
4. Confirm the application loads at `http://localhost:3000`

**Expected Results**:
- ✅ Server starts successfully
- ✅ No environment variable errors
- ✅ Clerk components load correctly
- ✅ No console errors related to authentication

### 2. Sign-Up Flow Test

**Objective**: Test user registration with Clerk

**Steps**:
1. Navigate to `http://localhost:3000`
2. Click "Inscription" (Sign Up) button
3. Enter user details:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
4. Complete the sign-up process
5. Verify redirection to home page or dashboard

**Expected Results**:
- ✅ Sign-up modal or page loads correctly
- ✅ Form validation works
- ✅ User is created in Clerk
- ✅ User is redirected appropriately
- ✅ User is authenticated (see auth buttons change)

**Database Verification**:
```sql
-- Check if user was created in database
SELECT * FROM "User" WHERE email = 'test@example.com';
```

### 3. Sign-In Flow Test

**Objective**: Test user login with Clerk

**Steps**:
1. Navigate to `http://localhost:3000`
2. Click "Connexion" (Sign In) button
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. Complete the sign-in process
5. Verify authentication state

**Expected Results**:
- ✅ Sign-in modal or page loads correctly
- ✅ Form validation works
- ✅ User is authenticated successfully
- ✅ Auth buttons show user profile and logout
- ✅ Protected routes are accessible

### 4. Session Persistence Test

**Objective**: Test that user sessions persist across page refreshes

**Steps**:
1. Sign in as a user
2. Refresh the page
3. Navigate to different pages
4. Check authentication state

**Expected Results**:
- ✅ User remains authenticated after refresh
- ✅ Session persists across navigation
- ✅ Auth state is consistent

### 5. Sign-Out Flow Test

**Objective**: Test user logout functionality

**Steps**:
1. Sign in as a user
2. Click "Déconnexion" (Sign Out) button
3. Verify redirection to home page
4. Check authentication state

**Expected Results**:
- ✅ User is signed out
- ✅ Redirected to home page
- ✅ Auth buttons show sign-in/sign-up
- ✅ Protected routes redirect to sign-in

### 6. Protected Route Test

**Objective**: Test that protected routes require authentication

**Steps**:
1. Sign out if currently signed in
2. Try to access `http://localhost:3000/admin`
3. Verify redirection to sign-in page
4. Sign in and try to access admin route again

**Expected Results**:
- ✅ Unauthenticated users are redirected to sign-in
- ✅ Authenticated users can access protected routes
- ✅ Role-based access control works (if implemented)

### 7. User Profile Test

**Objective**: Test user profile functionality

**Steps**:
1. Sign in as a user
2. Navigate to `/profile`
3. Verify profile information displays correctly
4. Check favorites and downloads sections

**Expected Results**:
- ✅ Profile page loads with user information
- ✅ User data from Clerk is displayed
- ✅ Favorites and downloads show correctly
- ✅ Activity link works

### 8. Settings Page Test

**Objective**: Test account settings functionality

**Steps**:
1. Sign in as a user
2. Navigate to `/settings`
3. Verify settings page loads
4. Test privacy controls (if implemented)

**Expected Results**:
- ✅ Settings page loads correctly
- ✅ Privacy controls work
- ✅ Links to Clerk account management work

## Webhook Testing

### 1. Local Webhook Testing with ngrok

**Objective**: Test webhooks in local development

**Prerequisites**:
- ngrok installed: `npm install -g ngrok`
- Development server running

**Steps**:
1. Start your development server:
   ```bash
   npm run dev
   ```
2. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Go to Clerk Dashboard → Webhooks
5. Create webhook with URL: `https://abc123.ngrok.io/api/webhooks/clerk`
6. Select events: `user.created`, `user.updated`, `user.deleted`
7. Copy the webhook secret and update `CLERK_WEBHOOK_SECRET` in `.env`
8. Restart your development server

### 2. User Creation Webhook Test

**Steps**:
1. Create a new user in Clerk Dashboard
2. Check your server logs for webhook processing
3. Verify user appears in database:
   ```sql
   SELECT * FROM "User" WHERE clerkId = 'user_clerk_id';
   ```

**Expected Results**:
- ✅ Webhook is received by your server
- ✅ User is created in database
- ✅ User data matches Clerk data
- ✅ No errors in server logs

### 3. User Update Webhook Test

**Steps**:
1. Update user information in Clerk Dashboard (change name, email)
2. Check server logs for webhook processing
3. Verify user is updated in database

**Expected Results**:
- ✅ Webhook is received
- ✅ User data is updated in database
- ✅ Changes match Clerk Dashboard

### 4. User Deletion Webhook Test

**Steps**:
1. Delete a test user in Clerk Dashboard
2. Check server logs for webhook processing
3. Verify user is removed from database

**Expected Results**:
- ✅ Webhook is received
- ✅ User is deleted from database
- ✅ Cascade deletion works (favorites, downloads)

## Error Handling Testing

### 1. Invalid Credentials Test

**Steps**:
1. Try to sign in with invalid credentials
2. Verify error message is displayed
3. Check that no authentication occurs

**Expected Results**:
- ✅ Error message is shown
- ✅ User is not authenticated
- ✅ No database errors

### 2. Network Error Test

**Steps**:
1. Disconnect from internet
2. Try to sign in
3. Verify appropriate error handling

**Expected Results**:
- ✅ Network error is handled gracefully
- ✅ User receives helpful error message
- ✅ Application doesn't crash

### 3. Webhook Failure Test

**Steps**:
1. Temporarily set invalid webhook secret
2. Trigger a webhook event
3. Verify error handling

**Expected Results**:
- ✅ Webhook verification fails safely
- ✅ Error is logged appropriately
- ✅ No data corruption occurs

## Integration Testing

### 1. End-to-End User Journey

**Steps**:
1. Sign up as new user
2. Navigate to profile
3. Add a resource to favorites
4. Download a resource
5. Check activity history
6. Sign out
7. Sign in again
8. Verify favorites and downloads persist

**Expected Results**:
- ✅ Complete user journey works
- ✅ Data persists across sessions
- ✅ Activity is tracked correctly

### 2. Admin Functionality Test

**Steps**:
1. Create admin user in database
2. Sign in as admin
3. Access admin routes
4. Perform admin actions (create resource, manage users)
5. Verify role-based access control

**Expected Results**:
- ✅ Admin can access admin routes
- ✅ Admin actions work correctly
- ✅ Regular users cannot access admin functions

## Performance Testing

### 1. Authentication Performance

**Steps**:
1. Measure sign-in time
2. Measure sign-up time
3. Check session verification performance
4. Test with multiple concurrent users

**Expected Results**:
- ✅ Sign-in completes in <2 seconds
- ✅ Sign-up completes in <3 seconds
- ✅ Session verification is fast
- ✅ No performance degradation with concurrent users

### 2. Database Sync Performance

**Steps**:
1. Test webhook processing time
2. Measure user sync performance
3. Test with bulk user operations

**Expected Results**:
- ✅ Webhook processing completes in <500ms
- ✅ User sync is efficient
- ✅ No database bottlenecks

## Troubleshooting Common Issues

### Issue: Clerk components not loading

**Solutions**:
- Verify environment variables are set
- Check that keys are correct
- Ensure ClerkProvider is in layout
- Check browser console for errors

### Issue: Webhook not receiving events

**Solutions**:
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure server is accessible from internet
- Check Clerk Dashboard webhook logs

### Issue: User not syncing to database

**Solutions**:
- Check webhook handler logs
- Verify database connection
- Ensure Prisma schema is up to date
- Check sync function implementation

### Issue: Session not persisting

**Solutions**:
- Check cookie settings
- Verify middleware configuration
- Check Clerk session settings
- Ensure ClerkProvider is properly configured

## Production Testing Checklist

Before deploying to production:

- ✅ Use production Clerk keys
- ✅ Configure production webhook URL
- ✅ Set up webhook monitoring
- ✅ Enable error tracking
- ✅ Configure rate limiting
- ✅ Test with production database
- ✅ Verify security headers
- ✅ Test SSL/TLS configuration
- ✅ Set up backup and recovery
- ✅ Configure monitoring and alerts

## Continuous Testing

### Automated Testing

Consider implementing:

- Unit tests for auth utilities
- Integration tests for webhook handler
- E2E tests with Playwright or Cypress
- Load testing for authentication endpoints

### Monitoring

Set up monitoring for:

- Authentication success/failure rates
- Webhook delivery success/failure
- Database sync performance
- Error rates and patterns

## Test Results Template

Use this template to document test results:

```
Test: [Test Name]
Date: [Date]
Tester: [Name]
Environment: [Development/Staging/Production]

Steps Performed:
1. [Step 1]
2. [Step 2]
...

Results:
✅ Pass / ❌ Fail

Notes:
[Additional observations]

Issues Found:
[Description of any issues]

Resolution:
[How issues were resolved]
```

## Additional Resources

- [Clerk Testing Documentation](https://clerk.com/docs/testing)
- [Clerk Webhooks Testing](https://clerk.com/docs/webhooks/testing)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Playwright Documentation](https://playwright.dev)
