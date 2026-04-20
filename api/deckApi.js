// DeckAPI
// - Purpose: Centralized deck-related HTTP calls to the backend REST API.
// - Exports:
//    - getDeck(): GET /decks/:userID -> returns users deck
//    - createDeck(body): POST /decks -> creates new deck
//    - addCard(body): POST /decks/add -> Add a card to a deck (userId, cardName, deckName, quantity)
//    - deleteDeck: DELETE /decks/delete -> deletes deck
//    - deleteCard: DELETE /decks/remove -> removes card from deck
//    - updateDeck(): PUT /decks/update -> Rename a deck or change its format
//    - priceDeck(body): POST /decks/price -> Get total price of a deck
//    - recommendDeck: POST /decks/recommend -> Get deck recommendations

import { BASE_URL as CONFIG_BASE_URL } from '../config';
import { getAuthHeaders } from './authToken';

const BASE_URL = CONFIG_BASE_URL || 'https://your-backend.example';

async function getDeck(userId) {
  const res = await fetch(`${BASE_URL}/deck/${encodeURIComponent(userId)}`, {
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();
}

async function createDeck(body) {
  const res = await fetch(`${BASE_URL}/deck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}

async function addCard(body) {
  const res = await fetch(`${BASE_URL}/deck/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}

async function deleteDeck(body) {
  const res = await fetch(`${BASE_URL}/deck/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}

async function deleteCard(body) {
  const res = await fetch(`${BASE_URL}/deck/remove`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}

async function updateDeck(body) {
  const res = await fetch(`${BASE_URL}/deck/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}

async function priceDeck(body) {
  const res = await fetch(`${BASE_URL}/deck/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}

async function recommendDeck(body) {
  const res = await fetch(`${BASE_URL}/deck/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}

export default {
  getDeck,
  createDeck,
  addCard,
  deleteDeck,
  deleteCard,
  updateDeck,
  priceDeck,
  recommendDeck,
};
