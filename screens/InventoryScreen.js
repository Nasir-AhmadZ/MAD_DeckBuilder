import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProductItem from '../components/ProductItem';
import AddEditProduct from '../components/AddEditProduct';
import useProducts from '../hooks/useProducts';
import useNotifications from '../hooks/useNotifications';

export default function InventoryScreen() {
  const { products, loading, posting, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const { expoPushToken } = useNotifications();

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function saveProduct() {
    if (!name.trim()) return Alert.alert('Validation', 'Name is required');
    const parsedPrice = parseFloat(price);
    if (price && Number.isNaN(parsedPrice)) return Alert.alert('Validation', 'Price must be a number');

    try {
      const body = { name: name.trim(), price: price ? parsedPrice : undefined, description: description.trim(), image };
      if (editingId) {
        await updateProduct(editingId, body);
        setEditingId(null);
        Alert.alert('Success', 'Product updated');
      } else {
        await createProduct(body);
        if (expoPushToken) {
          fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: expoPushToken,
              title: 'Store updated',
              body: `${name.trim()} has been added. Browse the inventory to see the latest products!`,
            }),
          })
            .then(res => res.json())
            .then(data => console.log('[Push] Expo API response:', JSON.stringify(data)))
            .catch(err => console.error('[Push] Fetch error:', err));
        }
      }

      setName('');
      setPrice('');
      setDescription('');
      setImage(null);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  }

  function onEditPress(item) {
    setEditingId(item._id || item.id || null);
    setName(item.name || '');
    setPrice(item.price !== undefined && item.price !== null ? String(item.price) : '');
    setDescription(item.description || '');
    setImage(item.image || null);
  }

  function renderItem({ item }) {
    return <ProductItem item={item} onEdit={onEditPress} onDelete={deleteProduct} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Inventory</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item, idx) => item._id || item.id || String(idx)}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <AddEditProduct
              editingId={editingId}
              name={name}
              setName={setName}
              price={price}
              setPrice={setPrice}
              description={description}
              setDescription={setDescription}
              image={image}
              setImage={setImage}
              posting={posting}
              onSave={saveProduct}
              onRefresh={fetchProducts}
            />
            <Text style={styles.sectionHeader}>Products</Text>
            {loading && <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 20 }} />}
          </>
        }
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No products found.</Text> : null}
        contentContainerStyle={styles.listContent}
      />

      <StatusBar style="light" />
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

  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
    marginTop: 20,
    marginBottom: 8,
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },

  empty: { textAlign: 'center', color: '#555', marginTop: 20 },
});
