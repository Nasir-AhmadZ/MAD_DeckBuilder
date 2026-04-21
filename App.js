// App
// - Purpose: Application entry point. Sets up auth context and React Navigation.
//   Shows Login/Register screens when unauthenticated, main app screens when authenticated.

import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import DeckBuildScreen from './screens/DeckBuildScreen';
import DeckDetailScreen from './screens/DeckDetailScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { token, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          // Authenticated screens
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="DeckBuild" component={DeckBuildScreen} options={{ title: 'Deck Builder' }} />
            <Stack.Screen name="DeckDetail" component={DeckDetailScreen} options={{ title: 'Deck' }} />
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
