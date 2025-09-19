import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, ShoppingBag, Tag, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import NotificationTest from '@/components/NotificationTest';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  newListingAlerts: boolean;
  messageNotifications: boolean;
  priceDropAlerts: boolean;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification
  } = usePushNotifications();

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const meta = user?.user_metadata as any;
    const saved = meta?.preferences?.notifications || {};
    return {
      emailNotifications: saved.emailNotifications ?? true,
      smsNotifications: saved.smsNotifications ?? true,
      marketingEmails: saved.marketingEmails ?? false,
      newListingAlerts: saved.newListingAlerts ?? true,
      messageNotifications: saved.messageNotifications ?? true,
      priceDropAlerts: saved.priceDropAlerts ?? true,
    };
  });

  // Sync when user metadata changes
  useEffect(() => {
    const meta = user?.user_metadata as any;
    const saved = meta?.preferences?.notifications || {};
    setNotificationSettings(prev => ({
      emailNotifications: saved.emailNotifications ?? prev.emailNotifications,
      smsNotifications: saved.smsNotifications ?? prev.smsNotifications,
      marketingEmails: saved.marketingEmails ?? prev.marketingEmails,
      newListingAlerts: saved.newListingAlerts ?? prev.newListingAlerts,
      messageNotifications: saved.messageNotifications ?? prev.messageNotifications,
      priceDropAlerts: saved.priceDropAlerts ?? prev.priceDropAlerts,
    }));
  }, [user?.id, user?.user_metadata]);

  const updateNotificationSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update local state immediately for better UX
      setNotificationSettings(prev => ({ ...prev, [key]: value }));

      // Get current user metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not found');

      const currentMeta = currentUser.user_metadata || {};
      const currentPrefs = currentMeta.preferences || {};
      const currentNotifications = currentPrefs.notifications || {};

      // Update the specific notification setting
      const updatedNotifications = {
        ...currentNotifications,
        [key]: value
      };

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMeta,
          preferences: {
            ...currentPrefs,
            notifications: updatedNotifications
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });

    } catch (error) {
      console.error('Error updating notification settings:', error);
      
      // Revert local state on error
      setNotificationSettings(prev => ({ ...prev, [key]: !value }));

      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          to: user.email,
          subject: 'Test Email - Notification Settings',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4CAF50;">Test Email Successful!</h2>
              <p>This is a test email to verify that your email notifications are working correctly.</p>
              <p>If you received this email, your notification settings are properly configured.</p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">
                This email was sent from your notification settings page.
              </p>
            </div>
          `
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Test Email Sent",
          description: "Check your inbox for the test email.",
        });
      } else {
        throw new Error(result.error || 'Failed to send test email');
      }

    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      if (enabled) {
        await subscribeToNotifications();
        toast({
          title: "Push Notifications Enabled",
          description: "You'll now receive push notifications in your browser.",
        });
      } else {
        await unsubscribeFromNotifications();
        toast({
          title: "Push Notifications Disabled",
          description: "You'll no longer receive push notifications.",
        });
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update push notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPushNotification = () => {
    try {
      sendTestNotification();
      toast({
        title: "Test Notification Sent",
        description: "Check your browser for the test notification.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please sign in to access your settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and notification settings.
          </p>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about updates and activities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            {/* Message Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="message-notifications" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you receive new messages
                </p>
              </div>
              <Switch
                id="message-notifications"
                checked={notificationSettings.messageNotifications}
                onCheckedChange={(checked) => updateNotificationSetting('messageNotifications', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            {/* New Listing Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-listing-alerts" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  New Listing Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Be notified when new products are listed
                </p>
              </div>
              <Switch
                id="new-listing-alerts"
                checked={notificationSettings.newListingAlerts}
                onCheckedChange={(checked) => updateNotificationSetting('newListingAlerts', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            {/* Price Drop Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="price-drop-alerts" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Price Drop Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when prices drop on items you're interested in
                </p>
              </div>
              <Switch
                id="price-drop-alerts"
                checked={notificationSettings.priceDropAlerts}
                onCheckedChange={(checked) => updateNotificationSetting('priceDropAlerts', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            {/* SMS Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive text message notifications (coming soon)
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={notificationSettings.smsNotifications}
                onCheckedChange={(checked) => updateNotificationSetting('smsNotifications', checked)}
                disabled={true} // Disabled until SMS is implemented
              />
            </div>

            <Separator />

            {/* Push Notifications */}
            {pushSupported && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Browser Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications in your browser even when the app is closed
                    </p>
                    {pushPermission === 'denied' && (
                      <p className="text-xs text-red-500">
                        Push notifications are blocked. Please enable them in your browser settings.
                      </p>
                    )}
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushSubscribed}
                    onCheckedChange={handlePushNotificationToggle}
                    disabled={isLoading || pushPermission === 'denied'}
                  />
                </div>

                <Separator />
              </>
            )}

            {/* Marketing Emails */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Marketing Emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and special offers
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) => updateNotificationSetting('marketingEmails', checked)}
                disabled={isLoading}
              />
            </div>

            {/* Test Buttons */}
            <div className="pt-4 space-y-3">
              {notificationSettings.emailNotifications && (
                <Button 
                  onClick={handleTestEmail} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Test Email'}
                </Button>
              )}
              
              {pushSupported && pushSubscribed && (
                <Button 
                  onClick={handleTestPushNotification} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Send Test Push Notification
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <p className="text-sm text-muted-foreground">{user.full_name || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Testing */}
        <NotificationTest />
      </div>
    </div>
  );
};

export default Settings;
