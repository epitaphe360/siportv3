/**
 * PUSH NOTIFICATION SERVICE
 * Handles Firebase Cloud Messaging for web and mobile push notifications
 * 
 * Features:
 * - Register device tokens with Supabase
 * - Send targeted push notifications
 * - Handle notification permissions
 * - Support for in-app notifications
 * - Background message handling
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { supabase } from '../lib/supabase';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

class PushNotificationService {
  private app: any = null;
  private messaging: any = null;
  private isSupported = false;

  constructor() {
    // Check if Firebase Cloud Messaging is supported
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
  }

  /**
   * Initialize Firebase and set up message handlers
   */
  async initialize() {
    if (!this.isSupported) {
      console.warn('⚠️ Push notifications not supported on this browser');
      return false;
    }

    try {
      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(this.app);

      // Request permission from user
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ User denied notification permission');
        return false;
      }

      // Get device token
      const token = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log('✅ Firebase messaging token obtained:', token.substring(0, 20) + '...');
        // Register token with backend
        await this.registerToken(token);
      }

      // Set up foreground message handler
      onMessage(this.messaging, (payload) => {
        this.handleForegroundMessage(payload);
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Register device token in database
   */
  private async registerToken(token: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.warn('⚠️ User not authenticated, skipping token registration');
        return;
      }

      // Save or update token in notifications_devices table
      const { error } = await supabase
        .from('notifications_devices')
        .upsert({
          user_id: session.user.id,
          device_token: token,
          platform: this.getPlatform(),
          browser_name: this.getBrowserName(),
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'user_id,device_token'
        });

      if (error) {
        console.error('❌ Failed to register device token:', error);
        return;
      }

      console.log('✅ Device token registered in database');
    } catch (error) {
      console.error('❌ Error registering token:', error);
    }
  }

  /**
   * Handle foreground messages (when app is open)
   */
  private handleForegroundMessage(payload: any) {
    const { notification, data } = payload;

    // Create notification object
    const notificationData = {
      title: notification?.title || 'SIPORT 2026',
      body: notification?.body || '',
      icon: notification?.icon || '/logo.png',
      badge: '/badge-icon.png',
      tag: data?.type || 'default',
      timestamp: Date.now(),
      data: data || {},
    };

    // Show desktop notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data,
      });
    }

    // Also store in database for notification center
    this.storeNotification(notificationData);

    // Trigger custom event for app to handle
    window.dispatchEvent(
      new CustomEvent('siport:push-notification', { detail: notificationData })
    );
  }

  /**
   * Store notification in database
   */
  private async storeNotification(notification: any) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.user.id,
          title: notification.title,
          message: notification.body,
          type: notification.tag,
          data: notification.data,
          read: false,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Failed to store notification:', error);
      }
    } catch (error) {
      console.error('❌ Error storing notification:', error);
    }
  }

  /**
   * Send notification to specific user
   * 
   * This would be called from backend via Supabase Function
   * The function sends to Firebase Cloud Messaging
   */
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    type: 'appointment' | 'message' | 'alert' | 'reminder' = 'alert',
    data?: Record<string, string>
  ) {
    try {
      // Call Supabase Edge Function to send via FCM
      const response = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          notification: {
            title,
            body,
          },
          data: {
            type,
            ...data,
          },
        },
      });

      if (response.error) {
        console.error('❌ Failed to send notification:', response.error);
        return false;
      }

      console.log('✅ Notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send appointment notification
   */
  async sendAppointmentNotification(
    userId: string,
    appointmentId: string,
    visitorName: string,
    exhibitorName: string,
    status: 'confirmed' | 'pending' | 'rejected' | 'reminder'
  ) {
    const titles: Record<string, string> = {
      confirmed: '✅ Rendez-vous confirmé',
      pending: '⏳ Rendez-vous en attente',
      rejected: '❌ Rendez-vous refusé',
      reminder: '🔔 Rappel - Rendez-vous demain',
    };

    const bodies: Record<string, string> = {
      confirmed: `Votre rendez-vous avec ${exhibitorName} est confirmé`,
      pending: `Votre demande de rendez-vous avec ${exhibitorName} est en attente de confirmation`,
      rejected: `Votre rendez-vous avec ${exhibitorName} a été refusé`,
      reminder: `N'oubliez pas votre rendez-vous avec ${exhibitorName} demain !`,
    };

    return this.sendNotification(
      userId,
      titles[status] || 'Rendez-vous',
      bodies[status] || '',
      'appointment',
      {
        appointmentId,
        visitorName,
        exhibitorName,
        action: `/appointments/${appointmentId}`,
      }
    );
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(
    userId: string,
    senderName: string,
    preview: string
  ) {
    return this.sendNotification(
      userId,
      `💬 Nouveau message de ${senderName}`,
      preview,
      'message',
      {
        action: '/messages',
      }
    );
  }

  /**
   * Subscribe to notification updates
   */
  onNotificationReceived(callback: (notification: any) => void) {
    window.addEventListener('siport:push-notification', (event: any) => {
      callback(event.detail);
    });
  }

  /**
   * Get platform identifier
   */
  private getPlatform(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    return 'web';
  }

  /**
   * Get browser name
   */
  private getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Check if push notifications are supported
   */
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if user has granted permission
   */
  async hasPermission(): Promise<boolean> {
    if (!this.isSupported) return false;
    return Notification.permission === 'granted';
  }

  /**
   * Request permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('⚠️ Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return false;
    }
  }
}

// Export singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
