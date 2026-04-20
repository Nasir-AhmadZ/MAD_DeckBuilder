import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ImagePickerButton from './ImagePickerButton';

export default function AddEditProduct({
  editingId,
  name,
  setName,
  price,
  setPrice,
  description,
  setDescription,
  image,
  setImage,
  posting,
  onSave,
  onRefresh,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>{editingId ? 'Edit Product' : 'Add Product'}</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} placeholder="Product name" placeholderTextColor="#555" value={name} onChangeText={setName} />

      <Text style={styles.label}>Price (optional)</Text>
      <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#555" value={price} onChangeText={setPrice} keyboardType="numeric" />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Product description" placeholderTextColor="#555" value={description} onChangeText={setDescription} multiline />

      <ImagePickerButton image={image} onChange={setImage} disabled={posting} />

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.saveBtn, posting && styles.disabled]}
          onPress={onSave}
          disabled={posting}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>
            {posting ? (editingId ? 'Saving...' : 'Adding...') : (editingId ? 'Save' : 'Add Product')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} activeOpacity={0.8}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#e0e0e0', marginBottom: 12 },

  label: { fontSize: 13, color: '#888', marginBottom: 6, marginTop: 10 },
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
  textArea: { minHeight: 60, textAlignVertical: 'top' },

  buttonsRow: { flexDirection: 'row', marginTop: 16, gap: 10 },

  saveBtn: {
    flex: 1,
    backgroundColor: '#c9a84c',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 14 },

  refreshBtn: {
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  refreshBtnText: { color: '#e0e0e0', fontWeight: '700', fontSize: 14 },

  disabled: { opacity: 0.5 },
});
