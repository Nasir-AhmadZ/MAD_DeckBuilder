import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function ProductItem({ item, onEdit, onDelete, onAdd }) {
  const onDeletePress = () => {
    const id = item._id || item.id;
    Alert.alert(
      'Delete product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(id);
              Alert.alert('Deleted', 'Product removed');
            } catch (err) {
              Alert.alert('Error', String(err));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.name || 'Unnamed'}</Text>
      {item.price !== undefined && item.price !== null ? (
        <Text style={styles.itemPrice}>€{item.price}</Text>
      ) : null}
      {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}

      <View style={styles.itemButtons}>
        {onAdd ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => { try { onAdd(item._id || item.id); } catch (err) { Alert.alert('Error', String(err)); } }}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>Add to Basket</Text>
          </TouchableOpacity>
        ) : null}

        {onEdit ? (
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        ) : null}

        {onDelete ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDeletePress} activeOpacity={0.8}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#e0e0e0' },
  itemPrice: { color: '#c9a84c', fontWeight: '600', marginTop: 4, fontSize: 14 },
  itemDesc: { color: '#888', marginTop: 6, fontSize: 13 },
  image: { width: 100, height: 100, borderRadius: 8, marginTop: 10 },

  itemButtons: { flexDirection: 'row', marginTop: 14, gap: 8, flexWrap: 'wrap' },

  addBtn: {
    backgroundColor: '#c9a84c',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 13 },

  editBtn: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnText: { color: '#e0e0e0', fontWeight: '700', fontSize: 13 },

  deleteBtn: {
    backgroundColor: '#3a1a1a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#5a2a2a',
  },
  deleteBtnText: { color: '#e05c5c', fontWeight: '700', fontSize: 13 },
});
