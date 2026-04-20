import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import useBasket from '../hooks/useBasket';
import useNotifications from '../hooks/useNotifications';
import authApi from '../api/authApi';
import deckApi from '../api/deckApi';
import { useAuth } from '../context/AuthContext';
import useGen from '../hooks/useGen';
import BottomSheet from '../components/BottomSheet';

function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
}

export default function HomeScreen({ navigation }) {
  const { basket, loadBasket } = useBasket('demo-user-1');
  const { expoPushToken } = useNotifications();
  const { token, logout } = useAuth();
  const userId = getUserIdFromToken(token);
  const hasSentPushToken = useRef(false);

  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [selectedDeckName, setSelectedDeckName] = useState('');
  const [alterPrompt, setAlterPrompt] = useState('');
  const [summaryVisible, setSummaryVisible] = useState(false);
  const { loadingAlter, alterResult, applyAlter } = useGen();

  async function loadDecks() {
    if (!userId) return;
    setLoadingDecks(true);
    try {
      const data = await deckApi.getDeck(userId);
      setDecks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load decks:', err);
    } finally {
      setLoadingDecks(false);
    }
  }

  async function handleAlter() {
    if (!selectedDeckName) return Alert.alert('Validation', 'Please select a deck first');
    await applyAlter(userId, selectedDeckName, alterPrompt);
    setSummaryVisible(true);
    loadDecks();
  }

  useEffect(() => {
    if (expoPushToken && !hasSentPushToken.current) {
      hasSentPushToken.current = true;
      authApi.postPushToken(expoPushToken)
        .then(() => console.log('[Auth] Push token registered with backend'))
        .catch(err => console.warn('[Auth] Push token registration failed:', err));
    }
  }, [expoPushToken]);

  useEffect(() => {
    loadBasket().catch(() => {});
    loadDecks();
    const unsubscribe = navigation.addListener('focus', () => {
      loadBasket().catch(() => {});
      loadDecks();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const itemCount = basket?.items?.length ?? 0;
    if (itemCount > 0) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Items in your basket',
          body: `You have ${itemCount} item(s) waiting — don't forget to checkout!`,
          channelId: 'default',
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
      });
    }
  }, [basket]);

  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.topBar}>
        <Text style={styles.appName}>ShopDemo</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>My Decks</Text>
        <Text style={styles.heroSub}>Tap a deck to view its cards</Text>
      </View>

      {loadingDecks ? (
        <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item, idx) => item._id || String(idx)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.empty}>No decks yet. Tap "+ New Deck" to create one.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.deckCard, selectedDeckName === item.deckName && styles.deckCardSelected]}
              onPress={() => navigation.navigate('DeckDetail', { deck: item })}
              onLongPress={() => setSelectedDeckName(item.deckName)}
              activeOpacity={0.8}
            >
              <View style={styles.deckInfo}>
                <Text style={styles.deckName}>{item.deckName}</Text>
                <Text style={styles.deckFormat}>{item.format}</Text>
              </View>
              <Text style={styles.deckCount}>{item.cards?.length ?? 0} cards</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.alterPanel}>
              <Text style={styles.alterTitle}>AI Deck Editor</Text>
              <Text style={styles.alterSub}>
                {selectedDeckName ? `Editing: ${selectedDeckName}` : 'Long-press a deck to select it'}
              </Text>
              <TextInput
                style={styles.alterInput}
                placeholder="e.g. make this deck more aggressive"
                placeholderTextColor="#555"
                value={alterPrompt}
                onChangeText={setAlterPrompt}
                multiline
              />
              <TouchableOpacity
                style={[styles.alterBtn, (!selectedDeckName || !alterPrompt.trim() || loadingAlter) && styles.alterBtnDisabled]}
                onPress={handleAlter}
                activeOpacity={0.8}
                disabled={!selectedDeckName || !alterPrompt.trim() || loadingAlter}
              >
                {loadingAlter
                  ? <ActivityIndicator color="#0d0d0d" />
                  : <Text style={styles.alterBtnText}>Apply Changes</Text>}
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('DeckBuild')} activeOpacity={0.8}>
          <Text style={styles.secondaryBtnText}>+ New Deck</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet visible={summaryVisible} onDismiss={() => setSummaryVisible(false)}>
        {alterResult && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.summaryTitle}>Changes Applied</Text>
            <Text style={styles.summarySub}>{alterResult.summary}</Text>

            {alterResult.applied?.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>Added / Removed</Text>
                {alterResult.applied.map((c, i) => (
                  <Text key={i} style={[styles.summaryItem, c.action === 'add' ? styles.summaryAdd : styles.summaryRemove]}>
                    {c.action === 'add' ? '+' : '-'} {c.quantity}x {c.cardName}
                  </Text>
                ))}
              </View>
            )}

            {alterResult.skipped?.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>Skipped</Text>
                {alterResult.skipped.map((c, i) => (
                  <Text key={i} style={styles.summarySkipped}>{c.cardName} — {c.reason}</Text>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSummaryVisible(false)} activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </BottomSheet>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1e1e2e',
  },
  appName: { fontSize: 18, fontWeight: '800', color: '#c9a84c', letterSpacing: 0.5 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: { color: '#888', fontSize: 13 },

  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderColor: '#2a2a4a',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#c9a84c', letterSpacing: 0.5 },
  heroSub: { fontSize: 12, color: '#666', marginTop: 6, letterSpacing: 1 },

  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },

  deckCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deckInfo: { flex: 1 },
  deckName: { fontSize: 16, fontWeight: '700', color: '#e0e0e0' },
  deckFormat: { fontSize: 12, color: '#c9a84c', marginTop: 4 },
  deckCount: { fontSize: 13, color: '#555' },

  empty: { textAlign: 'center', color: '#555', marginTop: 40 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0d0d0d',
    borderTopWidth: 1,
    borderColor: '#1e1e2e',
  },
  secondaryBtn: {
    backgroundColor: '#c9a84c',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

  deckCardSelected: { borderColor: '#c9a84c', borderWidth: 2 },

  alterPanel: {
    marginTop: 10,
    marginBottom: 120,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  alterTitle: { fontSize: 16, fontWeight: '800', color: '#c9a84c', marginBottom: 4 },
  alterSub: { fontSize: 12, color: '#666', marginBottom: 12 },
  alterInput: {
    backgroundColor: '#0d0d0d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    color: '#e0e0e0',
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  alterBtn: {
    backgroundColor: '#c9a84c',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  alterBtnDisabled: { opacity: 0.4 },
  alterBtnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 15 },

  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#c9a84c', marginBottom: 6 },
  summarySub: { fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 20 },
  summarySection: { marginBottom: 16 },
  summaryLabel: { fontSize: 12, color: '#555', fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  summaryItem: { fontSize: 14, marginBottom: 4 },
  summaryAdd: { color: '#4caf50' },
  summaryRemove: { color: '#e05c5c' },
  summarySkipped: { fontSize: 13, color: '#666', marginBottom: 4 },
});
