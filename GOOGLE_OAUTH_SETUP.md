# Google OAuth 2.0 Setup Guide

This guide will help you set up Google OAuth 2.0 authentication for your e-commerce website using Supabase.

## Prerequisites

- A Google Cloud Console account
- A Supabase project (already configured in your app)

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - `https://zzuotnzbazewnqidrhsd.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
   - Save the Client ID and Client Secret

## Step 2: Configure Supabase Authentication

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" in the list and click "Configure"
5. Enable Google provider
6. Enter your Google OAuth credentials:
   - **Client ID**: From Step 1
   - **Client Secret**: From Step 1
7. Set the redirect URL to: `https://zzuotnzbazewnqidrhsd.supabase.co/auth/v1/callback`
8. Save the configuration

## Step 3: Update Site URL (Optional)

1. In Supabase Dashboard, go to "Authentication" > "URL Configuration"
2. Set your site URL to your production domain (e.g., `https://yourdomain.com`)
3. Add additional redirect URLs if needed

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to your website
3. Click the "Sign In" button in the header
4. Click "Continue with Google"
5. Complete the Google OAuth flow
6. You should be redirected back to your site and logged in

## Features Implemented

✅ **User Authentication Context**: Manages user state and authentication methods
✅ **Google OAuth Integration**: Seamless sign-in with Google accounts
✅ **Login Modal**: Clean, accessible login interface
✅ **User Menu**: Profile management and logout functionality
✅ **Auth Callback**: Handles OAuth redirects properly
✅ **Responsive Design**: Works on all device sizes
✅ **Error Handling**: Proper error messages and fallbacks

## Security Notes

- Never commit your Google OAuth credentials to version control
- Use environment variables for sensitive configuration in production
- Regularly rotate your OAuth credentials
- Monitor authentication logs in Supabase dashboard

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**:
   - Ensure the redirect URI in Google Console matches exactly with Supabase
   - Check for trailing slashes and protocol (http vs https)

2. **"Client ID not found" error**:
   - Verify the Client ID is correctly entered in Supabase
   - Ensure the Google+ API is enabled

3. **Authentication not persisting**:
   - Check that localStorage is enabled in your browser
   - Verify Supabase client configuration

4. **CORS errors**:
   - Add your domain to the authorized origins in Google Console
   - Check Supabase site URL configuration

## Next Steps

After setting up Google OAuth, you can:

1. Add more OAuth providers (GitHub, Facebook, etc.)
2. Implement user profile management
3. Add role-based access control
4. Set up email verification
5. Add social login buttons to checkout process

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify your Google OAuth configuration
3. Test with a fresh browser session
4. Check the browser console for error messages
