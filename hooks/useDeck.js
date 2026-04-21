import { useState } from 'react';
import { Alert } from 'react-native';
import deckApi from '../api/deckApi';
import cardApi from '../api/cardApi';

export default function useDeck(userId) {
  const [importing, setImporting] = useState(false);
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [removingCard, setRemovingCard] = useState(false);
  const [deletingDeck, setDeletingDeck] = useState(false);

  async function handleImportCard(importName, onSuccess) {
    if (!importName.trim()) return Alert.alert('Validation', 'Card name is required');
    setImporting(true);
    try {
      const result = await cardApi.importCard(importName.trim());
      Alert.alert('Success', `"${result.card?.name || importName.trim()}" imported to database`);
      onSuccess?.();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setImporting(false);
    }
  }

  async function handleCreateDeck(deckName, format, onSuccess) {
    if (!deckName.trim()) return Alert.alert('Validation', 'Deck name is required');
    setCreatingDeck(true);
    try {
      await deckApi.createDeck({ userId, deckName: deckName.trim(), format });
      Alert.alert('Success', `Deck "${deckName.trim()}" created`);
      onSuccess?.();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setCreatingDeck(false);
    }
  }

  async function handleAddCard(cardName, cardDeckName, quantity, onSuccess) {
    if (!cardName.trim() || !cardDeckName.trim()) return Alert.alert('Validation', 'Card name and deck name are required');
    const qty = parseInt(quantity) || 1;
    setAddingCard(true);
    try {
      await deckApi.addCard({ userId, cardName: cardName.trim(), deckName: cardDeckName.trim(), quantity: qty });
      Alert.alert('Success', `"${cardName.trim()}" added to "${cardDeckName.trim()}"`);
      onSuccess?.();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setAddingCard(false);
    }
  }

  async function handleRemoveCard(cardId, cardDeckName, onSuccess) {
    if (!cardId || !cardDeckName.trim()) return Alert.alert('Validation', 'Card ID and deck name are required');
    setRemovingCard(true);
    try {
      await deckApi.deleteCard({ userId, cardId, deckName: cardDeckName.trim() });
      Alert.alert('Success', `Card removed from "${cardDeckName.trim()}"`);
      onSuccess?.();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setRemovingCard(false);
    }
  }

  async function handleDeleteDeck(deckName, onSuccess) {
    setDeletingDeck(true);
    try {
      await deckApi.deleteDeck({ userId, deckName });
      Alert.alert('Success', `Deck "${deckName}" deleted`);
      onSuccess?.();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setDeletingDeck(false);
    }
  }

  return {
    importing,
    creatingDeck,
    addingCard,
    removingCard,
    deletingDeck,
    handleImportCard,
    handleCreateDeck,
    handleAddCard,
    handleRemoveCard,
    handleDeleteDeck,
  };
}
