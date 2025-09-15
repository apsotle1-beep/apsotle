# Email Setup Guide

This guide explains how to set up email notifications for order confirmations in your e-commerce application.

## Current Implementation

The email functionality is currently implemented with a simulation mode that logs email details to the console. This allows you to test the order flow without requiring a full email service setup.

## Features Implemented

✅ **Email Service**: `src/services/emailService.ts` - Handles email sending logic
✅ **Order Integration**: Email sending is integrated into the checkout process
✅ **Email Templates**: HTML and text email templates with order details
✅ **UI Updates**: Order confirmation page shows email status
✅ **Edge Function**: Supabase Edge Function for production email sending

## How It Works

1. **Order Placement**: When a customer places an order with an email address
2. **Email Trigger**: The system automatically attempts to send a confirmation email
3. **Email Content**: Includes complete order details, delivery information, and items
4. **Fallback**: If email sending fails, the order still completes successfully

## Current Status (Simulation Mode)

The email service currently runs in simulation mode, which means:
- Email details are logged to the browser console
- No actual emails are sent
- Order confirmation page shows email status
- All functionality works without external dependencies

## Production Setup

To enable actual email sending, you have several options:

### Option 1: Supabase Edge Functions (Recommended)

1. **Deploy the Edge Function**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Deploy the function
   supabase functions deploy send-order-confirmation
   ```

2. **Update Email Service**:
   - Uncomment the Supabase Edge Function code in `src/services/emailService.ts`
   - Comment out the simulation code

3. **Configure Email Provider**:
   - Update the Edge Function to use your preferred email service (SendGrid, Resend, etc.)

### Option 2: Direct Email Service Integration

1. **Choose an Email Service**:
   - SendGrid
   - Resend
   - Nodemailer with SMTP
   - AWS SES

2. **Install Dependencies**:
   ```bash
   npm install @sendgrid/mail
   # or
   npm install resend
   # or
   npm install nodemailer
   ```

3. **Update Email Service**:
   - Replace the simulation code with your chosen email service
   - Add API keys to environment variables

### Option 3: Server-Side API Route

1. **Create API Route**: Create a server-side endpoint for sending emails
2. **Update Email Service**: Call your API endpoint instead of Supabase Edge Function

## Email Template Features

The email templates include:

- **Professional Design**: Clean, responsive HTML layout
- **Order Information**: Order ID, date, payment method, total
- **Customer Details**: Name, address, contact information
- **Itemized List**: All ordered items with quantities and prices
- **Delivery Information**: Expected delivery date and special instructions
- **Contact Information**: Customer support details
- **Fallback Text**: Plain text version for email clients that don't support HTML

## Testing

To test the email functionality:

1. **Place a Test Order**:
   - Add items to cart
   - Go to checkout
   - Fill in all required fields including email
   - Complete the order

2. **Check Console Logs**:
   - Open browser developer tools
   - Look for email simulation logs in the console
   - Verify all order details are logged correctly

3. **Verify UI Updates**:
   - Check that the order confirmation page shows email status
   - Ensure the email address is displayed correctly

## Environment Variables

For production setup, you'll need these environment variables:

```env
# For SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# For Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# For SMTP
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_email_password
```

## Customization

### Email Template Customization

Edit the email templates in `supabase/functions/send-order-confirmation/index.ts`:
- Modify `generateOrderConfirmationHTML()` for HTML template
- Modify `generateOrderConfirmationText()` for text template
- Update styling, colors, and layout as needed

### Email Content Customization

- Update email subject lines
- Modify email body content
- Add your company branding
- Include additional order information

## Troubleshooting

### Common Issues

1. **Email Not Sending**:
   - Check console logs for error messages
   - Verify email address format
   - Ensure email service is properly configured

2. **Edge Function Errors**:
   - Check Supabase function logs
   - Verify function deployment
   - Test function independently

3. **Template Issues**:
   - Validate HTML syntax
   - Test with different email clients
   - Check for missing variables

### Debug Mode

Enable debug logging by adding this to your email service:

```typescript
const DEBUG_EMAIL = true;

if (DEBUG_EMAIL) {
  console.log('Email service debug info:', {
    orderId: orderDetails.orderId,
    recipientEmail: orderDetails.customer.email,
    hasEmail: !!orderDetails.customer.email
  });
}
```

## Security Considerations

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Validate email addresses before sending
- Implement rate limiting for email sending
- Use HTTPS for all email-related requests

## Support

If you need help with email setup:
1. Check the console logs for error messages
2. Verify your email service configuration
3. Test with a simple email first
4. Check your email service provider's documentation
