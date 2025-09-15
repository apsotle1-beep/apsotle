// Import supabase client
import { supabase } from '@/integrations/supabase/client';
import { Resend } from 'resend';
import { emailConfig, getFromEmail, shouldSimulateEmails } from '@/config/email';

interface OrderDetails {
  orderId: string;
  customer: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    deliveryAddress: string;
    city: string;
    province: string;
    note?: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total: number;
  orderDate: string;
  paymentMethod: string;
}

// Initialize Resend client only if API key is available
const resend = emailConfig.resend.apiKey ? new Resend(emailConfig.resend.apiKey) : null;

// Generate email templates
const generateOrderConfirmationHTML = (orderDetails: OrderDetails): string => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 28px;
        }
        .success-icon {
            font-size: 48px;
            color: #4CAF50;
            margin-bottom: 10px;
        }
        .order-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .order-info h2 {
            color: #333;
            margin-top: 0;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        .info-label {
            font-weight: bold;
            color: #666;
        }
        .info-value {
            color: #333;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        .item-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 5px;
        }
        .total-section {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
        }
        .delivery-info {
            background-color: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .delivery-info h3 {
            color: #2e7d32;
            margin-top: 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            background-color: #f0f8ff;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order. We've received your order and will deliver it to your address.</p>
        </div>

        <div class="order-info">
            <h2>Order Information</h2>
            <div class="info-row">
                <span class="info-label">Order ID:</span>
                <span class="info-value">${orderDetails.orderId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date(orderDetails.orderDate).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${orderDetails.paymentMethod}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="info-value">$${orderDetails.total.toFixed(2)}</span>
            </div>
        </div>

        <div class="delivery-info">
            <h3>Delivery Information</h3>
            <p><strong>Delivery Address:</strong></p>
            <p>
                ${orderDetails.customer.fullName}<br>
                ${orderDetails.customer.deliveryAddress}<br>
                ${orderDetails.customer.city}, ${orderDetails.customer.province}
            </p>
            <p><strong>Contact:</strong> ${orderDetails.customer.phoneNumber}</p>
            ${orderDetails.customer.note ? `<p><strong>Special Instructions:</strong> ${orderDetails.customer.note}</p>` : ''}
            <p><strong>Expected Delivery:</strong> ${deliveryDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
        </div>

        <h2>Order Items</h2>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderDetails.items.map(item => `
                    <tr>
                        <td>
                            <img src="${item.image}" alt="${item.name}" class="item-image">
                            <strong>${item.name}</strong>
                        </td>
                        <td>${item.quantity}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <h3>Order Total</h3>
            <div class="total-amount">$${orderDetails.total.toFixed(2)}</div>
            <p>Cash on Delivery - Pay when you receive your order</p>
        </div>

        <div class="contact-info">
            <h3>Need Help?</h3>
            <p>If you have any questions about your order, please contact our customer service team.</p>
            <p><strong>Customer Support:</strong> Available 24/7</p>
        </div>

        <div class="footer">
            <p>Thank you for choosing our store!</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
  `;
};

const generateOrderConfirmationText = (orderDetails: OrderDetails): string => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return `
ORDER CONFIRMATION

Thank you for your order! We've received your order and will deliver it to your address.

ORDER INFORMATION
================
Order ID: ${orderDetails.orderId}
Order Date: ${new Date(orderDetails.orderDate).toLocaleDateString()}
Payment Method: ${orderDetails.paymentMethod}
Total Amount: $${orderDetails.total.toFixed(2)}

DELIVERY INFORMATION
===================
Delivery Address:
${orderDetails.customer.fullName}
${orderDetails.customer.deliveryAddress}
${orderDetails.customer.city}, ${orderDetails.customer.province}

Contact: ${orderDetails.customer.phoneNumber}
${orderDetails.customer.note ? `Special Instructions: ${orderDetails.customer.note}` : ''}

Expected Delivery: ${deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}

ORDER ITEMS
===========
${orderDetails.items.map(item => 
  `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

TOTAL: $${orderDetails.total.toFixed(2)}
Payment: Cash on Delivery - Pay when you receive your order

Need Help?
==========
If you have any questions about your order, please contact our customer service team.
Customer Support: Available 24/7

Thank you for choosing our store!
  `;
};

export const sendOrderConfirmationEmail = async (orderDetails: OrderDetails): Promise<boolean> => {
  try {
    // Check if customer has email
    if (!orderDetails.customer.email) {
      console.log('No email provided for order confirmation');
      return false;
    }

    // Check if we should simulate emails (development mode or no API key)
    if (shouldSimulateEmails() || !emailConfig.resend.apiKey) {
      console.log('=== SIMULATED EMAIL SENDING (Resend) ===');
      console.log('To:', orderDetails.customer.email);
      console.log('Subject: Order Confirmation - ' + orderDetails.orderId);
      console.log('From:', getFromEmail());
      console.log('Order Details:', {
        orderId: orderDetails.orderId,
        customerName: orderDetails.customer.fullName,
        total: orderDetails.total,
        itemCount: orderDetails.items.length
      });
      console.log('===============================');

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    // Use Supabase Edge Function for email sending (required due to CORS restrictions)
    try {
      const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
        body: {
          orderDetails,
          recipientEmail: orderDetails.customer.email,
        },
      });

      if (error) {
        console.error('Error sending email via Edge Function:', error);
        return false;
      }

      console.log('Order confirmation email sent successfully via Edge Function:', data);
      return true;
    } catch (edgeFunctionError) {
      console.error('Edge Function error:', edgeFunctionError);
      console.log('Note: Direct Resend calls from browser are blocked by CORS. Please deploy the Edge Function.');
      return false;
    }
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    return false;
  }
};
