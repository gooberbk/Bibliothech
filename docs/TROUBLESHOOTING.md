# Clerk Authentication Troubleshooting Guide

This guide helps you diagnose and resolve common issues with Clerk authentication in the Bibliothech application.

## Environment Configuration Issues

### Issue: "Missing Clerk environment variables"

**Symptoms**:
- Application fails to start
- Error messages about missing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or `CLERK_SECRET_KEY`

**Solutions**:
1. Check that `.env` file exists in project root
2. Verify all required Clerk variables are present:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY
   NEXT_PUBLIC_CLERK_SIGN_IN_URL
   NEXT_PUBLIC_CLERK_SIGN_UP_URL
   CLERK_WEBHOOK_SECRET
   ```
3. Restart development server after adding variables
4. Check for typos in variable names

### Issue: "Invalid Clerk API keys"

**Symptoms**:
- Authentication fails with API key errors
- Clerk components show "Invalid API key" messages

**Solutions**:
1. Verify keys are correct from Clerk Dashboard
2. Ensure you're using test keys for development
3. Check that keys aren't truncated or have extra spaces
4. Verify `NEXT_PUBLIC_` prefix is on public key only
5. Regenerate keys if compromised

### Issue: Environment variables not loading

**Symptoms**:
- Application starts but authentication doesn't work
- Clerk components show loading state indefinitely

**Solutions**:
1. Restart development server after environment changes
2. Check that `.env.local` is not conflicting with `.env`
3. Verify Next.js is reading environment variables
4. Check for syntax errors in `.env` files

## Clerk Integration Issues

### Issue: Clerk components not rendering

**Symptoms**:
- Sign-in/sign-up pages show blank or loading
- Auth buttons don't appear

**Solutions**:
1. Verify `ClerkProvider` wraps the application in `app/layout.tsx`
2. Check that Clerk SDK is properly installed
3. Verify environment variables are loaded
4. Check browser console for JavaScript errors
5. Ensure Clerk domain is accessible

### Issue: "ClerkProvider not found"

**Symptoms**:
- Error about missing ClerkProvider
- Authentication components fail to load

**Solutions**:
1. Check that `ClerkProvider` is in `app/layout.tsx`
2. Verify import statement: `import { ClerkProvider } from '@clerk/nextjs'`
3. Ensure ClerkProvider wraps the entire app
4. Check for multiple layout files

### Issue: Auth state not updating

**Symptoms**:
- User signs in but UI doesn't update
- Auth buttons don't change after authentication

**Solutions**:
1. Verify Clerk hooks are used correctly: `useAuth()`, `useUser()`
2. Check that components are marked as `'use client'`
3. Verify middleware isn't interfering
4. Check for client-side errors in console

## Webhook Issues

### Issue: Webhook not receiving events

**Symptoms**:
- User created in Clerk but not in database
- No webhook logs in server console

**Solutions**:
1. Verify webhook URL is correct in Clerk Dashboard
2. Check that webhook secret matches environment variable
3. Ensure server is accessible from internet (use ngrok for local dev)
4. Check webhook is enabled for correct events
5. Verify webhook endpoint path: `/api/webhooks/clerk`

### Issue: "Webhook signature verification failed"

**Symptoms**:
- Webhook events fail with signature errors
- Server logs show verification failures

**Solutions**:
1. Verify webhook secret is correct
2. Check secret doesn't have extra spaces or characters
3. Ensure you're using the correct secret for environment
4. Verify Svix library is properly configured
5. Check webhook timestamp (clock skew issues)

### Issue: Webhook processing errors

**Symptoms**:
- Webhook received but database sync fails
- Server logs show database errors

**Solutions**:
1. Check database connection is working
2. Verify Prisma schema is up to date
3. Check user sync function for errors
4. Ensure required fields are present in webhook data
5. Review error logs for specific issues

## Database Sync Issues

### Issue: User not created in database

**Symptoms**:
- User signs up but doesn't appear in database
- Webhook shows success but no database record

**Solutions**:
1. Check webhook handler logs for errors
2. Verify database connection string is correct
3. Ensure Prisma client is generated: `npx prisma generate`
4. Check that User model has required fields
5. Verify unique constraints aren't violated

### Issue: User data not syncing correctly

**Symptoms**:
- User updates in Clerk but not in database
- Data mismatch between Clerk and database

**Solutions**:
1. Check webhook is receiving `user.updated` events
2. Verify sync function handles all user fields
3. Check that field names match between Clerk and database
4. Ensure `lastSyncAt` is being updated
5. Check for database constraint violations

### Issue: Duplicate user records

**Symptoms**:
- Multiple records for same user in database
- Unique constraint errors

**Solutions**:
1. Check that `clerkId` is properly set as unique
2. Verify webhook isn't creating duplicate users
3. Check sync function uses upsert logic
4. Ensure migration from neonId to clerkId is complete
5. Review webhook handler for duplicate prevention

## Authentication Flow Issues

### Issue: Sign-in redirects not working

**Symptoms**:
- User signs in but doesn't redirect properly
- Redirect loops occur

**Solutions**:
1. Check `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is correct
2. Verify middleware redirect logic
3. Check for circular redirects
4. Ensure redirect URLs are absolute
5. Review Clerk Dashboard redirect settings

### Issue: Session not persisting

**Symptoms**:
- User signs in but session is lost on refresh
- Frequent sign-in prompts

