// AuthContext
// - Purpose: Provides JWT auth state across the app. Persists token in expo-secure-store.
// - Exports: AuthProvider (component), useAuth (hook)
// - useAuth returns: { token, loading, login(jwtToken), logout() }

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setToken } from '../api/authToken';

const TOKEN_KEY = 'auth_token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore persisted token so the user stays logged in across restarts.
  useEffect(() => {
    async function loadToken() {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          setToken(stored);
          setTokenState(stored);
        }
      } catch (e) {
        console.warn('Failed to load auth token:', e);
      } finally {
        setLoading(false);
      }
    }
    loadToken();
  }, []);

  async function login(jwtToken) {
    await SecureStore.setItemAsync(TOKEN_KEY, jwtToken);
    setToken(jwtToken);
    setTokenState(jwtToken);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setTokenState(null);
  }

  return (
    <AuthContext.Provider value={{ token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
