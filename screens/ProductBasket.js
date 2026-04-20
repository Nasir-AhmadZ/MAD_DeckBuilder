import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useBasket from '../hooks/useBasket';

export default function ProductBasket({ route }) {
  const userId = route?.params?.userId || 'demo-user-1';
  const { basket, loading, total, loadBasket, changeQuantity, incrementQuantity } = useBasket(userId);

  useEffect(() => {
    loadBasket().catch(err => Alert.alert('Error', String(err)));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>My Basket</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>€{total}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={basket.items || []}
          keyExtractor={(i, idx) => i._id || i.product?._id || i.product?.id || String(idx)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.product?.name || 'Deleted product'}</Text>
                <Text style={styles.itemPrice}>€{item.product?.price ?? 0} × {item.quantity}</Text>
              </View>
              <View style={styles.controls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => changeQuantity(item).catch(err => Alert.alert('Error', String(err)))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => incrementQuantity(item).catch(err => Alert.alert('Error', String(err)))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => changeQuantity(item, true).catch(err => Alert.alert('Error', String(err)))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.empty}>Your basket is empty.</Text>}
        />
      )}
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
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#c9a84c', letterSpacing: 0.5 },
  totalBadge: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  totalText: { color: '#c9a84c', fontWeight: '700', fontSize: 14 },

  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  item: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  itemInfo: { marginBottom: 12 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#e0e0e0' },
  itemPrice: { fontSize: 13, color: '#888', marginTop: 4 },

  controls: { flexDirection: 'row', gap: 8 },
  qtyBtn: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  qtyBtnText: { color: '#e0e0e0', fontWeight: '700', fontSize: 16 },
  removeBtn: {
    backgroundColor: '#3a1a1a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#5a2a2a',
  },
  removeBtnText: { color: '#e05c5c', fontWeight: '700', fontSize: 13 },

  empty: { textAlign: 'center', color: '#555', marginTop: 40 },
});