**Solutions**:
1. Check cookie settings in Clerk Dashboard
2. Verify domain is correct for cookies
3. Check for browser cookie restrictions
4. Ensure ClerkProvider is configured correctly
5. Review session timeout settings

### Issue: Protected routes not working

**Symptoms**:
- Unauthenticated users can access protected routes
- Middleware not redirecting properly

**Solutions**:
1. Verify middleware.ts is properly configured
2. Check route patterns in middleware matcher
3. Ensure auth middleware is imported correctly
4. Check that public routes are properly defined
5. Review middleware logic for bugs

## Performance Issues

### Issue: Slow authentication

**Symptoms**:
- Sign-in/sign-up takes long time
- Auth state loading slowly

**Solutions**:
1. Check network latency to Clerk servers
2. Verify database connection is fast
3. Optimize webhook processing if slow
4. Check for unnecessary re-renders
5. Consider implementing caching

### Issue: Webhook processing delays

**Symptoms**:
- Webhook events processed slowly
- Database sync lags behind Clerk

**Solutions**:
1. Optimize database queries in webhook handler
2. Implement async processing for heavy operations
3. Add database indexes for frequently queried fields
4. Consider webhook processing queue
5. Monitor webhook delivery times

## Security Issues

### Issue: CORS errors

**Symptoms**:
- Browser console shows CORS errors
- Webhook calls blocked by CORS policy

**Solutions**:
1. Verify CORS configuration in Clerk Dashboard
2. Check that your domain is whitelisted
3. Ensure correct CORS headers are set
4. Review webhook endpoint CORS configuration

### Issue: CSRF vulnerabilities

**Symptoms**:
- Potential CSRF attack vectors
- Missing CSRF protection

**Solutions**:
1. Implement CSRF token validation
2. Use Clerk's built-in CSRF protection
3. Verify SameSite cookie attributes
4. Check referrer policy headers

## Development Environment Issues

### Issue: Hot reload not working with Clerk

**Symptoms**:
- Changes to auth code not reflected
- Need to restart server frequently

**Solutions**:
1. Check that Clerk components are properly wrapped
2. Verify environment variables are hot-reloading
3. Consider using Clerk's development mode
4. Restart server after major changes

### Issue: ngrok webhook testing fails

**Symptoms**:
- Webhook testing with ngrok doesn't work
- Clerk can't reach local server

**Solutions**:
1. Verify ngrok is running correctly
2. Check ngrok URL is correct in Clerk Dashboard
3. Ensure ngrok tunnel is stable
4. Check firewall settings
5. Try alternative tunneling service

## Production Deployment Issues

### Issue: Authentication fails in production

**Symptoms**:
- Works in development but not in production
- Environment variable issues in production

**Solutions**:
1. Verify production environment variables are set
2. Check that production Clerk keys are used
3. Ensure production webhook URL is configured
4. Verify production database connection
5. Check production build configuration

### Issue: Webhook fails in production

**Symptoms**:
- Webhook works locally but not in production
- Production webhook endpoint not accessible

**Solutions**:
1. Verify production webhook URL is correct
2. Check production server is accessible
3. Ensure SSL/TLS is properly configured
4. Verify firewall allows webhook traffic
5. Check production webhook secret

## Debugging Tools

### Clerk Dashboard

Use Clerk Dashboard for debugging:
- User management
- Webhook delivery logs
- Session management
- Error logs
- API usage statistics

### Browser DevTools

Check browser console for:
- JavaScript errors
- Network requests
- Cookie information
- Local storage data
- Console logs from Clerk SDK

### Server Logs

Monitor server logs for:
- Webhook processing
- Database operations
- Authentication events
- Error messages
- Performance metrics

### Database Queries

Use database tools to:
- Verify user records
- Check sync status
- Monitor query performance
- Debug data issues

## Getting Help

### Clerk Support

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Discord Community](https://discord.gg/clerk)
- [Clerk GitHub Issues](https://github.com/clerkinc)

### Additional Resources

- Clerk Troubleshooting Guide
- Next.js Debugging Guide
- Prisma Debugging Guide
- Webhook Debugging Best Practices

## Common Error Messages

### "Missing publishable key"
**Cause**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` not set or incorrect
**Solution**: Add correct publishable key to environment variables

### "Invalid secret key"
**Cause**: `CLERK_SECRET_KEY` is incorrect or missing
**Solution**: Verify secret key from Clerk Dashboard

### "Webhook verification failed"
**Cause**: Webhook secret doesn't match or is missing
**Solution**: Update `CLERK_WEBHOOK_SECRET` with correct value

### "User not found in database"
**Cause**: Webhook didn't create user or sync failed
**Solution**: Check webhook logs and database connection

### "Route protection failed"
**Cause**: Middleware not configured correctly
**Solution**: Verify middleware.ts configuration

## Prevention Best Practices

1. **Environment Management**
   - Use different environment files for dev/staging/prod
   - Never commit secrets to version control
   - Use environment variable validation
   - Document all required variables

2. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor webhook delivery rates
   - Track authentication success/failure
   - Alert on critical failures

3. **Testing**
   - Test authentication flows regularly
   - Monitor webhook processing
   - Test after each deployment
   - Use automated testing where possible

4. **Documentation**
   - Keep this troubleshooting guide updated
   - Document known issues and solutions
   - Share knowledge with team
   - Maintain runbooks for common issues