// Test utility for email functionality
import { sendOrderConfirmationEmail } from '@/services/emailService';

export const testEmailFunctionality = async () => {
  const testOrderDetails = {
    orderId: 'TEST-ORDER-123',
    customer: {
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      email: 'test@example.com',
      deliveryAddress: '123 Test Street',
      city: 'Test City',
      province: 'Test Province',
      note: 'Please leave at front door'
    },
    items: [
      {
        id: 1,
        name: 'Test Product 1',
        price: 29.99,
        quantity: 2,
        image: '/placeholder.svg'
      },
      {
        id: 2,
        name: 'Test Product 2',
        price: 15.50,
        quantity: 1,
        image: '/placeholder.svg'
      }
    ],
    total: 75.48,
    orderDate: new Date().toISOString(),
    paymentMethod: 'Cash on Delivery (COD)'
  };

  console.log('🧪 Testing Resend email functionality...');
  console.log('📧 Test order details:', testOrderDetails);
  console.log('🔧 Configuration check:');
  console.log('  - Resend API Key:', import.meta.env.VITE_RESEND_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('  - From Email:', import.meta.env.VITE_FROM_EMAIL || 'Not set');
  console.log('  - Simulate Emails:', import.meta.env.VITE_SIMULATE_EMAILS || 'false');
  
  try {
    const result = await sendOrderConfirmationEmail(testOrderDetails);
    
    if (result) {
      console.log('✅ Email test completed successfully!');
      if (import.meta.env.VITE_SIMULATE_EMAILS === 'true' || !import.meta.env.VITE_RESEND_API_KEY) {
        console.log('📬 Check the console above for email simulation details');
        console.log('💡 To send real emails, set VITE_RESEND_API_KEY and VITE_SIMULATE_EMAILS=false');
      } else {
        console.log('📬 Real email sent via Resend! Check your inbox.');
      }
    } else {
      console.log('❌ Email test failed');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Email test error:', error);
    return false;
  }
};

// Make it available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testEmail = testEmailFunctionality;
}
