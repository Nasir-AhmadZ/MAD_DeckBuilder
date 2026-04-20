// GenAPI
// - Purpose: Centralized AI generation HTTP calls to the backend REST API.
// - Exports:
//    - deckRecom(body): POST /gen/recommend -> Get AI deck recommendations ({ userId, deckName })
//    - recomAlter(body): POST /gen/recomalter -> Apply AI-driven card changes to a deck ({ userId, deckName, userPrompt })

import { BASE_URL as CONFIG_BASE_URL } from '../config';
import { getAuthHeaders } from './authToken';

const BASE_URL = CONFIG_BASE_URL || 'https://your-backend.example';

async function deckRecom(body) {
  const res = await fetch(`${BASE_URL}/gen/recommend`, {
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

async function recomAlter(body) {
  const res = await fetch(`${BASE_URL}/gen/recomalter`, {
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

export default { deckRecom, recomAlter };
