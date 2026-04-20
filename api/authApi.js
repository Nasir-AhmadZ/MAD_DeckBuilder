// authApi
// - Purpose: Auth-related HTTP calls (login, register, push token registration).
// - Exports:
//    - login(email, password): POST /auth/login -> returns { token, ... }
//    - register(email, password): POST /auth/register -> returns { token, ... }
//    - postPushToken(expoPushToken): POST /auth/push-token (authenticated)

import { BASE_URL as CONFIG_BASE_URL } from '../config';
import { getAuthHeaders } from './authToken';

const BASE_URL = CONFIG_BASE_URL || 'https://your-backend.example';

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function register(email, username, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Register failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function postPushToken(expoPushToken) {
  const res = await fetch(`${BASE_URL}/auth/push-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ pushToken: expoPushToken }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Push token registration failed: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}

export default { login, register, postPushToken };
