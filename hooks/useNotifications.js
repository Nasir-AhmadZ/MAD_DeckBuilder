// useNotifications
// - Purpose: Provide a lightweight notification helper hook for the app.
// - Behavior:
//    - Maintains an in-memory list of recent in-app notifications.
//    - Exposes helpers to add/clear notifications.

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    // Configure notification behavior when the app is in the foreground.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });

    // Request permission, checking current status first to avoid prompting unnecessarily.
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted!');
        return;
      }
      // Get the Expo push token for this device
      try {
        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId: 'b5341bb9-4e49-43a9-afe3-86eca9ac3a97', // from app.json > extra.eas.projectId
        });
        console.log('Expo Push Token:', pushTokenData);
        setExpoPushToken(pushTokenData.data);
      } catch (e) {
        console.error('Failed to get push token:', e);
      }
    }
    configurePushNotifications();
    
    // Android requires a notification channel — without this, notifications are silently ignored.
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }, []);


  // In-app list management
  function addNotification({ title = '', body = '', data = null }) {
    const entry = { id: String(Date.now()) + Math.random().toString(36).slice(2, 9), title, body, data, timestamp: Date.now() };
    setNotifications(prev => [entry, ...prev]);
    return entry;
  }

  function removeNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function clearNotifications() {
    setNotifications([]);
  }

  return {
    expoPushToken,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
}
