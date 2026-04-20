import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import cardApi from '../api/cardApi';
import deckApi from '../api/deckApi';
import BottomSheet from '../components/BottomSheet';
import useGen from '../hooks/useGen';

export default function DeckDetailScreen({ route }) {
  const { deck } = route.params;
  const [cardMap, setCardMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [recomVisible, setRecomVisible] = useState(false);
  const { loadingRecom, recommendations, fetchDeckRecom } = useGen();

  useEffect(() => {
    const firstCard = deck.cards?.[0]?.card;
    const needsLookup = firstCard && typeof firstCard === 'string';
    if (!needsLookup) return;

    setLoading(true);
    cardApi.getCards()
      .then(all => {
        const map = {};
        all.forEach(c => { map[c._id] = c; });
        setCardMap(map);
      })
      .catch(err => console.warn('Failed to load card details:', err))
      .finally(() => setLoading(false));

    deckApi.priceDeck({ userId: deck.userId, deckName: deck.deckName })
      .then(res => setTotalPrice(res?.totalPrice ?? res?.total ?? null))
      .catch(err => console.warn('Failed to load deck price:', err));
  }, []);

  function resolveCard(item) {
    const cardId = typeof item.card === 'string' ? item.card : item.card?._id;
    return (typeof item.card === 'object' && item.card?.name) ? item.card : cardMap[cardId];
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.deckName}>{deck.deckName}</Text>
        <Text style={styles.deckFormat}>{deck.format}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={deck.cards}
          keyExtractor={(item, idx) => item._id || String(idx)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.empty}>No cards in this deck yet.</Text>}
          renderItem={({ item }) => {
            const card = resolveCard(item);
            const name = card?.name ?? 'Unknown Card';
            const type = card?.type ?? '';
            const manaCost = card?.manaCost ?? '';
            return (
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => setSelectedCard({ ...card, quantity: item.quantity })}
                activeOpacity={0.8}
              >
                {!!card?.imageUrl && (
                  <Image source={{ uri: card.imageUrl }} style={styles.cardThumb} />
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{name}</Text>
                  {!!type && <Text style={styles.cardType}>{type}</Text>}
                </View>
                <View style={styles.cardRight}>
                  {!!manaCost && <Text style={styles.manaCost}>{manaCost}</Text>}
                  <Text style={styles.quantity}>x{item.quantity}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {totalPrice != null && (
        <View style={styles.priceBar}>
          <Text style={styles.priceLabel}>Deck Total</Text>
          <Text style={styles.priceValue}>€{Number(totalPrice).toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.recomRow}>
        <TouchableOpacity
          style={styles.recomBtn}
          onPress={() => { setRecomVisible(true); fetchDeckRecom(deck.userId, deck.deckName); }}
          activeOpacity={0.8}
        >
          <Text style={styles.recomBtnText}>Recommendation</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet visible={recomVisible} onDismiss={() => setRecomVisible(false)}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.recomTitle}>AI Recommendation</Text>
          {loadingRecom ? (
            <ActivityIndicator size="large" color="#c9a84c" style={{ marginVertical: 30 }} />
          ) : (
            <Text style={styles.recomText}>{recommendations ?? 'No recommendations yet.'}</Text>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setRecomVisible(false)} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={!!selectedCard} onDismiss={() => setSelectedCard(null)}>
        {selectedCard && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetName}>{selectedCard.name}</Text>
              {!!selectedCard.manaCost && <Text style={styles.sheetMana}>{selectedCard.manaCost}</Text>}
            </View>

            {!!selectedCard.type && <Text style={styles.sheetType}>{selectedCard.type}</Text>}

            {!!selectedCard.imageUrl && (
              <Image source={{ uri: selectedCard.imageUrl }} style={styles.sheetImage} resizeMode="contain" />
            )}

            {!!selectedCard.oracleText && (
              <View style={styles.oracleBox}>
                <Text style={styles.oracleText}>{selectedCard.oracleText}</Text>
              </View>
            )}

            <View style={styles.sheetMeta}>
              {!!selectedCard.price && <Text style={styles.metaItem}>Price: €{selectedCard.price}</Text>}
              <Text style={styles.metaItem}>In deck: x{selectedCard.quantity}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedCard(null)} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Close</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#1e1e2e',
  },
  deckName: { fontSize: 20, fontWeight: '800', color: '#c9a84c', letterSpacing: 0.5 },
  deckFormat: { fontSize: 12, color: '#666', marginTop: 4 },

  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  cardRow: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardThumb: { width: 40, height: 56, borderRadius: 4, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#e0e0e0' },
  cardType: { fontSize: 12, color: '#888', marginTop: 3 },
  cardRight: { alignItems: 'flex-end' },
  manaCost: { fontSize: 12, color: '#c9a84c', marginBottom: 4 },
  quantity: { fontSize: 14, fontWeight: '700', color: '#e0e0e0' },
  empty: { textAlign: 'center', color: '#555', marginTop: 40 },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  sheetName: { fontSize: 18, fontWeight: '800', color: '#c9a84c', flex: 1, marginRight: 10 },
  sheetMana: { fontSize: 14, color: '#c9a84c', fontWeight: '700' },
  sheetType: { fontSize: 13, color: '#888', marginBottom: 14 },
  sheetImage: { width: '100%', height: 280, borderRadius: 12, marginBottom: 14 },

  oracleBox: {
    backgroundColor: '#0d0d1a',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    marginBottom: 14,
  },
  oracleText: { fontSize: 14, color: '#e0e0e0', lineHeight: 22 },

  sheetMeta: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  metaItem: { fontSize: 13, color: '#666' },

  priceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#1e1e2e',
    backgroundColor: '#0d0d0d',
  },
  priceLabel: { fontSize: 14, color: '#888', fontWeight: '600' },
  priceValue: { fontSize: 18, fontWeight: '800', color: '#c9a84c' },

  recomRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0d0d0d',
  },
  recomBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c9a84c',
  },
  recomBtnText: { color: '#c9a84c', fontWeight: '800', fontSize: 15 },
  recomTitle: { fontSize: 18, fontWeight: '800', color: '#c9a84c', marginBottom: 14 },
  recomText: { fontSize: 14, color: '#e0e0e0', lineHeight: 22, marginBottom: 20 },

  closeBtn: {
    backgroundColor: '#c9a84c',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeBtnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 15 },
});
