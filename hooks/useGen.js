import { useState } from 'react';
import { Alert } from 'react-native';
import genApi from '../api/genApi';

export default function useGen() {
  const [loadingRecom, setLoadingRecom] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingAlter, setLoadingAlter] = useState(false);
  const [alterResult, setAlterResult] = useState(null);

  async function fetchDeckRecom(userId, deckName) {
    if (!userId || !deckName) return Alert.alert('Validation', 'userId and deckName are required');
    setLoadingRecom(true);
    setRecommendations(null);
    try {
      const result = await genApi.deckRecom({ userId, deckName });
      setRecommendations(result?.recommendations ?? null);
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoadingRecom(false);
    }
  }

  async function applyAlter(userId, deckName, userPrompt) {
    if (!userId || !deckName || !userPrompt?.trim()) return Alert.alert('Validation', 'userId, deckName and a prompt are required');
    setLoadingAlter(true);
    setAlterResult(null);
    try {
      const result = await genApi.recomAlter({ userId, deckName, userPrompt: userPrompt.trim() });
      setAlterResult(result);
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoadingAlter(false);
    }
  }

  return {
    loadingRecom,
    recommendations,
    fetchDeckRecom,
    loadingAlter,
    alterResult,
    applyAlter,
  };
}
