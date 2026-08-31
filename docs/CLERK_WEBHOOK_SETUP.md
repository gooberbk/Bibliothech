# Clerk Webhook Setup Guide

This guide explains how to configure Clerk webhooks for the Bibliothech application to enable real-time user synchronization between Clerk and your database.

## Webhook Endpoint

Your application is configured to receive Clerk webhooks at:
```
https://your-domain.com/api/webhooks/clerk
```

For local development, you'll need to use a tunnel service like ngrok.

## Supported Webhook Events

The application currently handles these Clerk webhook events:

- `user.created` - Creates a new user record in the database when a user signs up
- `user.updated` - Updates user information when changes are made in Clerk
- `user.deleted` - Removes the user record from the database when a user is deleted

## Setup Steps

### 1. Create Webhook in Clerk Dashboard

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your application
3. Go to **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Configure the webhook:
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Events**: Select `user.created`, `user.updated`, and `user.deleted`
   - **Description**: "Bibliothech user synchronization"

### 2. Get the Webhook Secret

1. After creating the webhook, Clerk will generate a webhook secret
2. Copy the webhook secret (starts with `whsec_`)
3. Update your environment variables:

```bash
# In .env and .env.local files
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

### 3. Local Development Setup

For local development, you need to expose your local server to the internet:

#### Using ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js development server: `npm run dev`
3. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`)
5. Create a webhook in Clerk Dashboard using the ngrok URL:
   ```
   https://abc123.ngrok.io/api/webhooks/clerk
   ```
6. Get the webhook secret and update your environment variables

#### Alternative: LocalTunnel

```bash
npx localtunnel --port 3000
```

### 4. Test the Webhook

1. Create a test user in Clerk Dashboard
2. Check if the user appears in your database
3. Update the user in Clerk Dashboard
4. Verify the changes are reflected in your database
5. Delete the test user in Clerk Dashboard
6. Confirm the user is removed from your database

## Webhook Handler Implementation

The webhook handler is located at `app/api/webhooks/clerk/route.ts` and:

- Verifies webhook signatures using Svix
- Parses webhook events
- Syncs user data with the database
- Handles errors gracefully

## Troubleshooting

### Webhook Not Triggering

- Verify the webhook URL is correct
- Check that the webhook secret matches in your environment
- Ensure your server is accessible from the internet
- Check Clerk Dashboard webhook delivery logs

### Database Sync Issues

- Check the webhook handler logs for errors
- Verify database connection is working
- Ensure Prisma schema is up to date
- Check that user sync functions are working correctly

### Signature Verification Failures

- Verify the webhook secret is correct
- Check that you're using the correct secret for the environment
- Ensure the Svix library is properly configured

## Security Considerations

- **Never commit webhook secrets to version control**
- **Use different secrets for development and production**
- **Rotate webhook secrets periodically**
- **Monitor webhook delivery logs for suspicious activity**
- **Implement rate limiting on webhook endpoints**

## Production Deployment

For production deployment:

1. Set up your production webhook URL in Clerk Dashboard
2. Use the production webhook secret in your production environment
3. Enable webhook retry policies in Clerk Dashboard
4. Set up monitoring for webhook failures
5. Configure alerts for webhook delivery issues

## Webhook Retry Policy

Configure Clerk to retry failed webhooks:

- **Initial retry**: 1 minute
- **Maximum retries**: 5
- **Backoff strategy**: Exponential
- **Timeout**: 30 seconds

## Monitoring and Logging

The webhook handler logs:

- Successful webhook processing
- Verification failures
- Database sync errors
- User creation/update/deletion events

Monitor these logs to ensure proper webhook operation.

## Additional Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/webhooks)
- [Svix Webhook Verification](https://svix.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
