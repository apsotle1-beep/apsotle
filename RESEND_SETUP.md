# Resend Email Setup Guide

This guide will help you set up Resend for sending order confirmation emails in your e-commerce application.

## Prerequisites

- A Resend account (sign up at [resend.com](https://resend.com))
- Your domain verified with Resend
- A Resend API key

## Step 1: Create Resend Account and Get API Key

1. **Sign up for Resend**:
   - Go to [resend.com](https://resend.com)
   - Create a free account
   - Verify your email address

2. **Get your API Key**:
   - Go to [resend.com/api-keys](https://resend.com/api-keys)
   - Click "Create API Key"
   - Give it a name (e.g., "E-commerce App")
   - Copy the API key (starts with `re_`)

3. **Verify your domain** (for production):
   - Go to [resend.com/domains](https://resend.com/domains)
   - Add your domain (e.g., `yourdomain.com`)
   - Follow the DNS verification steps
   - Wait for verification to complete

## Step 2: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Resend Configuration
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=Your Store Name
VITE_REPLY_TO_EMAIL=support@yourdomain.com

# Development Settings
VITE_SIMULATE_EMAILS=false
```

**Important Notes**:
- Replace `yourdomain.com` with your actual domain
- For development, you can use `onboarding@resend.dev` as the from email
- Set `VITE_SIMULATE_EMAILS=false` to enable real email sending
- Never commit your `.env` file to version control

## Step 3: Test the Integration

### Option 1: Test via Admin Dashboard

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `/admin/dashboard`
3. Click "Test Email Functionality"
4. Check the browser console for email details

### Option 2: Test via Order Placement

1. Add items to your cart
2. Go to checkout
3. Fill in all required fields including email
4. Complete the order
5. Check your email inbox for the confirmation

### Option 3: Test via Browser Console

1. Open browser developer tools
2. Run: `testEmail()`
3. Check console for email simulation details

## Step 4: Deploy Edge Function (Optional)

If you want to use Supabase Edge Functions for email sending:

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Set environment variables for Edge Function**:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   supabase secrets set FROM_EMAIL=noreply@yourdomain.com
   supabase secrets set FROM_NAME=Your Store Name
   supabase secrets set REPLY_TO_EMAIL=support@yourdomain.com
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy send-order-confirmation
   ```

## Step 5: Production Configuration

### For Production Deployment

1. **Set up your domain**:
   - Verify your domain with Resend
   - Update `VITE_FROM_EMAIL` to use your verified domain
   - Update `VITE_REPLY_TO_EMAIL` to your support email

2. **Environment Variables**:
   - Set all environment variables in your hosting platform
   - Ensure `VITE_SIMULATE_EMAILS=false` for production

3. **Test thoroughly**:
   - Send test emails to different email providers
   - Check spam folders
   - Verify email formatting

## Email Features

### What's Included in Order Confirmation Emails

- **Professional HTML Design**: Clean, responsive layout
- **Order Details**: Order ID, date, payment method, total
- **Customer Information**: Name, address, phone, special instructions
- **Itemized List**: All products with quantities, prices, and images
- **Delivery Information**: Expected delivery date and address
- **Contact Information**: Customer support details
- **Plain Text Fallback**: For email clients that don't support HTML

### Email Template Customization

You can customize the email templates by editing:

- **HTML Template**: `generateOrderConfirmationHTML()` in `src/services/emailService.ts`
- **Text Template**: `generateOrderConfirmationText()` in `src/services/emailService.ts`
- **Subject Line**: `emailConfig.templates.orderConfirmation.subject` in `src/config/email.ts`

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**:
   - Check that your API key is correct
   - Ensure the API key starts with `re_`
   - Verify the key is active in your Resend dashboard

2. **"Domain not verified" Error**:
   - Verify your domain in Resend dashboard
   - Wait for DNS propagation (can take up to 24 hours)
   - Use `onboarding@resend.dev` for testing

3. **Emails going to spam**:
   - Set up SPF, DKIM, and DMARC records
   - Use a verified domain
   - Avoid spam trigger words in subject/content

4. **"Rate limit exceeded" Error**:
   - Resend free tier has limits
   - Consider upgrading to a paid plan
   - Implement rate limiting in your app

### Debug Mode

Enable debug logging by setting:
```env
VITE_SIMULATE_EMAILS=true
```

This will log email details to the console instead of sending actual emails.

### Check Email Status

You can monitor email delivery in your Resend dashboard:
- Go to [resend.com/emails](https://resend.com/emails)
- View sent emails and their status
- Check for delivery issues

## Resend Pricing

- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pro Plan**: $20/month for 50,000 emails
- **Business Plan**: $80/month for 200,000 emails

See [resend.com/pricing](https://resend.com/pricing) for current pricing.

## Security Best Practices

1. **Never expose API keys**:
   - Use environment variables
   - Never commit `.env` files
   - Use different keys for development/production

2. **Validate email addresses**:
   - Check email format before sending
   - Handle invalid emails gracefully

3. **Rate limiting**:
   - Implement rate limiting to prevent abuse
   - Monitor email sending patterns

4. **Error handling**:
   - Log errors appropriately
   - Don't expose sensitive information in error messages

## Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: [resend.com/support](https://resend.com/support)
- **Community Discord**: [resend.com/discord](https://resend.com/discord)

## Next Steps

1. Set up your Resend account and get your API key
2. Configure your environment variables
3. Test the email functionality
4. Deploy to production with your verified domain
5. Monitor email delivery and performance

Your order confirmation emails are now ready to go! 🎉
