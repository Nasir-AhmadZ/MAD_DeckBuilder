import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import useDeck from '../hooks/useDeck';

const FORMATS = ['Commander', 'Standard'];

function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
}

export default function DeckBuildScreen() {
  const { token } = useAuth();
  const userId = getUserIdFromToken(token);

  const [deckName, setDeckName] = useState('');
  const [format, setFormat] = useState('Commander');

  const [importName, setImportName] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardDeckName, setCardDeckName] = useState('');
  const [quantity, setQuantity] = useState('1');

  const { importing, creatingDeck, addingCard, handleImportCard, handleCreateDeck, handleAddCard } = useDeck(userId);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Deck Builder</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Import Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Import Card to Database</Text>
          <Text style={styles.cardSubtitle}>Cards must be imported before adding to a deck</Text>

          <Text style={styles.label}>Card Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Import Card"
            placeholderTextColor="#555"
            value={importName}
            onChangeText={setImportName}
          />

          {importing ? (
            <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleImportCard(importName, () => setImportName(''))} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Import Card</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Create Deck */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create New Deck</Text>

          <Text style={styles.label}>Deck Name</Text>
          <TextInput
            style={styles.input}
            placeholder="My Deck"
            placeholderTextColor="#555"
            value={deckName}
            onChangeText={setDeckName}
          />

          <Text style={styles.label}>Format</Text>
          <View style={styles.formatRow}>
            {FORMATS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.formatBtn, format === f && styles.formatBtnActive]}
                onPress={() => setFormat(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.formatBtnText, format === f && styles.formatBtnTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {creatingDeck ? (
            <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleCreateDeck(deckName, format, () => setDeckName(''))} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>+ Create Deck</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Add Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Card to Deck</Text>

          <Text style={styles.label}>Card Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#555"
            value={cardName}
            onChangeText={setCardName}
          />

          <Text style={styles.label}>Deck Name</Text>
          <TextInput
            style={styles.input}
            placeholder="My Deck"
            placeholderTextColor="#555"
            value={cardDeckName}
            onChangeText={setCardDeckName}
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#555"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          {addingCard ? (
            <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleAddCard(cardName, cardDeckName, quantity, () => { setCardName(''); setQuantity('1'); })} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Add Card</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },

  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1e1e2e',
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#c9a84c', letterSpacing: 0.5 },

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#e0e0e0', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#666', marginBottom: 4 },

  label: { fontSize: 13, color: '#888', marginTop: 14, marginBottom: 6 },
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

  formatRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  formatBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0d0d1a',
  },
  formatBtnActive: { backgroundColor: '#c9a84c', borderColor: '#c9a84c' },
  formatBtnText: { color: '#888', fontWeight: '700', fontSize: 14 },
  formatBtnTextActive: { color: '#0d0d0d' },

  primaryBtn: {
    backgroundColor: '#c9a84c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});
