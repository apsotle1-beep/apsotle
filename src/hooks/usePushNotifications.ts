import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  // Check current permission status
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // Convert VAPID key from base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Register service worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return registration;
  };

  // Subscribe to push notifications
  const subscribeToNotifications = useCallback(async () => {
    try {
      if (!isSupported) {
        throw new Error('Push notifications are not supported');
      }

      if (!user) {
        throw new Error('User must be logged in');
      }

      const registration = await registerServiceWorker();
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get the push subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        const subscriptionData = existingSubscription.toJSON() as PushSubscriptionData;
        setSubscription(subscriptionData);
        return existingSubscription;
      }

      // Read public VAPID key from environment (must be URL-safe base64)
      const vapidPublicKey = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY as string | undefined;
      if (!vapidPublicKey) {
        throw new Error('Missing VAPID public key. Set VITE_VAPID_PUBLIC_KEY in your environment.');
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const subscriptionData = subscription.toJSON() as PushSubscriptionData;

      // Save the subscription to your database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert([
          {
            endpoint: subscriptionData.endpoint,
            p256dh: subscriptionData.keys.p256dh,
            auth: subscriptionData.keys.auth,
            user_id: user.id
          }
        ]);

      if (error) {
        console.error('Error saving push subscription:', error);
        throw error;
      }

      setSubscription(subscriptionData);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }, [isSupported, user]);

  // Unsubscribe from push notifications
  const unsubscribeFromNotifications = useCallback(async () => {
    try {
      if (!subscription) return;

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      // Remove from database
      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);
      }

      setSubscription(null);
      setPermission('default');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }, [subscription, user]);

  // Send a test notification
  const sendTestNotification = useCallback(() => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from your store!',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }, [permission]);

  // Check if user has notifications enabled in their preferences
  const hasNotificationsEnabled = useCallback(() => {
    if (!user) return false;
    
    const meta = user.user_metadata as any;
    const prefs = meta?.preferences?.notifications || {};
    return prefs.messageNotifications ?? true;
  }, [user]);

  return {
    isSupported,
    permission,
    subscription,
    isSubscribed: !!subscription,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
    hasNotificationsEnabled
  };
};
