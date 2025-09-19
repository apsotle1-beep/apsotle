import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Tag, ShoppingBag } from 'lucide-react';

const NotificationTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    sendPriceDropAlert,
    sendNewProductAlert,
    sendMarketingEmail
  } = useNotifications();
  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    sendTestNotification
  } = usePushNotifications();

  const handleTestPriceDrop = async () => {
    if (!user) return;

    try {
      await sendPriceDropAlert({
        productId: 'test-123',
        productName: 'Test Product',
        oldPrice: 100,
        newPrice: 80,
        recipientId: user.id,
        recipientEmail: user.email || 'test@example.com'
      });

      toast({
        title: "Price Drop Alert Sent",
        description: "Check your email for the price drop notification.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send price drop alert.",
        variant: "destructive",
      });
    }
  };

  const handleTestNewProduct = async () => {
    if (!user) return;

    try {
      await sendNewProductAlert({
        productId: 'new-456',
        productName: 'New Amazing Product',
        productDescription: 'This is a test product for notification testing.',
        price: 99.99,
        recipientId: user.id,
        recipientEmail: user.email || 'test@example.com'
      });

      toast({
        title: "New Product Alert Sent",
        description: "Check your email for the new product notification.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send new product alert.",
        variant: "destructive",
      });
    }
  };

  const handleTestMarketing = async () => {
    if (!user) return;

    try {
      await sendMarketingEmail({
        subject: 'Special Test Offer!',
        content: `
          <p>This is a test marketing email to demonstrate the notification system.</p>
          <p>Get <strong>20% off</strong> on all products this week!</p>
          <p>Use code: <code>TEST20</code></p>
        `,
        recipientId: user.id,
        recipientEmail: user.email || 'test@example.com'
      });

      toast({
        title: "Marketing Email Sent",
        description: "Check your email for the marketing notification.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send marketing email.",
        variant: "destructive",
      });
    }
  };

  const handleTestPush = () => {
    try {
      sendTestNotification();
      toast({
        title: "Test Push Notification Sent",
        description: "Check your browser for the push notification.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send push notification.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please sign in to test notifications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System Test
          </CardTitle>
          <CardDescription>
            Test the various notification types to ensure they're working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Notifications */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </h4>
              
              <Button 
                onClick={handleTestPriceDrop}
                variant="outline"
                className="w-full"
              >
                <Tag className="mr-2 h-4 w-4" />
                Test Price Drop Alert
              </Button>
              
              <Button 
                onClick={handleTestNewProduct}
                variant="outline"
                className="w-full"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Test New Product Alert
              </Button>
              
              <Button 
                onClick={handleTestMarketing}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Test Marketing Email
              </Button>
            </div>

            {/* Push Notifications */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Push Notifications
              </h4>
              
              {pushSupported ? (
                pushSubscribed ? (
                  <Button 
                    onClick={handleTestPush}
                    variant="outline"
                    className="w-full"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Test Push Notification
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enable push notifications in Settings to test them.
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Push notifications are not supported in this browser.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Make sure you have the appropriate notification settings enabled in your 
              <a href="/settings" className="text-primary hover:underline ml-1">Settings</a> page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTest;
