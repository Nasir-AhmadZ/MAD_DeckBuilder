// App
// - Purpose: Application entry point. Sets up auth context and React Navigation.
//   Shows Login/Register screens when unauthenticated, main app screens when authenticated.

import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import InventoryScreen from './screens/InventoryScreen';
import DeckBuildScreen from './screens/DeckBuildScreen';
import DeckDetailScreen from './screens/DeckDetailScreen';
import ProductBasket from './screens/ProductBasket';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { token, loading } = useAuth();
  const navigationRef = useRef(null);

  useEffect(() => {
    // Navigate to the basket when the user taps a notification.
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response received:', response);
      console.log('[Notification tapped] navigating to basket');
      navigationRef.current?.navigate('ProductBasket');
    });
    return () => subscription.remove();
  }, []);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {token ? (
          // Authenticated screens
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
            <Stack.Screen name="DeckBuild" component={DeckBuildScreen} options={{ title: 'Deck Builder' }} />
            <Stack.Screen name="DeckDetail" component={DeckDetailScreen} options={{ title: 'Deck' }} />
            <Stack.Screen name="ProductBasket" component={ProductBasket} options={{ title: 'Basket' }} />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
