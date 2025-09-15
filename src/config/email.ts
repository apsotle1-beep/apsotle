// Email configuration for Resend
export const emailConfig = {
  // Resend API configuration
  resend: {
    apiKey: import.meta.env.VITE_RESEND_API_KEY || '',
    fromEmail: import.meta.env.VITE_FROM_EMAIL || 'noreply@yourdomain.com',
    fromName: import.meta.env.VITE_FROM_NAME || 'Your Store Name',
  },
  
  // Email templates configuration
  templates: {
    orderConfirmation: {
      subject: 'Order Confirmation - {{orderId}}',
      replyTo: import.meta.env.VITE_REPLY_TO_EMAIL || 'support@yourdomain.com',
    }
  },
  
  // Development settings
  development: {
    // Set to true to log emails instead of sending in development
    simulateEmails: import.meta.env.DEV && import.meta.env.VITE_SIMULATE_EMAILS !== 'false',
    // Log all email attempts
    logEmails: true,
  }
};

// Helper function to get the from email address
export const getFromEmail = () => {
  return `${emailConfig.resend.fromName} <${emailConfig.resend.fromEmail}>`;
};

// Helper function to check if emails should be simulated
export const shouldSimulateEmails = () => {
  return emailConfig.development.simulateEmails || !emailConfig.resend.apiKey;
};
