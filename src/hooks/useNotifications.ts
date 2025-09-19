import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationData {
  type: 'order_confirmation' | 'order_update' | 'price_drop' | 'new_product' | 'marketing';
  recipientId: string;
  recipientEmail: string;
  subject: string;
  html: string;
  text?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();

  const sendNotification = useCallback(async (data: NotificationData) => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Check if recipient has notifications enabled for this type
      const { data: recipientProfile } = await supabase
        .from('user_profiles')
        .select('id, email, raw_user_meta_data')
        .eq('id', data.recipientId)
        .single();

      if (!recipientProfile) {
        console.warn('Recipient profile not found:', data.recipientId);
        return;
      }

      const prefs = (recipientProfile.raw_user_meta_data as any)?.preferences?.notifications || {};

      // Check if notifications are enabled for this type
      let shouldSend = false;
      switch (data.type) {
        case 'order_confirmation':
        case 'order_update':
          shouldSend = prefs.emailNotifications ?? true;
          break;
        case 'price_drop':
          shouldSend = prefs.priceDropAlerts ?? true;
          break;
        case 'new_product':
          shouldSend = prefs.newListingAlerts ?? true;
          break;
        case 'marketing':
          shouldSend = prefs.marketingEmails ?? false;
          break;
        default:
          shouldSend = prefs.emailNotifications ?? true;
      }

      if (!shouldSend) {
        console.log('Notifications disabled for user:', data.recipientId, 'type:', data.type);
        return;
      }

      // Send email notification
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          to: data.recipientEmail,
          subject: data.subject,
          html: data.html,
          text: data.text
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send notification');
      }

      console.log('Notification sent successfully:', result);
      return result;

    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }, []);

  const sendOrderConfirmation = useCallback(async (orderData: {
    orderId: string;
    customerEmail: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    deliveryAddress: string;
  }) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50;">Order Confirmation</h2>
        <p>Dear ${orderData.customerName},</p>
        <p>Thank you for your order! We've received your order and will deliver it to your address.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Total Amount:</strong> $${orderData.total.toFixed(2)}</p>
          <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>Order Items</h3>
          <ul>
            ${orderData.items.map(item => 
              `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`
            ).join('')}
          </ul>
        </div>

        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for choosing our store!</p>
      </div>
    `;

    const text = `
Order Confirmation

Dear ${orderData.customerName},

Thank you for your order! We've received your order and will deliver it to your address.

Order Details:
- Order ID: ${orderData.orderId}
- Total Amount: $${orderData.total.toFixed(2)}
- Delivery Address: ${orderData.deliveryAddress}

Order Items:
${orderData.items.map(item => 
  `- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

We'll send you another email when your order ships.
Thank you for choosing our store!
    `;

    // For order confirmations, we'll use the existing order confirmation function
    // But we can also send a general notification if needed
    return {
      success: true,
      message: 'Order confirmation will be sent via order confirmation system'
    };
  }, []);

  const sendPriceDropAlert = useCallback(async (productData: {
    productId: string;
    productName: string;
    oldPrice: number;
    newPrice: number;
    recipientId: string;
    recipientEmail: string;
  }) => {
    const discount = ((productData.oldPrice - productData.newPrice) / productData.oldPrice * 100).toFixed(0);
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF6B6B;">Price Drop Alert! 🔥</h2>
        <p>Great news! The price of an item you're interested in has dropped.</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0;">${productData.productName}</h3>
          <p style="font-size: 18px; margin: 10px 0;">
            <span style="text-decoration: line-through; color: #666;">$${productData.oldPrice.toFixed(2)}</span>
            <span style="color: #28a745; font-weight: bold; margin-left: 10px;">$${productData.newPrice.toFixed(2)}</span>
          </p>
          <p style="color: #28a745; font-weight: bold;">Save ${discount}%!</p>
        </div>

        <p>Don't miss out on this great deal!</p>
        <p>Click here to view the product and add it to your cart.</p>
      </div>
    `;

    const text = `
Price Drop Alert!

Great news! The price of an item you're interested in has dropped.

${productData.productName}
Was: $${productData.oldPrice.toFixed(2)}
Now: $${productData.newPrice.toFixed(2)}
Save ${discount}%!

Don't miss out on this great deal!
    `;

    return sendNotification({
      type: 'price_drop',
      recipientId: productData.recipientId,
      recipientEmail: productData.recipientEmail,
      subject: `Price Drop Alert: ${productData.productName}`,
      html,
      text
    });
  }, [sendNotification]);

  const sendNewProductAlert = useCallback(async (productData: {
    productId: string;
    productName: string;
    productDescription: string;
    price: number;
    recipientId: string;
    recipientEmail: string;
  }) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50;">New Product Alert! 🆕</h2>
        <p>We've just added a new product that might interest you!</p>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${productData.productName}</h3>
          <p style="color: #666; margin: 10px 0;">${productData.productDescription}</p>
          <p style="font-size: 18px; color: #4CAF50; font-weight: bold;">$${productData.price.toFixed(2)}</p>
        </div>

        <p>Check it out and see if it's something you'd like to add to your cart!</p>
      </div>
    `;

    const text = `
New Product Alert!

We've just added a new product that might interest you!

${productData.productName}
${productData.productDescription}
Price: $${productData.price.toFixed(2)}

Check it out and see if it's something you'd like to add to your cart!
    `;

    return sendNotification({
      type: 'new_product',
      recipientId: productData.recipientId,
      recipientEmail: productData.recipientEmail,
      subject: `New Product: ${productData.productName}`,
      html,
      text
    });
  }, [sendNotification]);

  const sendMarketingEmail = useCallback(async (marketingData: {
    subject: string;
    content: string;
    recipientId: string;
    recipientEmail: string;
  }) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50;">Special Offer! 🎉</h2>
        <div style="line-height: 1.6;">
          ${marketingData.content}
        </div>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          You're receiving this email because you subscribed to our marketing emails. 
          <a href="#" style="color: #4CAF50;">Unsubscribe</a>
        </p>
      </div>
    `;

    return sendNotification({
      type: 'marketing',
      recipientId: marketingData.recipientId,
      recipientEmail: marketingData.recipientEmail,
      subject: marketingData.subject,
      html,
      text: marketingData.content
    });
  }, [sendNotification]);

  return {
    sendNotification,
    sendOrderConfirmation,
    sendPriceDropAlert,
    sendNewProductAlert,
    sendMarketingEmail
  };
};
