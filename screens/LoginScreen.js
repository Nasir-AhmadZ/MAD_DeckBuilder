import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authApi from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const data = await authApi.login(email.trim(), password); // Call the login API, which returns a JWT token
      await login(data.token); // Store the token and update auth state
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <Text style={styles.appTitle}>ShopDemo</Text>
            <Text style={styles.tagline}>Welcome Back</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#555"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {loading ? (
              <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 24 }} />
            ) : (
              <TouchableOpacity style={styles.btn} onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.btnText}>Login</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Register</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  header: { alignItems: 'center', marginBottom: 36 },
  appTitle: { fontSize: 30, fontWeight: '800', color: '#c9a84c', letterSpacing: 1 },
  tagline: { fontSize: 14, color: '#888', marginTop: 6 },

  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#e0e0e0', marginBottom: 20 },

  label: { fontSize: 13, color: '#888', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#e0e0e0',
    fontSize: 15,
  },

  btn: {
    backgroundColor: '#c9a84c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },

  error: { color: '#e05c5c', fontSize: 13, marginBottom: 8 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { color: '#666', fontSize: 14 },
  link: { color: '#c9a84c', fontSize: 14, fontWeight: '600' },
});
