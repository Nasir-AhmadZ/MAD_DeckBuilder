import { BASE_URL as CONFIG_BASE_URL } from '../config';
import { getAuthHeaders } from './authToken';

const BASE_URL = CONFIG_BASE_URL || 'https://your-backend.example';

async function getCards() {
  const res = await fetch(`${BASE_URL}/cards`, {
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();
}

async function importCard(cardName) {
  const res = await fetch(`${BASE_URL}/cards/${encodeURIComponent(cardName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...getAuthHeaders() },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  return res.json();
}

export default { getCards, importCard };
